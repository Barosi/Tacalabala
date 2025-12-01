
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const { type, data } = req.body;

        try {
            if (type === 'shipping') {
                await pool.query(
                    `INSERT INTO app_settings (key, value) VALUES ('shipping', $1) 
                     ON CONFLICT (key) DO UPDATE SET value = $1`,
                    [JSON.stringify(data)]
                );
            }
            if (type === 'faq_add') {
                await pool.query('INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)', [data.id, data.question, data.answer]);
            }
            if (type === 'faq_delete') {
                await pool.query('DELETE FROM faqs WHERE id = $1', [data.id]);
            }
            if (type === 'discount_add') {
                await pool.query(
                    `INSERT INTO discounts (id, name, percentage, start_date, end_date, target_type, target_product_ids, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [data.id, data.name, data.percentage, data.startDate, data.endDate, data.targetType, data.targetProductIds, data.isActive]
                );
            }
            if (type === 'discount_delete') {
                await pool.query('DELETE FROM discounts WHERE id = $1', [data.id]);
            }

            return res.status(200).json({ success: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Settings update failed' });
        }
    }
    return res.status(405).end();
}
