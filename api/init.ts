 
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

// Initialize Pool directly here to avoid module resolution issues on Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Explicit check to help debugging
  if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing");
      return res.status(500).json({ error: 'Configuration Error: DATABASE_URL is missing.' });
  }

  try {
    // 0. Ensure USERS table exists and default admin exists
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                role TEXT DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            // Create default admin: id USR-001
            await pool.query(`
                INSERT INTO users (id, username, password, email, role)
                VALUES ('USR-001', 'admin', 'password123', 'admin@tacalabala.it', 'admin')
            `);
            console.log("Default admin user created.");
        }
    } catch (e) { console.warn("User table setup failed", e); }


    // 1. Fetch Products
    const { rows: productsRaw } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // 2. Fetch Variants for all products (Safe query, returns empty if table missing)
    let variantsRaw: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM product_variants');
        variantsRaw = res.rows;
    } catch (e) { console.warn("Variants table missing or empty", e); }
    
    // Merge variants into products
    const products = productsRaw.map(p => {
        const pVariants = variantsRaw.filter(v => v.product_id === p.id);
        const sizeString = pVariants.map((v: any) => v.size).join(' - ');
        // Convert decimal price back to string format for frontend "€45"
        const priceFormatted = `€${Number(p.price).toString()}`;
        
        return {
            ...p,
            price: priceFormatted,
            size: sizeString,
            variants: pVariants.map((v: any) => ({ size: v.size, stock: v.stock }))
        };
    });

    // 3. Fetch Settings (Shipping, Support, Stripe, EmailJS)
    const settingsMap: any = {};
    try {
        const { rows: settingsRaw } = await pool.query('SELECT * FROM app_settings');
        settingsRaw.forEach(s => { settingsMap[s.key] = s.value; });
    } catch (e) { console.warn("Settings table missing", e); }

    // 4. Fetch FAQs
    let faqs: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM faqs ORDER BY id ASC');
        faqs = res.rows;
    } catch (e) { console.warn("FAQs table missing", e); }

    // 5. Fetch Active Discounts
    let discounts: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM discounts ORDER BY id ASC');
        // Ensure target_product_ids is parsed if it comes as string/jsonb
        discounts = res.rows.map(d => ({
            ...d,
            targetProductIds: typeof d.target_product_ids === 'string' ? JSON.parse(d.target_product_ids) : d.target_product_ids,
            startDate: d.start_date, // Map snake_case to camelCase
            endDate: d.end_date,
            targetType: d.target_type,
            isActive: d.is_active
        }));
    } catch (e) { console.warn("Discounts table missing", e); }

    return res.status(200).json({
        products,
        shippingConfig: settingsMap['shipping'] || null,
        stripeConfig: settingsMap['stripe'] || null,
        mailConfig: settingsMap['emailjs'] || null,
        supportConfig: {
            whatsappNumber: settingsMap['support']?.whatsappNumber || '',
            faqs: faqs
        },
        discounts
    });

  } catch (error: any) {
    console.error('Init API Error:', error);
    // Return detailed error for debugging purposes
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
