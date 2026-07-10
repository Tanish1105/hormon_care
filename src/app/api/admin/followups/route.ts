import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatFollowupDelta } from "@/lib/weekly-followup";
import { buildFollowupStatus } from "@/lib/followup-status";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;

  const patients = await prisma.patientProfile.findMany({
    where: { planId: { not: null } },
    include: {
      user: { select: { name: true, username: true } },
      plan: { select: { title: true, totalWeeks: true } },
      weeklyFollowups: { orderBy: { weekNumber: "asc" } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const patientAnalytics = await Promise.all(
    patients.map(async (patient) => {
      const followups = patient.weeklyFollowups;
      const followupStatus = await buildFollowupStatus(patient, { origin });

      const weeksWithComparison = followups.map((f, index) => {
        const prev = index > 0 ? followups[index - 1] : null;
        return {
          ...f,
          comparison: {
            weight: formatFollowupDelta(f.currentWeight, prev?.currentWeight ?? null),
            waist: formatFollowupDelta(f.waist, prev?.waist ?? null),
            chest: formatFollowupDelta(f.chest, prev?.chest ?? null),
            thigh: formatFollowupDelta(f.thigh, prev?.thigh ?? null),
            hip: formatFollowupDelta(f.hip, prev?.hip ?? null),
            arm: formatFollowupDelta(f.arm, prev?.arm ?? null),
            neck: formatFollowupDelta(f.neck, prev?.neck ?? null),
          },
        };
      });

      const latest = followups[followups.length - 1] ?? null;
      const first = followups[0] ?? null;

      return {
        id: patient.id,
        name: patient.user.name,
        username: patient.user.username,
        planTitle: patient.plan?.title ?? "",
        totalWeeks: patient.plan?.totalWeeks ?? 0,
        startDate: patient.startDate,
        pendingWeeks: followupStatus.pendingWeeks,
        nextDueWeek: followupStatus.nextDueWeek,
        formLink: followupStatus.formLink,
        submissionCount: followups.length,
        latestWeight: latest?.currentWeight ?? null,
        weightChange:
          latest && first ? Math.round((latest.currentWeight - first.currentWeight) * 10) / 10 : null,
        followups: weeksWithComparison,
      };
    })
  );

  const allFollowups = patientAnalytics.flatMap((p) => p.followups);
  const aggregate = {
    totalPatients: patientAnalytics.length,
    totalSubmissions: allFollowups.length,
    pendingCount: patientAnalytics.reduce((sum, p) => sum + p.pendingWeeks.length, 0),
  };

  return NextResponse.json({ patients: patientAnalytics, aggregate });
}
