import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function getMysqlConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure MySQL.");
  }

  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 2),
    minimumIdle: 0,
    idleTimeout: 30_000,
    connectTimeout: 15_000,
    acquireTimeout: 30_000,
  };
}

export function createMysqlAdapter() {
  return new PrismaMariaDb(getMysqlConfig());
}
