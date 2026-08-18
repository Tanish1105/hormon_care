import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generatePatientCredentials } from "@/lib/auth";
import {
  hasPermission,
  requirePatientAccess,
  requireStaffSession,
  resolveCareTeamIds,
} from "@/lib/staff-access";
import { deleteCustomPlanIfNeeded } from "@/lib/patient-plans";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("patients.read");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;

  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, name: true, createdAt: true } },
      doctor: { select: { id: true, name: true, username: true } },
      dietitian: { select: { id: true, name: true, username: true } },
      plan: {
        include: {
          weeks: {
            include: { contents: { orderBy: { sortOrder: "asc" } } },
            orderBy: { weekNumber: "asc" },
          },
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(patient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("patients.update");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;

  const {
    name,
    requirements,
    planId,
    garbhaPlanId,
    childGuidancePlanId,
    currentWeek,
    startDate,
    garbhaStartDate,
    garbhaCurrentWeek,
    childGuidanceStartDate,
    childGuidanceCurrentWeek,
    doctorId: requestedDoctorId,
    dietitianId: requestedDietitianId,
  } = await request.json();

  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: { user: true, plan: true, garbhaPlan: true, childGuidancePlan: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  if (name) {
    await prisma.user.update({
      where: { id: patient.userId },
      data: { name },
    });
  }

  const canAssignPlans = hasPermission(access.session.role, "plans.assign");

  if (canAssignPlans) {
    if (planId !== undefined && planId !== patient.planId) {
      await deleteCustomPlanIfNeeded("care", patient.planId);
    }
    if (garbhaPlanId !== undefined && garbhaPlanId !== patient.garbhaPlanId) {
      await deleteCustomPlanIfNeeded("garbha", patient.garbhaPlanId);
    }
    if (childGuidancePlanId !== undefined && childGuidancePlanId !== patient.childGuidancePlanId) {
      await deleteCustomPlanIfNeeded("child", patient.childGuidancePlanId);
    }
  }

  const team =
    access.session.role === "ADMIN" &&
    (requestedDoctorId !== undefined || requestedDietitianId !== undefined)
      ? await resolveCareTeamIds(
          access.session,
          requestedDoctorId !== undefined ? requestedDoctorId : patient.doctorId,
          requestedDietitianId !== undefined ? requestedDietitianId : patient.dietitianId
        )
      : null;
  if (team?.error) {
    return NextResponse.json({ error: team.error }, { status: 400 });
  }

  const updated = await prisma.patientProfile.update({
    where: { id },
    data: {
      requirements: requirements !== undefined ? requirements : undefined,
      planId: canAssignPlans && planId !== undefined ? planId : undefined,
      garbhaPlanId: canAssignPlans && garbhaPlanId !== undefined ? garbhaPlanId : undefined,
      childGuidancePlanId:
        canAssignPlans && childGuidancePlanId !== undefined ? childGuidancePlanId : undefined,
      currentWeek:
        canAssignPlans && currentWeek !== undefined ? Number(currentWeek) : undefined,
      startDate: canAssignPlans && startDate ? new Date(`${startDate}T00:00:00`) : undefined,
      garbhaStartDate:
        canAssignPlans && garbhaStartDate
          ? new Date(`${garbhaStartDate}T00:00:00`)
          : undefined,
      garbhaCurrentWeek:
        canAssignPlans && garbhaCurrentWeek !== undefined
          ? Number(garbhaCurrentWeek)
          : undefined,
      childGuidanceStartDate:
        canAssignPlans && childGuidanceStartDate
          ? new Date(`${childGuidanceStartDate}T00:00:00`)
          : undefined,
      childGuidanceCurrentWeek:
        canAssignPlans && childGuidanceCurrentWeek !== undefined
          ? Number(childGuidanceCurrentWeek)
          : undefined,
      doctorId: team ? team.doctorId : undefined,
      dietitianId: team ? team.dietitianId : undefined,
    },
    include: {
      user: { select: { id: true, username: true, name: true } },
      plan: true,
      garbhaPlan: true,
      childGuidancePlan: true,
      doctor: { select: { id: true, name: true } },
      dietitian: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("patients.delete");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;

  const patient = await prisma.patientProfile.findUnique({ where: { id } });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: patient.userId } });

  await deleteCustomPlanIfNeeded("care", patient.planId);
  await deleteCustomPlanIfNeeded("garbha", patient.garbhaPlanId);
  await deleteCustomPlanIfNeeded("child", patient.childGuidancePlanId);

  return NextResponse.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("patients.credentials");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;

  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const trimmedUsername = body.username?.trim();
  const trimmedPassword = body.password?.trim();
  const hasManualUsername = Boolean(trimmedUsername);
  const hasManualPassword = Boolean(trimmedPassword);

  if (hasManualUsername !== hasManualPassword) {
    return NextResponse.json(
      { error: "Patient ID અને password બંને આપો, અથવા બંને ખાલી છોડીને auto-generate કરો" },
      { status: 400 }
    );
  }

  let username: string;
  let password: string;

  if (hasManualUsername && hasManualPassword) {
    if (trimmedUsername!.length < 3) {
      return NextResponse.json({ error: "Patient ID ઓછામાં ઓછું 3 characters હોવું જોઈએ" }, { status: 400 });
    }
    if (trimmedPassword!.length < 4) {
      return NextResponse.json({ error: "Password ઓછામાં ઓછું 4 characters હોવું જોઈએ" }, { status: 400 });
    }
    if (trimmedUsername !== patient.user.username) {
      const existing = await prisma.user.findUnique({ where: { username: trimmedUsername! } });
      if (existing) {
        return NextResponse.json({ error: "આ Patient ID પહેલેથી વપરાયેલું છે" }, { status: 400 });
      }
    }
    username = trimmedUsername!;
    password = trimmedPassword!;
  } else {
    ({ username, password } = generatePatientCredentials());
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: patient.userId },
    data: { username, password: hashedPassword },
  });

  return NextResponse.json({ credentials: { username, password } });
}
