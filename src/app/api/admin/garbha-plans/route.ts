import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { garbhaPlanInclude, createWeeksData } from "@/lib/plan-includes";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lite = new URL(request.url).searchParams.get("lite") === "1";

  if (lite) {
    const plans = await prisma.garbhaPlan.findMany({
      where: { isCustom: false },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(plans);
  }

  const plans = await prisma.garbhaPlan.findMany({
    where: { isCustom: false },
    include: { ...garbhaPlanInclude, _count: { select: { patients: true } } },
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

  const plan = await prisma.garbhaPlan.create({
    data: {
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      totalWeeks: weeks,
      isDayWise: dayWise,
      weeks: { create: createWeeksData(weeks, dayWise) },
    },
    include: garbhaPlanInclude,
  });

  return NextResponse.json(plan);
}
