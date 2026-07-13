import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAssessmentAccessToken } from "@/lib/assessment-link";
import {
  getSession,
  hashPassword,
  generatePatientCredentials,
} from "@/lib/auth";

const patientListInclude = {
  user: { select: { id: true, username: true, name: true, createdAt: true } },
  plan: { select: { id: true, title: true, totalWeeks: true, isCustom: true } },
  garbhaPlan: { select: { id: true, title: true, totalWeeks: true, isCustom: true } },
  childGuidancePlan: { select: { id: true, title: true, totalWeeks: true, isCustom: true } },
  lifestyleAssessment: {
    select: {
      id: true,
      requestedAt: true,
      submittedAt: true,
      lifestyleScore: true,
      accessToken: true,
    },
  },
} as const;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const patients = await prisma.patientProfile.findMany({
      include: patientListInclude,
      orderBy: { createdAt: "desc" },
    });

    const pendingWithoutToken = patients.filter(
      (p) =>
        p.lifestyleAssessment?.requestedAt &&
        !p.lifestyleAssessment.submittedAt &&
        !p.lifestyleAssessment.accessToken
    );

    if (pendingWithoutToken.length > 0) {
      await Promise.all(
        pendingWithoutToken.map((p) =>
          prisma.lifestyleAssessment.update({
            where: { id: p.lifestyleAssessment!.id },
            data: { accessToken: generateAssessmentAccessToken() },
          })
        )
      );

      const updated = await prisma.lifestyleAssessment.findMany({
        where: { id: { in: pendingWithoutToken.map((p) => p.lifestyleAssessment!.id) } },
        select: { id: true, accessToken: true },
      });
      const tokenById = new Map(updated.map((row) => [row.id, row.accessToken]));

      for (const p of patients) {
        const assessment = p.lifestyleAssessment;
        if (!assessment) continue;
        const token = tokenById.get(assessment.id);
        if (token) assessment.accessToken = token;
      }
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error("[admin/patients]", error);
    const message = error instanceof Error ? error.message : "Could not load patients";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, requirements, planId, garbhaPlanId, childGuidancePlanId, currentWeek, startDate, username: manualUsername, password: manualPassword } =
    await request.json();

  if (!name) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }

  const trimmedUsername = manualUsername?.trim();
  const trimmedPassword = manualPassword?.trim();
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
    const existing = await prisma.user.findUnique({ where: { username: trimmedUsername! } });
    if (existing) {
      return NextResponse.json({ error: "આ Patient ID પહેલેથી વપરાયેલું છે" }, { status: 400 });
    }
    username = trimmedUsername!;
    password = trimmedPassword!;
  } else {
    let attempts = 0;
    do {
      ({ username, password } = generatePatientCredentials());
      const existing = await prisma.user.findUnique({ where: { username } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: "PATIENT",
      name,
      patientProfile: {
        create: {
          requirements: requirements || null,
          planId: planId || null,
          garbhaPlanId: garbhaPlanId || null,
          childGuidancePlanId: childGuidancePlanId || null,
          currentWeek: currentWeek ? Number(currentWeek) : 1,
          startDate: startDate ? new Date(`${startDate}T00:00:00`) : new Date(),
        },
      },
    },
    include: {
      patientProfile: { include: { plan: true } },
    },
  });

  return NextResponse.json({
    patient: user,
    credentials: { username, password },
  });
}
