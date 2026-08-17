import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dns from "node:dns";

// Node 17+ prefers IPv6; Hostinger Remote MySQL allowlists are usually IPv4.
dns.setDefaultResultOrder("ipv4first");

function env(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

function normalizeMysqlHost(host: string) {
  // Hostinger/MariaDB often grants users for 127.0.0.1, not IPv6 ::1.
  return host === "localhost" ? "127.0.0.1" : host;
}

function configFromParts() {
  const host = env("DB_HOST");
  const user = env("DB_USER");
  const password = env("DB_PASSWORD");
  const database = env("DB_NAME");
  if (!host || !user || !password || !database) return null;

  return {
    host: normalizeMysqlHost(host),
    port: Number(env("DB_PORT") ?? 3306),
    user,
    password,
    database,
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 3),
  };
}

function configFromUrl() {
  const url = env("DATABASE_URL");
  if (!url) return null;

  const parsed = new URL(url);
  return {
    host: normalizeMysqlHost(parsed.hostname),
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 3),
  };
}

export function getMysqlConfig() {
  const config = configFromParts() ?? configFromUrl();
  if (!config) {
    throw new Error(
      "Database not configured. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (recommended on Hostinger) or DATABASE_URL."
    );
  }
  return config;
}

export function buildMysqlConnectionUrl() {
  const config = getMysqlConfig();
  const auth = `${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}`;
  const params = new URLSearchParams({
    allowPublicKeyRetrieval: "true",
    connectionLimit: String(config.connectionLimit),
    connectTimeout: "10000",
    acquireTimeout: "10000",
  });
  return `mariadb://${auth}@${config.host}:${config.port}/${config.database}?${params.toString()}`;
}

export function createMysqlAdapter() {
  const config = getMysqlConfig();
  // Object config keeps special characters in the password (e.g. @) intact.
  return new PrismaMariaDb({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit,
    allowPublicKeyRetrieval: true,
    connectTimeout: 8_000,
    acquireTimeout: 8_000,
    family: 4,
  });
}

export async function testMysqlConnection() {
  const config = getMysqlConfig();
  const mariadb = await import("mariadb");
  let conn;
  try {
    conn = await mariadb.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      allowPublicKeyRetrieval: true,
      connectTimeout: 10_000,
      family: 4,
    });
    await conn.query("SELECT 1");
    return { ok: true as const, host: config.host, database: config.database };
  } finally {
    await conn?.end().catch(() => undefined);
  }
}
