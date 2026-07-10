import { PrismaClient } from "@/generated/prisma/client";
import { createMysqlAdapter } from "@/lib/mysql-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: number;
};

// Bump when schema changes so dev hot-reload picks up new Prisma client
const PRISMA_SCHEMA_VERSION = 11;

function createPrismaClient() {
  return new PrismaClient({ adapter: createMysqlAdapter() });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  return client;
}

// Lazy proxy so importing this module during `next build` does not require DATABASE_URL.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
