
import { Pool } from '@neondatabase/serverless';

// Initialize Pool. 
// Note: We do not throw error here if env is missing to avoid crashing the import.
// Connection errors will occur when query is attempted.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
