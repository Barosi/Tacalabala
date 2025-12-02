
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
    // 0. Ensure USERS table exists
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
            await pool.query(`
                INSERT INTO users (id, username, password, email, role)
                VALUES ('USR-001', 'admin', 'password123', 'admin@tacalabala.it', 'admin')
            `);
        }
    } catch (e) { console.warn("User table setup failed", e); }

    // 0.1 Ensure FAQs table
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS faqs (
                id TEXT PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL
            )
        `);
        // (Popolamento default rimosso per brevità, resta uguale a prima se vuoto)
    } catch (e) { console.warn("FAQ table setup failed", e); }

    // 0.2 Update Orders table schema
    try {
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS tracking_code TEXT,
            ADD COLUMN IF NOT EXISTS courier TEXT
        `);
    } catch (e) { console.warn("Orders table schema update failed", e); }

    // 0.3 Update Products table schema for Multi-Images
    try {
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS images TEXT
        `);
        // Nota: images sarà un JSON string array
    } catch (e) { console.warn("Products table schema update failed", e); }

    // 0.4 Update Discounts table schema for Coupons
    try {
        await pool.query(`
            ALTER TABLE discounts 
            ADD COLUMN IF NOT EXISTS code TEXT,
            ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'automatic'
        `);
    } catch (e) { console.warn("Discounts table schema update failed", e); }


    // 1. Fetch Products
    const { rows: productsRaw } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // 2. Fetch Variants
    let variantsRaw: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM product_variants');
        variantsRaw = res.rows;
    } catch (e) { console.warn("Variants table missing or empty", e); }
    
    const products = productsRaw.map(p => {
        const pVariants = variantsRaw.filter(v => v.product_id === p.id);
        const priceFormatted = `€${Number(p.price).toString()}`;
        
        let imagesArray: string[] = [];
        if (p.images) {
            try { imagesArray = JSON.parse(p.images); } catch(e) { imagesArray = [p.image_url]; }
        } else {
            imagesArray = [p.image_url];
        }

        return {
            id: p.id,
            articleCode: p.article_code,
            title: p.title,
            brand: p.brand,
            kitType: p.kit_type,
            year: p.year,
            season: p.season,
            price: priceFormatted,
            imageUrl: p.image_url, 
            images: imagesArray,
            condition: p.condition,
            description: p.description,
            isSoldOut: p.is_sold_out,
            tags: p.tags,
            instagramUrl: p.instagram_url,
            dropDate: p.drop_date,
            variants: pVariants.map((v: any) => ({ size: v.size, stock: v.stock }))
        };
    });

    // 3. Fetch Settings
    const settingsMap: any = {};
    try {
        const { rows: settingsRaw } = await pool.query('SELECT * FROM app_settings');
        settingsRaw.forEach(s => { settingsMap[s.key] = s.value; });
    } catch (e) { console.warn("Settings table missing", e); }

    // 4. Fetch FAQs
    let faqs: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM faqs ORDER BY length(id), id ASC'); 
        faqs = res.rows;
    } catch (e) { console.warn("FAQs table missing", e); }

    // 5. Fetch Discounts
    let discounts: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM discounts ORDER BY id ASC');
        discounts = res.rows.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code,
            discountType: d.discount_type || 'automatic',
            percentage: d.percentage,
            targetProductIds: typeof d.target_product_ids === 'string' ? JSON.parse(d.target_product_ids) : d.target_product_ids,
            startDate: d.start_date, 
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
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
