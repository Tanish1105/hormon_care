import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatFollowupDelta } from "@/lib/weekly-followup";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: {
      plan: { select: { title: true, totalWeeks: true } },
      weeklyFollowups: { orderBy: { weekNumber: "asc" } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const followups = profile.weeklyFollowups;

  const weeks = followups.map((f, index) => {
    const prev = index > 0 ? followups[index - 1] : null;
    return {
      id: f.id,
      weekNumber: f.weekNumber,
      currentWeight: f.currentWeight,
      exerciseDays: f.exerciseDays,
      lowWaterDays: f.lowWaterDays,
      shortSleepDays: f.shortSleepDays,
      missedSupplementDays: f.missedSupplementDays,
      mealsDeviated: f.mealsDeviated,
      planFeedback: f.planFeedback,
      feedbackLikedNotes: f.feedbackLikedNotes,
      feedbackDislikedNotes: f.feedbackDislikedNotes,
      feedbackBadNotes: f.feedbackBadNotes,
      feedbackGoodNotes: f.feedbackGoodNotes,
      waist: f.waist,
      chest: f.chest,
      thigh: f.thigh,
      hip: f.hip,
      arm: f.arm,
      neck: f.neck,
      submittedAt: f.submittedAt,
      comparison: {
        weight: formatFollowupDelta(f.currentWeight, prev?.currentWeight ?? null),
        waist: formatFollowupDelta(f.waist, prev?.waist ?? null),
        chest: formatFollowupDelta(f.chest, prev?.chest ?? null),
        thigh: formatFollowupDelta(f.thigh, prev?.thigh ?? null),
        hip: formatFollowupDelta(f.hip, prev?.hip ?? null),
        arm: formatFollowupDelta(f.arm, prev?.arm ?? null),
        neck: formatFollowupDelta(f.neck, prev?.neck ?? null),
        exerciseDays: formatFollowupDelta(f.exerciseDays, prev?.exerciseDays ?? null),
        lowWaterDays: formatFollowupDelta(f.lowWaterDays, prev?.lowWaterDays ?? null),
        shortSleepDays: formatFollowupDelta(f.shortSleepDays, prev?.shortSleepDays ?? null),
        missedSupplementDays: formatFollowupDelta(
          f.missedSupplementDays,
          prev?.missedSupplementDays ?? null
        ),
      },
    };
  });

  const latest = followups[followups.length - 1] ?? null;
  const first = followups[0] ?? null;

  return NextResponse.json({
    planTitle: profile.plan?.title ?? "",
    totalWeeks: profile.plan?.totalWeeks ?? 0,
    submissionCount: followups.length,
    latestWeight: latest?.currentWeight ?? null,
    firstWeight: first?.currentWeight ?? null,
    weightChange:
      latest && first
        ? Math.round((latest.currentWeight - first.currentWeight) * 10) / 10
        : null,
    followups: weeks,
  });
}
