import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { getSqliteDb, sqlitePool, sqliteQuery } from "./sqliteDb";

dotenv.config();

let pool: mysql.Pool | null = null;
let isMysqlActive = false;
let isConnected = false;

export function getMysqlPool(): mysql.Pool | null {
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
      console.warn(`[MySQL Pool] Failed to create connection pool: ${err.message}`);
      pool = null;
      return null;
    }
  }

  return null;
}

export function getDbPool(): any {
  if (isMysqlActive && pool) {
    return pool;
  }
  return sqlitePool;
}

export async function testConnection(): Promise<boolean> {
  const p = getMysqlPool();
  if (p) {
    try {
      const conn = await p.getConnection();
      isMysqlActive = true;
      isConnected = true;
      conn.release();
      console.log("[Database] Active engine: MySQL");
      return true;
    } catch (err: any) {
      console.warn(`[MySQL Pool] Connection test failed: ${err.message}. Falling back to embedded database.`);
      isMysqlActive = false;
    }
  }

  // Fallback to SQLite persistent database
  try {
    getSqliteDb();
    isMysqlActive = false;
    isConnected = true;
    console.log("[Database] Active engine: SQLite (persistent embedded)");
    return true;
  } catch (err: any) {
    console.error(`[Database Error] Failed to initialize embedded database: ${err.message}`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function isMysql(): boolean {
  return isMysqlActive;
}

export async function query<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  if (isMysqlActive && pool) {
    return await pool.query(sql, params) as [T, any];
  }
  return sqliteQuery<T>(sql, params);
}

export async function execute<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  if (isMysqlActive && pool) {
    return await pool.execute(sql, params) as [T, any];
  }
  return sqliteQuery<T>(sql, params);
}

