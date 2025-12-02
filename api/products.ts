
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateNextProductId(client: any): Promise<string> {
    const res = await client.query('SELECT id FROM products ORDER BY id DESC LIMIT 1');
    if (res.rows.length === 0) return 'TC-001';
    
    const lastId = res.rows[0].id; 
    const match = lastId.match(/TC-(\d+)/);
    if (!match) return `TC-${Date.now()}`; 
    
    const nextNum = parseInt(match[1]) + 1;
    return `TC-${nextNum.toString().padStart(3, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const client = await pool.connect();
    try {
        const p = req.body;
        await client.query('BEGIN');

        const newId = await generateNextProductId(client);
        // Article Code is now mandatory from frontend, but we keep fallback just in case
        const articleCode = p.articleCode || `${newId}-ART`; 

        const priceNum = parseFloat(p.price.replace('€', '').replace(',', '.').trim());
        
        // Serializza array immagini
        const imagesJson = JSON.stringify(p.images || [p.imageUrl]);

        await client.query(
            `INSERT INTO products (id, article_code, title, brand, kit_type, year, season, price, image_url, images, condition, description, is_sold_out, tags, instagram_url, drop_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [newId, articleCode, p.title, p.brand, p.kitType, p.year, p.season, priceNum, p.imageUrl, imagesJson, p.condition, p.description, p.isSoldOut, p.tags, p.instagramUrl, p.dropDate || null]
        );

        if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
                await client.query(
                    'INSERT INTO product_variants (product_id, size, stock) VALUES ($1, $2, $3)',
                    [newId, v.size, v.stock]
                );
            }
        }

        await client.query('COMMIT');
        
        return res.status(201).json({ success: true, product: { ...p, id: newId, articleCode } });
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

  // PATCH for Stock/Price Updates
  if (req.method === 'PATCH') {
      const { productId, size, stock, price, type } = req.body;
      try {
          // Type 'price' update
          if (type === 'price' && price) {
              const numericPrice = parseFloat(price.replace('€', '').replace(',', '.').trim());
              await pool.query('UPDATE products SET price = $1 WHERE id = $2', [numericPrice, productId]);
              return res.status(200).json({ success: true });
          }

          // Default: Update Stock (type 'stock' or undefined for backward compatibility)
          if (!type || type === 'stock') {
              // Update specific variant stock
              await pool.query(
                  'UPDATE product_variants SET stock = $1 WHERE product_id = $2 AND size = $3',
                  [stock, productId, size]
              );

              // Check if all variants are 0, then set is_sold_out = true
              const stockRes = await pool.query('SELECT stock FROM product_variants WHERE product_id = $1', [productId]);
              const totalStock = stockRes.rows.reduce((acc: number, row: any) => acc + row.stock, 0);
              
              await pool.query('UPDATE products SET is_sold_out = $1 WHERE id = $2', [totalStock === 0, productId]);

              return res.status(200).json({ success: true });
          }

          return res.status(400).json({ error: 'Invalid update type' });

      } catch (e) {
          console.error("Update failed:", e);
          return res.status(500).json({ error: 'Failed to update' });
      }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
