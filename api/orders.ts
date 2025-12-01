
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  
  // GET: List Orders (For Admin)
  if (req.method === 'GET') {
      try {
          const { rows: orders } = await pool.query('SELECT * FROM orders ORDER BY date DESC');
          const { rows: items } = await pool.query('SELECT * FROM order_items');
          
          const fullOrders = orders.map(o => ({
              ...o,
              total: Number(o.total),
              items: items.filter(i => i.order_id === o.id).map(i => ({
                  cartId: i.id, // Mock for type compatibility
                  title: i.product_title,
                  price: `€${i.product_price}`,
                  selectedSize: i.selected_size,
                  quantity: i.quantity,
                  // Minimal fields to satisfy CartItem type
                  id: i.product_id, imageUrl: '', season: '' 
              })),
              invoiceDetails: (o.invoice_tax_id) ? {
                  taxId: o.invoice_tax_id,
                  vatNumber: o.invoice_vat_number,
                  sdiCode: o.invoice_sdi_code
              } : undefined
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
          const order = req.body;
          await client.query('BEGIN');

          // 1. Insert Order
          await client.query(
              `INSERT INTO orders (id, customer_email, customer_name, shipping_address, total, shipping_cost, status, date, invoice_tax_id, invoice_vat_number, invoice_sdi_code)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [order.id, order.customerEmail, order.customerName, order.shippingAddress, order.total, order.shippingCost, 'paid', new Date().toISOString(), 
               order.invoiceDetails?.taxId, order.invoiceDetails?.vatNumber, order.invoiceDetails?.sdiCode]
          );

          // 2. Insert Items & Update Stock
          for (const item of order.items) {
              const priceNum = parseFloat(item.price.replace('€', '').replace(',', '.'));
              
              // Add Item Record
              await client.query(
                  `INSERT INTO order_items (order_id, product_id, product_title, product_price, selected_size, quantity)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
                  [order.id, item.id, item.title, priceNum, item.selectedSize, item.quantity]
              );

              // Decrement Stock
              await client.query(
                  `UPDATE product_variants SET stock = stock - $1 WHERE product_id = $2 AND size = $3`,
                  [item.quantity, item.id, item.selectedSize]
              );
          }

          await client.query('COMMIT');
          return res.status(201).json({ success: true });
      } catch (e) {
          await client.query('ROLLBACK');
          console.error(e);
          return res.status(500).json({ error: 'Failed to create order' });
      } finally {
          client.release();
      }
  }

  // PATCH: Update Status
  if (req.method === 'PATCH') {
      const { id, status } = req.body;
      try {
          await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
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
