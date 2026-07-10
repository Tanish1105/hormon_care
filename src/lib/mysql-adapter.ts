import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function env(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  return raw.trim().replace(/^["']|["']$/g, "");
}

function configFromParts() {
  const host = env("DB_HOST");
  const user = env("DB_USER");
  const password = env("DB_PASSWORD");
  const database = env("DB_NAME");
  if (!host || !user || !password || !database) return null;

  return {
    host,
    port: Number(env("DB_PORT") ?? 3306),
    user,
    password,
    database,
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 2),
    minimumIdle: 0,
    idleTimeout: 30_000,
    connectTimeout: 10_000,
    acquireTimeout: 15_000,
  };
}

function configFromUrl() {
  const url = env("DATABASE_URL");
  if (!url) return null;

  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 2),
    minimumIdle: 0,
    idleTimeout: 30_000,
    connectTimeout: 10_000,
    acquireTimeout: 15_000,
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

export function createMysqlAdapter() {
  return new PrismaMariaDb(getMysqlConfig());
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
      connectTimeout: 10_000,
    });
    await conn.query("SELECT 1");
    return { ok: true as const, host: config.host, database: config.database };
  } finally {
    await conn?.end().catch(() => undefined);
  }
}
