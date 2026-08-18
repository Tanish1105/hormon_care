import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePatientAccess, requireStaffSession } from "@/lib/staff-access";
import { validateFollowupPayload } from "@/lib/weekly-followup";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("followups.write");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;

  const body = await request.json();
  const { data, error } = validateFollowupPayload(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      plan: { select: { totalWeeks: true } },
      weeklyFollowups: { select: { weekNumber: true } },
    },
  });

  if (!profile?.plan) {
    return NextResponse.json({ error: "No care plan assigned" }, { status: 400 });
  }

  if (data.weekNumber > profile.plan.totalWeeks) {
    return NextResponse.json({ error: "Week is outside this patient's plan" }, { status: 400 });
  }

  const already = profile.weeklyFollowups.some((f) => f.weekNumber === data.weekNumber);
  if (already) {
    return NextResponse.json({ error: "Followup for this week already exists" }, { status: 400 });
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
