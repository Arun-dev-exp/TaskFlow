import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

// Load environment variables from parent directory
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') });

// Database configuration from environment variables
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
};


// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', (client) => {
  console.log(' New client connected to database');
});

pool.on('error', (err, client) => {
  console.error(' Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(' Database connection successful');
    console.log(` Connected to: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
};

// Initialize database tables (run this once)
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Check if tables exist
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log(' Initializing database tables...');
      
      // Read and execute schema.sql
      const fs = await import('fs');
      const path = await import('path');
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      
      try {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSQL);
        console.log('Database tables initialized successfully');
      } catch (schemaErr) {
        console.error('Error reading schema file:', schemaErr.message);
        console.log('Please run the schema.sql file manually in your database');
      }
    } else {
      console.log('Database tables already exist');
    }
    
    client.release();
  } catch (err) {
    console.error(' Error initializing database:', err.message);
  }
};

// Export default pool for direct use
export default pool;
