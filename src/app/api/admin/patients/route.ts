import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateAssessmentAccessToken,
  buildAssessmentFormUrl,
  buildFollowupFormUrl,
} from "@/lib/assessment-link";
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

function withShareLinks<
  T extends {
    followupAccessToken: string | null;
    plan: { id: string } | null;
    lifestyleAssessment: {
      id: string;
      requestedAt: Date | null;
      submittedAt: Date | null;
      lifestyleScore: number | null;
      accessToken: string | null;
    } | null;
  },
>(patient: T) {
  const assessmentToken = patient.lifestyleAssessment?.accessToken ?? null;
  const assessmentPending =
    Boolean(patient.lifestyleAssessment?.requestedAt) &&
    !patient.lifestyleAssessment?.submittedAt;

  return {
    ...patient,
    assessmentFormLink:
      assessmentPending && assessmentToken
        ? buildAssessmentFormUrl(assessmentToken)
        : null,
    followupFormLink:
      patient.plan && patient.followupAccessToken
        ? buildFollowupFormUrl(patient.followupAccessToken)
        : null,
  };
}

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

    // Ensure followup share tokens exist for patients with a care plan
    const needFollowupToken = patients.filter((p) => p.plan && !p.followupAccessToken);
    if (needFollowupToken.length > 0) {
      await Promise.all(
        needFollowupToken.map((p) =>
          prisma.patientProfile.update({
            where: { id: p.id },
            data: { followupAccessToken: generateAssessmentAccessToken() },
          })
        )
      );
      const refreshed = await prisma.patientProfile.findMany({
        where: { id: { in: needFollowupToken.map((p) => p.id) } },
        select: { id: true, followupAccessToken: true },
      });
      const tokenByPatient = new Map(refreshed.map((r) => [r.id, r.followupAccessToken]));
      for (const p of patients) {
        const token = tokenByPatient.get(p.id);
        if (token) p.followupAccessToken = token;
      }
    }

    return NextResponse.json(patients.map(withShareLinks));
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
    username: manualUsername,
    password: manualPassword,
  } = await request.json();

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

  const careStart = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  const garbhaStart = garbhaStartDate
    ? new Date(`${garbhaStartDate}T00:00:00`)
    : careStart;
  const childStart = childGuidanceStartDate
    ? new Date(`${childGuidanceStartDate}T00:00:00`)
    : careStart;
  const careWeek = currentWeek ? Number(currentWeek) : 1;

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
          currentWeek: careWeek,
          startDate: careStart,
          garbhaStartDate: garbhaStart,
          garbhaCurrentWeek: garbhaCurrentWeek ? Number(garbhaCurrentWeek) : careWeek,
          childGuidanceStartDate: childStart,
          childGuidanceCurrentWeek: childGuidanceCurrentWeek
            ? Number(childGuidanceCurrentWeek)
            : careWeek,
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
