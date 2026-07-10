import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, generatePatientCredentials } from "@/lib/auth";
import { deleteCustomPlanIfNeeded } from "@/lib/patient-plans";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, name: true, createdAt: true } },
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
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, requirements, planId, garbhaPlanId, childGuidancePlanId, currentWeek, startDate } = await request.json();

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

  if (planId !== undefined && planId !== patient.planId) {
    await deleteCustomPlanIfNeeded("care", patient.planId);
  }
  if (garbhaPlanId !== undefined && garbhaPlanId !== patient.garbhaPlanId) {
    await deleteCustomPlanIfNeeded("garbha", patient.garbhaPlanId);
  }
  if (childGuidancePlanId !== undefined && childGuidancePlanId !== patient.childGuidancePlanId) {
    await deleteCustomPlanIfNeeded("child", patient.childGuidancePlanId);
  }

  const updated = await prisma.patientProfile.update({
    where: { id },
    data: {
      requirements: requirements !== undefined ? requirements : undefined,
      planId: planId !== undefined ? planId : undefined,
      garbhaPlanId: garbhaPlanId !== undefined ? garbhaPlanId : undefined,
      childGuidancePlanId: childGuidancePlanId !== undefined ? childGuidancePlanId : undefined,
      currentWeek: currentWeek !== undefined ? Number(currentWeek) : undefined,
      startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    },
    include: {
      user: { select: { id: true, username: true, name: true } },
      plan: true,
      garbhaPlan: true,
      childGuidancePlan: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
