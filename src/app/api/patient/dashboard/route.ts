import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getUnlockedWeek, getUnlockedDay } from "@/lib/utils";
import { sanitizePatientContents, type ContentItem } from "@/lib/patient-content";
import { planInclude, garbhaPlanInclude, childGuidancePlanInclude } from "@/lib/plan-includes";
import { buildPatientGateStatus } from "@/lib/patient-gate";

function sanitizePlanContents<
  T extends {
    weeks: {
      contents: ContentItem[];
      days?: { contents: ContentItem[] }[];
    }[];
  },
>(plan: T): T {
  return {
    ...plan,
    weeks: plan.weeks.map((week) => ({
      ...week,
      contents: sanitizePatientContents(week.contents),
      days: week.days?.map((day) => ({
        ...day,
        contents: sanitizePatientContents(day.contents),
      })),
    })),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: { select: { name: true, username: true } },
      plan: { include: planInclude },
      garbhaPlan: { include: garbhaPlanInclude },
      childGuidancePlan: { include: childGuidancePlanInclude },
      weeklyFollowups: { select: { weekNumber: true }, orderBy: { weekNumber: "asc" } },
      lifestyleAssessment: { select: { requestedAt: true, submittedAt: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const unlockedWeek = profile.plan
    ? getUnlockedWeek(profile.startDate, profile.currentWeek, profile.plan.totalWeeks)
    : 0;

  const garbhaUnlockedWeek = profile.garbhaPlan
    ? getUnlockedWeek(profile.startDate, profile.currentWeek, profile.garbhaPlan.totalWeeks)
    : 0;

  const childGuidanceUnlockedWeek = profile.childGuidancePlan
    ? getUnlockedWeek(profile.startDate, profile.currentWeek, profile.childGuidancePlan.totalWeeks)
    : 0;

  const unlockedDay = profile.plan?.isDayWise ? getUnlockedDay(profile.startDate) : 0;
  const garbhaUnlockedDay = profile.garbhaPlan?.isDayWise
    ? getUnlockedDay(profile.startDate)
    : 0;
  const childGuidanceUnlockedDay = profile.childGuidancePlan?.isDayWise
    ? getUnlockedDay(profile.startDate)
    : 0;

  const gate = await buildPatientGateStatus(profile);

  const safeProfile = {
    ...profile,
    plan: profile.plan ? sanitizePlanContents(profile.plan) : null,
    garbhaPlan: profile.garbhaPlan ? sanitizePlanContents(profile.garbhaPlan) : null,
    childGuidancePlan: profile.childGuidancePlan
      ? sanitizePlanContents(profile.childGuidancePlan)
      : null,
  };

  return NextResponse.json({
    profile: safeProfile,
    gate,
    followup: gate.followup,
    unlockedWeek,
    garbhaUnlockedWeek,
    childGuidanceUnlockedWeek,
    unlockedDay,
    garbhaUnlockedDay,
    childGuidanceUnlockedDay,
  });
  } catch (error) {
    console.error("dashboard error:", error);
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please wait a minute and try again." },
      { status: 503 }
    );
  }
}
