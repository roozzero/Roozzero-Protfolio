import mysql from "mysql2/promise";
import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let mysqlPool: mysql.Pool | null = null;
let sqliteDb: DatabaseSync | null = null;
let usingSqlite = false;
let isConnected = false;

function getSqliteDb(): DatabaseSync {
  if (sqliteDb) return sqliteDb;
  const dbDir = path.join(process.cwd(), "database");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "roozzero_academy.sqlite");
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec("PRAGMA journal_mode = WAL;");
  sqliteDb.exec("PRAGMA foreign_keys = OFF;");
  return sqliteDb;
}

function translateMysqlToSqliteStatements(rawSql: string): string[] {
  const trimmed = rawSql.trim();
  if (!trimmed) return [];

  const upper = trimmed.toUpperCase();
  if (upper.startsWith("SET NAMES") || upper.startsWith("SET FOREIGN_KEY_CHECKS")) {
    return [];
  }

  // Handle ALTER TABLE statements (including multi-column ADD COLUMN in 002_courses_extension.sql)
  if (upper.startsWith("ALTER TABLE")) {
    const tableMatch = trimmed.match(/^ALTER\s+TABLE\s+`?(\w+)`?/i);
    if (!tableMatch) return [];
    const tableName = tableMatch[1];
    const body = trimmed.slice(tableMatch[0].length);
    const results: string[] = [];

    const addColRegex = /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s+([^,;]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = addColRegex.exec(body)) !== null) {
      const colName = match[1];
      let colDef = match[2]
        .replace(/\bAFTER\s+`?\w+`?/gi, "")
        .replace(/\bDEFAULT\s+\(UUID\(\)\)/gi, "DEFAULT ''")
        .replace(/\bENUM\s*\([^)]+\)/gi, "TEXT")
        .replace(/\bLONGTEXT\b/gi, "TEXT")
        .trim();
      results.push(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${colDef}`);
    }
    return results;
  }

  // Handle CREATE TABLE statements
  if (upper.startsWith("CREATE TABLE")) {
    let sql = trimmed
      .replace(/`\w+`\s+(?:INT|INTEGER|BIGINT)(?:\(\d+\))?(?:\s+UNSIGNED)?\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, (m) => {
        const col = m.match(/`(\w+)`/)?.[1] || "id";
        return `\`${col}\` INTEGER PRIMARY KEY AUTOINCREMENT`;
      })
      .replace(/\bENUM\s*\([^)]+\)/gi, "TEXT")
      .replace(/\bLONGTEXT\b/gi, "TEXT")
      .replace(/\bJSON\b/gi, "TEXT")
      .replace(/\bON\s+UPDATE\s+CURRENT_TIMESTAMP\b/gi, "")
      .replace(/\bDEFAULT\s+\(UUID\(\)\)/gi, "DEFAULT ''")
      .replace(/\bTIMESTAMP\s+NULL\s+DEFAULT\s+NULL/gi, "TIMESTAMP DEFAULT NULL")
      .replace(/\)\s*ENGINE\s*=[\s\S]*$/i, ")");

    const lines = sql.split("\n");
    const filteredLines = lines.filter((line) => {
      const t = line.trim().toUpperCase();
      if (
        t.startsWith("INDEX ") ||
        t.startsWith("KEY ") ||
        t.startsWith("UNIQUE KEY ") ||
        t.startsWith("FULLTEXT KEY ")
      ) {
        return false;
      }
      return true;
    });

    sql = filteredLines.join("\n").replace(/,(\s*\)\s*)$/m, "$1");
    return [sql];
  }

  // Handle DML statements (SELECT, INSERT, UPDATE, DELETE)
  let dml = trimmed
    .replace(/\bNOW\(\)/gi, "CURRENT_TIMESTAMP")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, "INSERT OR IGNORE INTO");

  if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(dml)) {
    dml = dml
      .replace(/\bINSERT\s+INTO\b/i, "INSERT OR REPLACE INTO")
      .replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i, "");
  }

  return [dml];
}

function sanitizeParam(val: any): any {
  if (val === undefined) return null;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object" && val !== null && !(val instanceof Uint8Array)) {
    return JSON.stringify(val);
  }
  return val;
}

async function executeSqliteQuery<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  const db = getSqliteDb();
  const statements = translateMysqlToSqliteStatements(sql);
  if (statements.length === 0) {
    return [[] as unknown as T, {}];
  }

  const paramArray = Array.isArray(params) ? params.map(sanitizeParam) : [];

  let lastResult: any = [[], {}];
  for (const stmtSql of statements) {
    const isSelect = /^\s*(SELECT|PRAGMA|WITH)\b/i.test(stmtSql);
    const isAlter = /^\s*ALTER\s+TABLE\b/i.test(stmtSql);
    try {
      const stmt = db.prepare(stmtSql);
      if (isSelect) {
        const rows = stmt.all(...paramArray);
        lastResult = [rows as unknown as T, []];
      } else {
        const res = stmt.run(...paramArray);
        lastResult = [
          {
            insertId: Number(res.lastInsertRowid || 0),
            affectedRows: Number(res.changes || 0)
          } as unknown as T,
          {}
        ];
      }
    } catch (err: any) {
      if (isAlter && /duplicate column name/i.test(err.message)) {
        continue;
      }
      throw err;
    }
  }

  return lastResult;
}

const adapterPoolProxy = {
  query: (sql: string, params?: any) => query(sql, params),
  execute: (sql: string, params?: any) => execute(sql, params),
  getConnection: async () => ({
    query: (sql: string, params?: any) => query(sql, params),
    execute: (sql: string, params?: any) => execute(sql, params),
    release: () => {}
  })
};

export function getMysqlPool(): mysql.Pool {
  if (usingSqlite) {
    return adapterPoolProxy as unknown as mysql.Pool;
  }
  if (mysqlPool) return mysqlPool;

  const host = process.env.DB_HOST || "127.0.0.1";
  const user = process.env.DB_USER || "root";
  const database = process.env.DB_NAME || "roozzero_academy";
  const password = process.env.DB_PASSWORD || "";
  const port = parseInt(process.env.DB_PORT || "3306", 10);

  mysqlPool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    connectTimeout: 2000,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    namedPlaceholders: true
  });

  return mysqlPool;
}

export function getDbPool(): mysql.Pool {
  return getMysqlPool();
}

export async function testConnection(): Promise<boolean> {
  try {
    const p = getMysqlPool();
    const conn = await p.getConnection();
    isConnected = true;
    usingSqlite = false;
    conn.release();
    console.log(`[Database] MySQL connection established on ${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || "3306"} (${process.env.DB_NAME || "roozzero_academy"})`);
    return true;
  } catch (mysqlErr: any) {
    const strictMysql = process.env.STRICT_MYSQL === "true" || process.env.NODE_ENV === "production" || Boolean(process.env.DB_HOST);
    if (strictMysql && process.env.ALLOW_SQLITE_FALLBACK !== "true") {
      isConnected = false;
      usingSqlite = false;
      console.error(`[Database Error] MySQL connection failed (${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || "3306"}): ${mysqlErr.message}`);
      return false;
    }

    try {
      console.warn(`[Database Notice] MySQL daemon unreachable (${mysqlErr.message}). Using local sandbox SQL engine.`);
      getSqliteDb();
      usingSqlite = true;
      isConnected = true;
      return true;
    } catch (sqliteErr: any) {
      isConnected = false;
      console.error(`[Database Error] Database initialization failed: ${sqliteErr.message}`);
      return false;
    }
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function isMysql(): boolean {
  return isConnected && !usingSqlite;
}

export function getDatabaseEngine(): "mysql" | "sqlite" | "disconnected" {
  if (!isConnected) return "disconnected";
  return usingSqlite ? "sqlite" : "mysql";
}

export async function query<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  if (!isConnected) {
    await testConnection();
  }
  if (usingSqlite) {
    return executeSqliteQuery<T>(sql, params);
  }
  const p = getMysqlPool();
  return await p.query(sql, params) as [T, any];
}

export async function execute<T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> {
  if (!isConnected) {
    await testConnection();
  }
  if (usingSqlite) {
    return executeSqliteQuery<T>(sql, params);
  }
  const p = getMysqlPool();
  return await p.execute(sql, params) as [T, any];
}
