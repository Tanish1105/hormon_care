import { prisma } from "@/lib/prisma";

let cachedCompulsory: { value: boolean; at: number } | null = null;
const SETTINGS_TTL_MS = 60_000;

export async function getFollowupCompulsory() {
  if (cachedCompulsory && Date.now() - cachedCompulsory.at < SETTINGS_TTL_MS) {
    return cachedCompulsory.value;
  }

  const settings = await prisma.appSetting.findUnique({ where: { id: "default" } });
  const value = settings?.followupCompulsory ?? true;
  cachedCompulsory = { value, at: Date.now() };
  return value;
}

export async function setFollowupCompulsory(compulsory: boolean) {
  cachedCompulsory = null;
  return prisma.appSetting.upsert({
    where: { id: "default" },
    create: { id: "default", followupCompulsory: compulsory },
    update: { followupCompulsory: compulsory },
  });
}
