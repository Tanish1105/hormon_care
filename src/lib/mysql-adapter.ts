import { PrismaMariaDb } from "@prisma/adapter-mariadb";

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
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 5),
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
    connectionLimit: Number(env("DATABASE_POOL_SIZE") ?? 5),
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
    connectTimeout: "60000",
    acquireTimeout: "60000",
  });
  return `mariadb://${auth}@${config.host}:${config.port}/${config.database}?${params.toString()}`;
}

export function createMysqlAdapter() {
  // PrismaMariaDb works reliably with a connection URL; object config can pool-timeout on Hostinger.
  return new PrismaMariaDb(buildMysqlConnectionUrl());
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
    });
    await conn.query("SELECT 1");
    return { ok: true as const, host: config.host, database: config.database };
  } finally {
    await conn?.end().catch(() => undefined);
  }
}
