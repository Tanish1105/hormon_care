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

  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const doctor = await prisma.user.upsert({
    where: { username: "doctor" },
    update: { password: doctorPassword, role: "DOCTOR", name: "Dr. Clinic" },
    create: {
      username: "doctor",
      password: doctorPassword,
      role: "DOCTOR",
      name: "Dr. Clinic",
    },
  });
  console.log("Doctor: doctor / doctor123");

  const staffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.upsert({
    where: { username: "staff" },
    update: {
      password: staffPassword,
      role: "DOCTOR_STAFF",
      name: "Clinic Staff",
      doctorId: doctor.id,
    },
    create: {
      username: "staff",
      password: staffPassword,
      role: "DOCTOR_STAFF",
      name: "Clinic Staff",
      doctorId: doctor.id,
    },
  });
  console.log("Staff: staff / staff123");

  const dietPassword = await bcrypt.hash("diet123", 10);
  await prisma.user.upsert({
    where: { username: "dietitian" },
    update: { password: dietPassword, role: "DIETITIAN", name: "Dietitian" },
    create: {
      username: "dietitian",
      password: dietPassword,
      role: "DIETITIAN",
      name: "Dietitian",
    },
  });
  console.log("Dietitian: dietitian / diet123");

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
                        section: "EXERCISE",
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

  const supplementCount = await prisma.supplement.count();
  if (supplementCount === 0) {
    await prisma.supplement.createMany({
      data: [
        { name: "Folic Acid", defaultTime: "Morning", defaultQuantity: "1 tablet", sortOrder: 1 },
        { name: "Vitamin D", defaultTime: "After lunch", defaultQuantity: "1 capsule", sortOrder: 2 },
        { name: "Iron", defaultTime: "After dinner", defaultQuantity: "1 tablet", sortOrder: 3 },
        { name: "Calcium", defaultTime: "Night", defaultQuantity: "1 tablet", sortOrder: 4 },
        { name: "Vitamin B12", defaultTime: "Morning", defaultQuantity: "1 tablet", sortOrder: 5 },
        { name: "Omega-3", defaultTime: "After breakfast", defaultQuantity: "1 capsule", sortOrder: 6 },
      ],
    });
    console.log("Default supplement catalog created");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
