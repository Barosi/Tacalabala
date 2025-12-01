
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper per generare ID incrementale TC-XXX
async function generateNextProductId(client: any): Promise<string> {
    const res = await client.query('SELECT id FROM products ORDER BY id DESC LIMIT 1');
    if (res.rows.length === 0) return 'TC-001';
    
    const lastId = res.rows[0].id; // Es: TC-042
    // Estrai parte numerica
    const match = lastId.match(/TC-(\d+)/);
    if (!match) return `TC-${Date.now()}`; // Fallback se formato diverso
    
    const nextNum = parseInt(match[1]) + 1;
    return `TC-${nextNum.toString().padStart(3, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const client = await pool.connect();
    try {
        const p = req.body;
        await client.query('BEGIN');

        // Genera ID Incrementale
        const newId = await generateNextProductId(client);
        const articleCode = p.articleCode || `${newId}-ART`; // Default SKU if missing

        const priceNum = parseFloat(p.price.replace('€', '').replace(',', '.').trim());
        
        await client.query(
            `INSERT INTO products (id, article_code, title, brand, kit_type, year, season, price, image_url, condition, description, is_sold_out, tags, instagram_url, drop_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [newId, articleCode, p.title, p.brand, p.kitType, p.year, p.season, priceNum, p.imageUrl, p.condition, p.description, p.isSoldOut, p.tags, p.instagramUrl, p.dropDate || null]
        );

        // Insert Variants
        if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
                await client.query(
                    'INSERT INTO product_variants (product_id, size, stock) VALUES ($1, $2, $3)',
                    [newId, v.size, v.stock]
                );
            }
        }

        await client.query('COMMIT');
        
        // Ritorna il prodotto creato con il nuovo ID per aggiornare lo store frontend
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
