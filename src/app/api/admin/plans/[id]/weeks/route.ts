import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { planInclude, createSingleWeekData } from "@/lib/plan-includes";

const MAX_WEEKS = 52;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { weeks: { select: { weekNumber: true }, orderBy: { weekNumber: "desc" }, take: 1 } },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  if (plan.totalWeeks >= MAX_WEEKS) {
    return NextResponse.json({ error: `Maximum ${MAX_WEEKS} weeks allowed` }, { status: 400 });
  }

  const nextWeekNumber = (plan.weeks[0]?.weekNumber ?? 0) + 1;

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      totalWeeks: nextWeekNumber,
      weeks: { create: createSingleWeekData(nextWeekNumber, plan.isDayWise) },
    },
    include: planInclude,
  });

  return NextResponse.json(updated);
}
