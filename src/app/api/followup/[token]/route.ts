import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDueFollowupWeeks, validateFollowupPayload } from "@/lib/weekly-followup";
import { buildFollowupStatus } from "@/lib/followup-status";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  const profile = await prisma.patientProfile.findUnique({
    where: { followupAccessToken: token },
    include: {
      user: { select: { name: true } },
      plan: { select: { totalWeeks: true, title: true } },
      weeklyFollowups: { select: { weekNumber: true }, orderBy: { weekNumber: "asc" } },
    },
  });

  if (!profile?.plan) {
    return NextResponse.json({ error: "Invalid or expired followup link" }, { status: 404 });
  }

  const status = await buildFollowupStatus(profile);

  return NextResponse.json({
    pending: status.pendingWeeks.length > 0,
    patientName: status.patientName,
    nextDueWeek: status.nextDueWeek,
    pendingWeeks: status.pendingWeeks,
    planTitle: status.planTitle,
  });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { token } = await params;

  const profile = await prisma.patientProfile.findUnique({
    where: { followupAccessToken: token },
    include: {
      plan: { select: { totalWeeks: true } },
      weeklyFollowups: { select: { weekNumber: true } },
    },
  });

  if (!profile?.plan) {
    return NextResponse.json({ error: "Invalid or expired followup link" }, { status: 404 });
  }

  const body = await req.json();
  const { data, error } = validateFollowupPayload(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const pendingWeeks = getDueFollowupWeeks(
    profile.startDate,
    profile.currentWeek,
    profile.plan.totalWeeks,
    profile.weeklyFollowups.map((f) => f.weekNumber)
  );

  if (!pendingWeeks.includes(data.weekNumber)) {
    return NextResponse.json({ error: "This followup is not due yet" }, { status: 400 });
  }

  const followup = await prisma.weeklyFollowup.create({
    data: {
      patientProfileId: profile.id,
      weekNumber: data.weekNumber,
      currentWeight: data.currentWeight,
      exerciseDays: data.exerciseDays,
      lowWaterDays: data.lowWaterDays,
      shortSleepDays: data.shortSleepDays,
      missedSupplementDays: data.missedSupplementDays,
      mealsDeviated: data.mealsDeviated,
      planFeedback: data.planFeedback,
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
      consentAgreed: data.consentAgreed,
    },
  });

  return NextResponse.json({ followup }, { status: 201 });
}
