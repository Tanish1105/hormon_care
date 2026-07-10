import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getDueFollowupWeeks, validateFollowupPayload } from "@/lib/weekly-followup";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekNumber = Number(new URL(req.url).searchParams.get("week"));
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const followup = await prisma.weeklyFollowup.findUnique({
    where: {
      patientProfileId_weekNumber: {
        patientProfileId: profile.id,
        weekNumber,
      },
    },
  });

  return NextResponse.json({ followup });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = validateFollowupPayload(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: {
      plan: { select: { totalWeeks: true } },
      weeklyFollowups: { select: { weekNumber: true } },
    },
  });

  if (!profile?.plan) {
    return NextResponse.json({ error: "No care plan assigned" }, { status: 400 });
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
