// config/db.js
import pg from 'pg';
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If we have a DATABASE_URL and it's a cloud DB, configuration is required
  ssl: {
    // This bypasses the self-signed certificate error
    rejectUnauthorized: false 
  }
});

export default pool;