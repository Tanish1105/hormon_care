import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";
import { childGuidancePlanInclude, createWeeksData } from "@/lib/plan-includes";

export async function GET(request: NextRequest) {
  const access = await requireStaffSession("plans.read");
  if (!access.ok) return access.response;
  const session = access.session;

  const lite = new URL(request.url).searchParams.get("lite") === "1";

  if (lite) {
    const plans = await prisma.childGuidancePlan.findMany({
      where: { isCustom: false },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(plans);
  }

  const plans = await prisma.childGuidancePlan.findMany({
    where: { isCustom: false },
    include: { ...childGuidancePlanInclude, _count: { select: { patients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

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
