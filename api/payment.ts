
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import Stripe from 'stripe';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Missing Order ID' });

    const client = await pool.connect();

    try {
        // 1. Recupera configurazione Stripe dal DB
        const settingsRes = await client.query("SELECT value FROM app_settings WHERE key = 'stripe'");
        if (settingsRes.rows.length === 0) throw new Error("Stripe not configured");
        
        const stripeConfig = settingsRes.rows[0].value;
        if (!stripeConfig.secretKey) throw new Error("Stripe Secret Key missing");

        const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2025-11-17.clover' });

        // 2. Recupera l'ordine dal DB (fonte di verità per il prezzo)
        const orderRes = await client.query('SELECT total, id, customer_email FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) throw new Error("Order not found");
        
        const order = orderRes.rows[0];
        const amountInCents = Math.round(Number(order.total) * 100);

        // 3. Crea PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: { enabled: true },
            receipt_email: order.customer_email,
            metadata: {
                orderId: order.id
            }
        });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (e: any) {
        console.error("Payment Intent Error:", e);
        return res.status(500).json({ error: e.message || 'Payment initialization failed' });
    } finally {
        client.release();
    }
}
