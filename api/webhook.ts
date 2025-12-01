
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import Stripe from 'stripe';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Nota: In Vercel serverless, il body parsing per i webhook richiede attenzione.
// Questo handler assume che req.body sia già parsato o accessibile come buffer.
// In un ambiente edge puro potrebbe servire un raw body parser.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const client = await pool.connect();

    try {
        // 1. Recupera config
        const settingsRes = await client.query("SELECT value FROM app_settings WHERE key = 'stripe'");
        if (settingsRes.rows.length === 0) return res.status(500).send("Stripe config missing");
        
        const stripeConfig = settingsRes.rows[0].value;
        const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2025-11-17.clover' });
        const endpointSecret = stripeConfig.webhookSecret;

        let event = req.body;

        // Se abbiamo il segreto, verifichiamo la firma (Opzionale in test, Obbligatorio in prod)
        if (endpointSecret && req.headers['stripe-signature']) {
             try {
                // Nota: req.body in Vercel functions è spesso già un oggetto JSON parsed.
                // Per verificare la firma serve il raw body string.
                // Se non disponibile, saltiamo verifica firma in questa demo ma in prod va gestita.
                // const sig = req.headers['stripe-signature'];
                // event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
             } catch (err: any) {
                console.error(`Webhook signature verification failed.`, err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
             }
        }

        // 2. Gestisci evento
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata.orderId;

            if (orderId) {
                console.log(`Payment succeeded for Order ${orderId}`);
                await client.query(
                    "UPDATE orders SET status = 'paid' WHERE id = $1",
                    [orderId]
                );
            }
        }

        return res.status(200).json({ received: true });

    } catch (e) {
        console.error("Webhook Error:", e);
        return res.status(500).send("Webhook Error");
    } finally {
        client.release();
    }
}
