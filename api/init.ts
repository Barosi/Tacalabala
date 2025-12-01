
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Fetch Products
    const { rows: productsRaw } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // 2. Fetch Variants for all products
    const { rows: variantsRaw } = await pool.query('SELECT * FROM product_variants');
    
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

    // 3. Fetch Settings (Shipping, Support, etc.)
    const { rows: settingsRaw } = await pool.query('SELECT * FROM app_settings');
    const settingsMap: any = {};
    settingsRaw.forEach(s => { settingsMap[s.key] = s.value; });

    // 4. Fetch FAQs
    const { rows: faqs } = await pool.query('SELECT * FROM faqs');

    // 5. Fetch Active Discounts
    const { rows: discounts } = await pool.query('SELECT * FROM discounts WHERE is_active = true');

    return res.status(200).json({
        products,
        shippingConfig: settingsMap['shipping'] || null,
        supportConfig: {
            whatsappNumber: settingsMap['support']?.whatsappNumber || '',
            faqs: faqs
        },
        discounts
    });

  } catch (error) {
    console.error('Init API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
