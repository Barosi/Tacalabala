
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper per generare ID ordine incrementale ORD-XXX
async function generateNextOrderId(client: any): Promise<string> {
    const res = await client.query('SELECT id FROM orders ORDER BY id DESC LIMIT 1');
    if (res.rows.length === 0) return 'ORD-001';
    
    const lastId = res.rows[0].id;
    const match = lastId.match(/ORD-(\d+)/);
    if (!match) return `ORD-${Date.now()}`;
    
    const nextNum = parseInt(match[1]) + 1;
    return `ORD-${nextNum.toString().padStart(3, '0')}`;
}

// Helper per calcolare il prezzo scontato lato server
function calculateServerPrice(product: any, discounts: any[]) {
    const originalPrice = parseFloat(product.price.toString().replace('€', '').replace(',', '.').trim());
    const now = new Date();

    // Se è un drop futuro, prezzo pieno
    if (product.drop_date && new Date(product.drop_date) > now) {
        return originalPrice;
    }

    const applicableDiscounts = discounts.filter(d => {
        const start = new Date(d.start_date);
        const end = new Date(d.end_date);
        const isActiveTime = now >= start && now <= end;
        if (!isActiveTime || !d.is_active) return false;
        
        if (d.target_type === 'all') return true;
        
        // Parsing target_product_ids
        let targetIds = d.target_product_ids;
        if (typeof targetIds === 'string') {
            try { targetIds = JSON.parse(targetIds); } catch(e) { targetIds = []; }
        }
        
        if (d.target_type === 'specific' && Array.isArray(targetIds) && targetIds.includes(product.id)) return true;
        return false;
    });

    if (applicableDiscounts.length > 0) {
        const bestDiscount = applicableDiscounts.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
        const discountAmount = (originalPrice * bestDiscount.percentage) / 100;
        return originalPrice - discountAmount;
    }

    return originalPrice;
}

// Helper per RIPRISTINARE lo stock
async function restoreStockForOrder(client: any, orderId: string) {
    // 1. Prendi gli items dell'ordine
    const resItems = await client.query('SELECT product_id, selected_size, quantity FROM order_items WHERE order_id = $1', [orderId]);
    const items = resItems.rows;

    for (const item of items) {
        // Incrementa lo stock
        await client.query(
            `UPDATE product_variants 
             SET stock = stock + $1 
             WHERE product_id = $2 AND size = $3`,
            [item.quantity, item.product_id, item.selected_size]
        );
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  
  // GET: List Orders (For Admin)
  if (req.method === 'GET') {
      try {
          const { rows: orders } = await pool.query('SELECT * FROM orders ORDER BY date DESC');
          
          let items: any[] = [];
          try {
             const resItems = await pool.query('SELECT * FROM order_items');
             items = resItems.rows;
          } catch(e) { console.warn("Order items missing", e); }
          
          const fullOrders = orders.map(o => ({
              id: o.id,
              customerEmail: o.customer_email,
              customerName: o.customer_name,
              shippingAddress: o.shipping_address,
              total: Number(o.total),
              shippingCost: o.shipping_cost,
              status: o.status,
              date: o.date,
              items: items.filter(i => i.order_id === o.id).map(i => ({
                  cartId: i.id, 
                  title: i.product_title,
                  price: `€${Number(i.product_price).toFixed(2)}`,
                  selectedSize: i.selected_size,
                  quantity: i.quantity,
                  id: i.product_id, imageUrl: '', season: '' 
              })),
              invoiceDetails: (o.invoice_tax_id) ? {
                  taxId: o.invoice_tax_id,
                  vatNumber: o.invoice_vat_number,
                  sdiCode: o.invoice_sdi_code
              } : undefined,
              trackingCode: o.tracking_code,
              courier: o.courier
          }));
          return res.status(200).json(fullOrders);
      } catch (e) {
          return res.status(500).json({ error: 'Failed to list orders' });
      }
  }

  // POST: Create Order
  if (req.method === 'POST') {
      const client = await pool.connect();
      try {
          const { customerEmail, customerName, shippingAddress, items, invoiceDetails } = req.body;
          
          if (!items || items.length === 0) {
              return res.status(400).json({ error: 'Carrello vuoto' });
          }

          await client.query('BEGIN');

          const settingsRes = await client.query("SELECT * FROM app_settings WHERE key IN ('shipping')");
          const discountsRes = await client.query("SELECT * FROM discounts");
          
          let shippingConfig = { italyPrice: 10, italyThreshold: 100, foreignPrice: 25, foreignThreshold: 200 };
          const shippingRow = settingsRes.rows.find((r: any) => r.key === 'shipping');
          if (shippingRow) shippingConfig = shippingRow.value;

          const activeDiscounts = discountsRes.rows;
          const productIds = items.map((i: any) => i.id);
          const productsRes = await client.query('SELECT * FROM products WHERE id = ANY($1)', [productIds]);
          const dbProducts = productsRes.rows;

          let calculatedSubtotal = 0;
          const verifiedItems = [];

          for (const item of items) {
              if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                  throw new Error(`Quantità non valida per articolo ${item.id}`);
              }

              const dbProduct = dbProducts.find((p: any) => p.id === item.id);
              if (!dbProduct) throw new Error(`Prodotto ${item.title} non disponibile.`);
              if (dbProduct.is_sold_out) throw new Error(`Prodotto ${dbProduct.title} esaurito.`);

              const stockUpdateRes = await client.query(
                  `UPDATE product_variants 
                   SET stock = stock - $1 
                   WHERE product_id = $2 AND size = $3 AND stock >= $1`,
                  [item.quantity, item.id, item.selectedSize]
              );

              if (stockUpdateRes.rowCount === 0) {
                  throw new Error(`Taglia ${item.selectedSize} esaurita per ${dbProduct.title}.`);
              }

              const realUnitPrice = calculateServerPrice(dbProduct, activeDiscounts);
              calculatedSubtotal += realUnitPrice * item.quantity;

              verifiedItems.push({
                  ...item,
                  finalPrice: realUnitPrice,
                  title: dbProduct.title
              });
          }

          const isItaly = shippingAddress.toLowerCase().includes('italia') || shippingAddress.toLowerCase().includes('italy');
          let shippingCost = 0;
          if (isItaly) {
              shippingCost = calculatedSubtotal >= shippingConfig.italyThreshold ? 0 : shippingConfig.italyPrice;
          } else {
              shippingCost = calculatedSubtotal >= shippingConfig.foreignThreshold ? 0 : shippingConfig.foreignPrice;
          }

          const grandTotal = calculatedSubtotal + shippingCost;
          const newOrderId = await generateNextOrderId(client);

          await client.query(
              `INSERT INTO orders (id, customer_email, customer_name, shipping_address, total, shipping_cost, status, date, invoice_tax_id, invoice_vat_number, invoice_sdi_code)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [newOrderId, customerEmail, customerName, shippingAddress, grandTotal, shippingCost, 'pending', new Date().toISOString(), 
               invoiceDetails?.taxId, invoiceDetails?.vatNumber, invoiceDetails?.sdiCode]
          );

          for (const item of verifiedItems) {
              await client.query(
                  `INSERT INTO order_items (order_id, product_id, product_title, product_price, selected_size, quantity)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
                  [newOrderId, item.id, item.title, item.finalPrice, item.selectedSize, item.quantity]
              );
          }

          await client.query('COMMIT');
          return res.status(201).json({ success: true, id: newOrderId, total: grandTotal });

      } catch (e: any) {
          await client.query('ROLLBACK');
          console.error("Order failed:", e);
          return res.status(400).json({ error: e.message || 'Errore creazione ordine.' });
      } finally {
          client.release();
      }
  }

  // PATCH: Update Status
  if (req.method === 'PATCH') {
      const { id, status, trackingCode, courier } = req.body;
      const client = await pool.connect();
      try {
          await client.query('BEGIN');
          
          // Check previous status to handle restocking if cancelling
          const prevOrderRes = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
          if (prevOrderRes.rows.length === 0) throw new Error("Order not found");
          const prevStatus = prevOrderRes.rows[0].status;

          // Se passo a CANCELLED da uno stato che non è già cancelled, RESTOCK
          if (status === 'cancelled' && prevStatus !== 'cancelled') {
              await restoreStockForOrder(client, id);
          }

          if (status === 'shipped' && trackingCode) {
               await client.query(
                   'UPDATE orders SET status = $1, tracking_code = $2, courier = $3 WHERE id = $4', 
                   [status, trackingCode, courier, id]
               );
          } else {
               await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
          }

          await client.query('COMMIT');
          return res.status(200).json({ success: true });
      } catch (e) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update status' });
      } finally {
          client.release();
      }
  }

  // DELETE: Remove Order and RESTOCK
  if (req.method === 'DELETE') {
      const { id } = req.query;
      const client = await pool.connect();
      try {
          await client.query('BEGIN');
          
          // 1. Controlla lo stato per decidere se ripristinare lo stock
          const orderRes = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
          if (orderRes.rows.length > 0) {
              const status = orderRes.rows[0].status;
              // Se l'ordine non era già cancellato, ripristina lo stock prima di eliminare
              if (status !== 'cancelled') {
                  await restoreStockForOrder(client, id as string);
              }
          }

          await client.query('DELETE FROM orders WHERE id = $1', [id]);
          await client.query('COMMIT');
          return res.status(200).json({ success: true });
      } catch (e) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: 'Failed to delete order' });
      } finally {
          client.release();
      }
  }
}
