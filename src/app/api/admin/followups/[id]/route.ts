import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateFollowupUpdatePayload } from "@/lib/weekly-followup";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { data, error } = validateFollowupUpdatePayload(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const existing = await prisma.weeklyFollowup.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Followup not found" }, { status: 404 });
  }

  const followup = await prisma.weeklyFollowup.update({
    where: { id },
    data: {
      currentWeight: data.currentWeight,
      exerciseDays: data.exerciseDays,
      lowWaterDays: data.lowWaterDays,
      shortSleepDays: data.shortSleepDays,
      missedSupplementDays: data.missedSupplementDays,
      mealsDeviated: data.mealsDeviated,
      planFeedback: data.planFeedback ?? undefined,
      feedbackLikedNotes: data.feedbackLikedNotes,
      feedbackDislikedNotes: data.feedbackDislikedNotes,
      feedbackBadNotes: data.feedbackBadNotes,
      feedbackGoodNotes: data.feedbackGoodNotes,
      waist: data.waist,
      chest: data.chest,
      thigh: data.thigh,
      hip: data.hip,
      arm: data.arm,
      neck: data.neck,
    },
  });

  return NextResponse.json({ followup });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.weeklyFollowup.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Followup not found" }, { status: 404 });
  }

  await prisma.weeklyFollowup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
