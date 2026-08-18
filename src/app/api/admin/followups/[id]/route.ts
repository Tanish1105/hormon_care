import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession, requirePatientAccess } from "@/lib/staff-access";
import { validateFollowupUpdatePayload } from "@/lib/weekly-followup";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const access = await requireStaffSession("followups.write");
  if (!access.ok) return access.response;

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

  const patientAccess = await requirePatientAccess(access.session, existing.patientProfileId);
  if (!patientAccess.ok) return patientAccess.response;

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
    },
  });

  return NextResponse.json({ followup });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const access = await requireStaffSession("followups.delete");
  if (!access.ok) return access.response;

  const { id } = await params;
  const existing = await prisma.weeklyFollowup.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Followup not found" }, { status: 404 });
  }

  const patientAccess = await requirePatientAccess(access.session, existing.patientProfileId);
  if (!patientAccess.ok) return patientAccess.response;

  await prisma.weeklyFollowup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
