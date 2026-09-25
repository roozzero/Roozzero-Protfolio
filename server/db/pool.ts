import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

export function getDbPool(): mysql.Pool | null {
  if (pool) return pool;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;
  const password = process.env.DB_PASSWORD || "";
  const port = parseInt(process.env.DB_PORT || "3306", 10);

  if (host && user && database) {
    try {
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        namedPlaceholders: true
      });
      return pool;
    } catch (err: any) {
      console.error(`[MySQL Pool] Failed to create connection pool: ${err.message}`);
      pool = null;
      return null;
    }
  }

  return null;
}

export async function testConnection(): Promise<boolean> {
  const p = getDbPool();
  if (!p) {
    isConnected = false;
    return false;
  }

  try {
    const conn = await p.getConnection();
    isConnected = true;
    conn.release();
    return true;
  } catch (err: any) {
    console.error(`[MySQL Pool] Connection test failed: ${err.message}`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function query<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  const p = getDbPool();
  if (!p) {
    throw new Error("Database not connected. Please configure DB_HOST, DB_USER, DB_NAME in .env");
  }
  return await p.query(sql, params) as [T, any];
}

export async function execute<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  const p = getDbPool();
  if (!p) {
    throw new Error("Database not connected. Please configure DB_HOST, DB_USER, DB_NAME in .env");
  }
  return await p.execute(sql, params) as [T, any];
}
