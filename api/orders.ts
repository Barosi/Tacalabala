
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

    // Se è un drop futuro, prezzo pieno (o bloccato, ma qui assumiamo acquistabile se arrivato al backend)
    if (product.drop_date && new Date(product.drop_date) > now) {
        return originalPrice;
    }

    const applicableDiscounts = discounts.filter(d => {
        const start = new Date(d.start_date);
        const end = new Date(d.end_date);
        const isActiveTime = now >= start && now <= end;
        if (!isActiveTime || !d.is_active) return false;
        
        if (d.target_type === 'all') return true;
        
        // Parsing target_product_ids se è stringa o array
        let targetIds = d.target_product_ids;
        if (typeof targetIds === 'string') {
            try { targetIds = JSON.parse(targetIds); } catch(e) { targetIds = []; }
        }
        
        if (d.target_type === 'specific' && Array.isArray(targetIds) && targetIds.includes(product.id)) return true;
        return false;
    });

    if (applicableDiscounts.length > 0) {
        // Applica lo sconto migliore
        const bestDiscount = applicableDiscounts.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
        const discountAmount = (originalPrice * bestDiscount.percentage) / 100;
        return originalPrice - discountAmount;
    }

    return originalPrice;
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
              ...o,
              total: Number(o.total),
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

  // POST: Create Order (SECURE SERVER-SIDE CALCULATION)
  if (req.method === 'POST') {
      const client = await pool.connect();
      try {
          const { customerEmail, customerName, shippingAddress, items, invoiceDetails } = req.body;
          
          if (!items || items.length === 0) {
              return res.status(400).json({ error: 'Carrello vuoto' });
          }

          await client.query('BEGIN');

          // 1. Fetch Configs (Shipping & Discounts)
          const settingsRes = await client.query("SELECT * FROM app_settings WHERE key IN ('shipping')");
          const discountsRes = await client.query("SELECT * FROM discounts");
          
          let shippingConfig = { italyPrice: 10, italyThreshold: 100, foreignPrice: 25, foreignThreshold: 200 };
          const shippingRow = settingsRes.rows.find((r: any) => r.key === 'shipping');
          if (shippingRow) shippingConfig = shippingRow.value;

          const activeDiscounts = discountsRes.rows;

          // 2. Fetch Products involved in the order to get REAL prices
          const productIds = items.map((i: any) => i.id);
          // Usa ANY per array in postgres
          const productsRes = await client.query('SELECT * FROM products WHERE id = ANY($1)', [productIds]);
          const dbProducts = productsRes.rows;

          let calculatedSubtotal = 0;
          const verifiedItems = [];

          // 3. Loop items, Validate Stock, Calculate Price
          for (const item of items) {
              // SECURITY CHECK: Quantità deve essere positiva intera
              if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                  throw new Error(`Quantità non valida per articolo ${item.id}`);
              }

              const dbProduct = dbProducts.find((p: any) => p.id === item.id);
              
              if (!dbProduct) {
                  throw new Error(`Prodotto ${item.title} non più disponibile.`);
              }

              if (dbProduct.is_sold_out) {
                   throw new Error(`Prodotto ${dbProduct.title} è esaurito.`);
              }

              // ATOMIC STOCK CHECK & UPDATE
              // Decrementa stock SOLO se stock >= quantity. Restituisce rowCount.
              const stockUpdateRes = await client.query(
                  `UPDATE product_variants 
                   SET stock = stock - $1 
                   WHERE product_id = $2 AND size = $3 AND stock >= $1`,
                  [item.quantity, item.id, item.selectedSize]
              );

              if (stockUpdateRes.rowCount === 0) {
                  throw new Error(`Taglia ${item.selectedSize} esaurita per ${dbProduct.title}. Rimuovilo dal carrello.`);
              }

              // Prezzo reale dal DB
              const realUnitPrice = calculateServerPrice(dbProduct, activeDiscounts);
              calculatedSubtotal += realUnitPrice * item.quantity;

              verifiedItems.push({
                  ...item,
                  finalPrice: realUnitPrice,
                  title: dbProduct.title // Usa titolo dal DB per sicurezza
              });
          }

          // 4. Calculate Shipping
          const isItaly = shippingAddress.toLowerCase().includes('italia') || shippingAddress.toLowerCase().includes('italy');
          let shippingCost = 0;
          
          // Logica semplificata basata sulla stringa indirizzo
          if (isItaly) {
              shippingCost = calculatedSubtotal >= shippingConfig.italyThreshold ? 0 : shippingConfig.italyPrice;
          } else {
              shippingCost = calculatedSubtotal >= shippingConfig.foreignThreshold ? 0 : shippingConfig.foreignPrice;
          }

          const grandTotal = calculatedSubtotal + shippingCost;

          // 5. Insert Order
          const newOrderId = await generateNextOrderId(client);

          await client.query(
              `INSERT INTO orders (id, customer_email, customer_name, shipping_address, total, shipping_cost, status, date, invoice_tax_id, invoice_vat_number, invoice_sdi_code)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [newOrderId, customerEmail, customerName, shippingAddress, grandTotal, shippingCost, 'pending', new Date().toISOString(), 
               invoiceDetails?.taxId, invoiceDetails?.vatNumber, invoiceDetails?.sdiCode]
          );

          // 6. Insert Order Items
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
          // Restituisci l'errore specifico (es. Stock esaurito) al frontend
          return res.status(400).json({ error: e.message || 'Errore durante la creazione dell\'ordine.' });
      } finally {
          client.release();
      }
  }

  // PATCH: Update Status and Tracking
  if (req.method === 'PATCH') {
      const { id, status, trackingCode, courier } = req.body;
      try {
          if (status === 'shipped' && trackingCode) {
               await pool.query(
                   'UPDATE orders SET status = $1, tracking_code = $2, courier = $3 WHERE id = $4', 
                   [status, trackingCode, courier, id]
               );
          } else {
               await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
          }
          return res.status(200).json({ success: true });
      } catch (e) {
          return res.status(500).json({ error: 'Failed to update status' });
      }
  }

  // DELETE: Remove Order
  if (req.method === 'DELETE') {
      const { id } = req.query;
      try {
          await pool.query('DELETE FROM orders WHERE id = $1', [id]);
          return res.status(200).json({ success: true });
      } catch (e) {
          return res.status(500).json({ error: 'Failed to delete order' });
      }
  }
}
