import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

export function getMysqlPool(): mysql.Pool {
  if (pool) return pool;

  const host = process.env.DB_HOST || "127.0.0.1";
  const user = process.env.DB_USER || "root";
  const database = process.env.DB_NAME || "roozzero_academy";
  const password = process.env.DB_PASSWORD || "";
  const port = parseInt(process.env.DB_PORT || "3306", 10);

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    namedPlaceholders: true
  });

  return pool;
}

export function getDbPool(): mysql.Pool {
  return getMysqlPool();
}

export async function testConnection(): Promise<boolean> {
  try {
    const p = getMysqlPool();
    const conn = await p.getConnection();
    isConnected = true;
    conn.release();
    console.log(`[Database] MySQL connection established on ${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || "3306"} (${process.env.DB_NAME || "roozzero_academy"})`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.error(`[Database Error] MySQL connection failed: ${err.message}`);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function isMysql(): boolean {
  return true;
}

export async function query<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  const p = getMysqlPool();
  return await p.query(sql, params) as [T, any];
}

export async function execute<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  const p = getMysqlPool();
  return await p.execute(sql, params) as [T, any];
}
