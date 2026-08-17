import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { supplementPlanInclude } from "@/lib/supplements";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const plans = await prisma.patientSupplementPlan.findMany({
    where: { patientProfileId: profile.id },
    include: supplementPlanInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    plans,
    activePlan: plans.find((plan) => plan.isActive) ?? null,
  });
}
