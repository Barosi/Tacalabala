
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

    // 0.1 Ensure FAQs table exists and default 11 tactical questions exist
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS faqs (
                id TEXT PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL
            )
        `);

        const faqCount = await pool.query('SELECT COUNT(*) FROM faqs');
        if (parseInt(faqCount.rows[0].count) === 0) {
            const defaultFaqs = [
                { id: '1', q: 'Quali sono i tempi di spedizione?', a: 'Spediamo in 24/48 ore lavorative in tutta Italia tramite corriere espresso. Appena il pacco parte, riceverai il tracking. Per l\'estero i tempi variano dai 3 ai 7 giorni lavorativi.' },
                { id: '2', q: 'Posso effettuare un reso?', a: 'Certamente. In conformità con la legge, hai 14 giorni dalla ricezione del pacco per richiedere il reso, purché il capo sia integro, non lavato e con etichetta. Le spese di spedizione del reso sono a carico del cliente.' },
                { id: '3', q: 'Che materiali utilizzate?', a: 'Utilizziamo cotone premium e tessuti tecnici traspiranti di alta qualità. I nostri capi sono selezionati per garantire comfort, durata nel tempo e un feeling autentico da stadio.' },
                { id: '4', q: 'Come vestono le maglie?', a: 'Le nostre maglie hanno generalmente un fit moderno, leggermente "boxy" o regular a seconda del modello. Consigliamo di consultare la guida alle taglie nella pagina prodotto, ma in genere la tua taglia abituale è perfetta per un look rilassato.' },
                { id: '5', q: 'Quali metodi di pagamento accettate?', a: 'Accettiamo tutte le principali Carte di Credito (Visa, Mastercard, Amex), PayPal, Apple Pay e Google Pay. Tutte le transazioni sono criptate e sicure al 100% tramite protocollo SSL.' },
                { id: '6', q: 'Emettete fattura?', a: 'Sì, è possibile richiedere la fattura in fase di checkout. Assicurati di compilare i campi opzionali "Partita IVA" e "Codice SDI" o "PEC" prima di concludere l\'ordine.' },
                { id: '7', q: 'Come traccio il mio ordine?', a: 'Appena il tuo ordine verrà affidato al corriere, riceverai una email automatica con il link per il tracciamento. Potrai seguire il percorso del pacco in tempo reale fino alla consegna.' },
                { id: '8', q: 'Come lavare i capi?', a: 'Per preservare le stampe e la qualità del tessuto, consigliamo vivamente il lavaggio a freddo (30°C) al rovescio. Non stirare mai direttamente sulle stampe grafiche e non utilizzare l\'asciugatrice.' },
                { id: '9', q: 'Spedite all\'estero?', a: 'Sì, spediamo in tutta Europa e nei principali paesi extra-UE. I costi di spedizione vengono calcolati automaticamente al checkout in base al paese di destinazione inserito.' },
                { id: '10', q: 'Quando tornano i prodotti esauriti?', a: 'Molte delle nostre collezioni sono in edizione limitata o "drop". Se un prodotto è Sold Out, spesso non viene ristampato per mantenere l\'esclusività. Iscriviti alla newsletter per non perdere i prossimi lanci.' },
                { id: '11', q: 'Cos\'è Tacalabala?', a: 'Siamo un brand indipendente nato a Milano che fonde la cultura calcistica storica con l\'estetica streetwear contemporanea. Non vendiamo repliche, ma creazioni originali ispirate alla passione nerazzurra.' }
            ];

            for (const faq of defaultFaqs) {
                await pool.query('INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)', [faq.id, faq.q, faq.a]);
            }
            console.log("Default FAQs populated.");
        }
    } catch (e) { console.warn("FAQ table setup failed", e); }


    // 1. Fetch Products
    const { rows: productsRaw } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // 2. Fetch Variants for all products
    let variantsRaw: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM product_variants');
        variantsRaw = res.rows;
    } catch (e) { console.warn("Variants table missing or empty", e); }
    
    // Merge variants into products and MAP SNAKE_CASE TO CAMELCASE
    const products = productsRaw.map(p => {
        const pVariants = variantsRaw.filter(v => v.product_id === p.id);
        const sizeString = pVariants.map((v: any) => v.size).join(' - ');
        const priceFormatted = `€${Number(p.price).toString()}`;
        
        return {
            id: p.id,
            articleCode: p.article_code,
            title: p.title,
            brand: p.brand,
            kitType: p.kit_type,
            year: p.year,
            season: p.season,
            price: priceFormatted,
            imageUrl: p.image_url, // CRITICAL FIX: Map snake_case from DB to camelCase for Frontend
            condition: p.condition,
            description: p.description,
            isSoldOut: p.is_sold_out,
            tags: p.tags,
            instagramUrl: p.instagram_url,
            dropDate: p.drop_date,
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
        const res = await pool.query('SELECT * FROM faqs ORDER BY length(id), id ASC'); 
        faqs = res.rows;
    } catch (e) { console.warn("FAQs table missing", e); }

    // 5. Fetch Active Discounts
    let discounts: any[] = [];
    try {
        const res = await pool.query('SELECT * FROM discounts ORDER BY id ASC');
        discounts = res.rows.map(d => ({
            id: d.id,
            name: d.name,
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
