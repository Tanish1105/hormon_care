import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { childGuidancePlanInclude, createWeeksData } from "@/lib/plan-includes";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.childGuidancePlan.findMany({
    where: { isCustom: false },
    include: { ...childGuidancePlanInclude, _count: { select: { patients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, totalWeeks, imageUrl, videoUrl, isDayWise } =
    await request.json();

  if (!title || !totalWeeks) {
    return NextResponse.json({ error: "Title and weeks are required" }, { status: 400 });
  }

  const weeks = Number(totalWeeks);
  const dayWise = Boolean(isDayWise);

  const plan = await prisma.childGuidancePlan.create({
    data: {
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      totalWeeks: weeks,
      isDayWise: dayWise,
      weeks: { create: createWeeksData(weeks, dayWise) },
    },
    include: childGuidancePlanInclude,
  });

  return NextResponse.json(plan);
}
