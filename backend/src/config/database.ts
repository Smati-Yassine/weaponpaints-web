import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  enableKeepAlive: boolean;
  keepAliveInitialDelay: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cs2_server',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection health
 * @returns Promise<boolean> - true if connection is healthy
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Initialize database connection with retry logic
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in milliseconds
 */
export async function initializeDatabase(
  maxRetries: number = 5,
  retryDelay: number = 3000
): Promise<void> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const isHealthy = await testConnection();
      if (isHealthy) {
        console.log('✓ Database connection established successfully');
        console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`  Database: ${dbConfig.database}`);
        return;
      }
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries}/${maxRetries} failed:`, error);

      if (retries < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection pool:', error);
    throw error;
  }
}

/**
 * Get database connection pool
 */
export function getPool() {
  return pool;
}

export default pool;
