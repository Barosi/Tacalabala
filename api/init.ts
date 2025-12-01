
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

    // 3. Fetch Settings (Shipping, Support, etc.) - Optional
    const settingsMap: any = {};
    try {
        const { rows: settingsRaw } = await pool.query('SELECT * FROM app_settings');
        settingsRaw.forEach(s => { settingsMap[s.key] = s.value; });
    } catch (e) { console.warn("Settings table missing", e); }

    // 4. Fetch FAQs - Optional
    let faqs: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM faqs');
        faqs = res.rows;
    } catch (e) { console.warn("FAQs table missing", e); }

    // 5. Fetch Active Discounts - Optional
    let discounts: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM discounts WHERE is_active = true');
        discounts = res.rows;
    } catch (e) { console.warn("Discounts table missing", e); }

    return res.status(200).json({
        products,
        shippingConfig: settingsMap['shipping'] || null,
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
