
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateNextId(client: any, table: string, prefix: string): Promise<string> {
    const res = await client.query(`SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`);
    if (res.rows.length === 0) return `${prefix}-001`;
    const lastId = res.rows[0].id;
    const match = lastId.match(new RegExp(`${prefix}-(\\d+)`));
    if (!match) return `${prefix}-${Date.now()}`;
    const nextNum = parseInt(match[1]) + 1;
    return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const { type, data } = req.body;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Gestione Configurazioni salvate come JSON in app_settings
            if (['shipping', 'stripe', 'emailjs', 'support'].includes(type)) {
                await client.query(
                    `INSERT INTO app_settings (key, value) VALUES ($1, $2) 
                     ON CONFLICT (key) DO UPDATE SET value = $2`,
                    [type, JSON.stringify(data)]
                );
                await client.query('COMMIT');
                return res.status(200).json({ success: true });
            }

            // Gestione FAQ
            if (type === 'faq_add') {
                const newId = await generateNextId(client, 'faqs', 'FAQ');
                await client.query('INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)', [newId, data.question, data.answer]);
                await client.query('COMMIT');
                return res.status(200).json({ success: true, id: newId });
            }
            if (type === 'faq_delete') {
                await client.query('DELETE FROM faqs WHERE id = $1', [data.id]);
                await client.query('COMMIT');
                return res.status(200).json({ success: true });
            }

            // Gestione Sconti
            if (type === 'discount_add') {
                const newId = await generateNextId(client, 'discounts', 'DSC');
                await client.query(
                    `INSERT INTO discounts (id, name, percentage, start_date, end_date, target_type, target_product_ids, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [newId, data.name, data.percentage, data.startDate, data.endDate, data.targetType, JSON.stringify(data.targetProductIds), data.isActive]
                );
                await client.query('COMMIT');
                return res.status(200).json({ success: true, id: newId });
            }
            if (type === 'discount_delete') {
                await client.query('DELETE FROM discounts WHERE id = $1', [data.id]);
                await client.query('COMMIT');
                return res.status(200).json({ success: true });
            }

        } catch (e: any) {
            await client.query('ROLLBACK');
            console.error('Settings API Error:', e);
            return res.status(500).json({ error: 'Settings update failed', details: e.message });
        } finally {
            client.release();
        }
    }
    return res.status(405).end();
}
