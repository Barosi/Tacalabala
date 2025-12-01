
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const { type, data } = req.body;

        try {
            // Gestione Configurazioni salvate come JSON in app_settings
            if (['shipping', 'stripe', 'emailjs', 'support'].includes(type)) {
                await pool.query(
                    `INSERT INTO app_settings (key, value) VALUES ($1, $2) 
                     ON CONFLICT (key) DO UPDATE SET value = $2`,
                    [type, JSON.stringify(data)]
                );
            }

            // Gestione FAQ (Tabella separata)
            if (type === 'faq_add') {
                await pool.query('INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)', [data.id, data.question, data.answer]);
            }
            if (type === 'faq_delete') {
                await pool.query('DELETE FROM faqs WHERE id = $1', [data.id]);
            }

            // Gestione Sconti (Tabella separata)
            if (type === 'discount_add') {
                await pool.query(
                    `INSERT INTO discounts (id, name, percentage, start_date, end_date, target_type, target_product_ids, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [data.id, data.name, data.percentage, data.startDate, data.endDate, data.targetType, JSON.stringify(data.targetProductIds), data.isActive]
                );
            }
            if (type === 'discount_delete') {
                await pool.query('DELETE FROM discounts WHERE id = $1', [data.id]);
            }

            return res.status(200).json({ success: true });
        } catch (e: any) {
            console.error('Settings API Error:', e);
            return res.status(500).json({ error: 'Settings update failed', details: e.message });
        }
    }
    return res.status(405).end();
}
