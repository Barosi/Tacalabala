
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const client = await pool.connect();
    try {
        const p = req.body;
        await client.query('BEGIN');

        // Insert Product
        const priceNum = parseFloat(p.price.replace('€', '').replace(',', '.').trim());
        
        await client.query(
            `INSERT INTO products (id, article_code, title, brand, kit_type, year, season, price, image_url, condition, description, is_sold_out, tags, instagram_url, drop_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [p.id, p.articleCode, p.title, p.brand, p.kitType, p.year, p.season, priceNum, p.imageUrl, p.condition, p.description, p.isSoldOut, p.tags, p.instagramUrl, p.dropDate || null]
        );

        // Insert Variants
        if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
                await client.query(
                    'INSERT INTO product_variants (product_id, size, stock) VALUES ($1, $2, $3)',
                    [p.id, v.size, v.stock]
                );
            }
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({ error: 'Failed to create product' });
    } finally {
        client.release();
    }
  }

  if (req.method === 'DELETE') {
      const { id } = req.query;
      try {
          await pool.query('DELETE FROM products WHERE id = $1', [id]);
          return res.status(200).json({ success: true });
      } catch (e) {
          return res.status(500).json({ error: 'Failed to delete' });
      }
  }

  // PATCH for Stock Updates
  if (req.method === 'PATCH') {
      const { productId, size, stock } = req.body;
      try {
          await pool.query(
              'UPDATE product_variants SET stock = $1 WHERE product_id = $2 AND size = $3',
              [stock, productId, size]
          );
          return res.status(200).json({ success: true });
      } catch (e) {
          return res.status(500).json({ error: 'Failed to update stock' });
      }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
