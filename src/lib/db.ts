
import { Pool } from '@neondatabase/serverless';

// Connessione al database Neon
// Assicurati che process.env.DATABASE_URL sia impostato su Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
