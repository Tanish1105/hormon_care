import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { createMysqlAdapter } from "../src/lib/mysql-adapter";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ adapter: createMysqlAdapter() });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: adminPassword,
      role: "ADMIN",
      name: "Dr. Admin",
    },
    create: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
      name: "Dr. Admin",
    },
  });

  console.log("Admin: admin / admin123");

  const existingPlan = await prisma.plan.findFirst({
    where: { title: "Pregnancy Care Plan - 2 Weeks" },
  });

  if (!existingPlan) {
    const plan = await prisma.plan.create({
      data: {
        title: "Pregnancy Care Plan - 2 Weeks",
        description: "Standard 2-week pregnancy care plan with weekly content",
        totalWeeks: 2,
        weeks: {
          create: Array.from({ length: 2 }, (_, wi) => ({
            weekNumber: wi + 1,
            title: wi === 0 ? "Week 1 - Getting Started" : "Week 2 - Light Movement",
            description: wi === 0 ? "Introduction to pregnancy care" : "Light exercises",
            contents:
              wi === 0
                ? {
                    create: [
                      {
                        type: "EXERCISE",
                        title: "Gentle Breathing Exercise",
                        description: "Daily breathing practice",
                        content:
                          "1. Sit comfortably\n2. Breathe in for 4 counts\n3. Hold 2 counts\n4. Breathe out 6 counts\n5. Repeat 10 times",
                        sortOrder: 0,
                      },
                    ],
                  }
                : undefined,
          })),
        },
      },
    });
    console.log("Sample plan created:", plan.title);
  }

  const existingGarbha = await prisma.garbhaPlan.findFirst({
    where: { title: "Garbh Sanskruti - 2 Weeks" },
  });

  if (!existingGarbha) {
    const garbha = await prisma.garbhaPlan.create({
      data: {
        title: "Garbh Sanskruti - 2 Weeks",
        description: "Garbh Sanskruti week-wise plan",
        totalWeeks: 2,
        weeks: {
          create: Array.from({ length: 2 }, (_, wi) => ({
            weekNumber: wi + 1,
            title: `Week ${wi + 1}`,
            contents:
              wi === 0
                ? {
                    create: [
                      {
                        type: "EXERCISE",
                        title: "Garbh Sanskruti Introduction",
                        content: "Sit calmly and meditate for 10 minutes",
                        sortOrder: 0,
                      },
                    ],
                  }
                : undefined,
          })),
        },
      },
    });
    console.log("Garbh Sanskruti plan created:", garbha.title);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
