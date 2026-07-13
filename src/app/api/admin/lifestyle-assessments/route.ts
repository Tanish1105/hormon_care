import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildAssessmentFormUrl, generateAssessmentAccessToken } from "@/lib/assessment-link";
import {
  assessmentToDisplayData,
  getLifestyleHighlights,
  getLifestyleAnalyticsSummary,
} from "@/lib/lifestyle-assessment";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const origin = new URL(req.url).origin;

    const patients = await prisma.patientProfile.findMany({
      include: {
        user: { select: { name: true, username: true } },
        lifestyleAssessment: true,
      },
      orderBy: { user: { name: "asc" } },
    });

    await Promise.all(
      patients
        .filter(
          (p) =>
            p.lifestyleAssessment?.requestedAt &&
            !p.lifestyleAssessment.submittedAt &&
            !p.lifestyleAssessment.accessToken
        )
        .map((p) =>
          prisma.lifestyleAssessment.update({
            where: { id: p.lifestyleAssessment!.id },
            data: { accessToken: generateAssessmentAccessToken() },
          })
        )
    );

    const patientsWithTokens = patients.some(
      (p) =>
        p.lifestyleAssessment?.requestedAt &&
        !p.lifestyleAssessment.submittedAt &&
        !p.lifestyleAssessment.accessToken
    )
      ? await prisma.patientProfile.findMany({
          include: {
            user: { select: { name: true, username: true } },
            lifestyleAssessment: true,
          },
          orderBy: { user: { name: "asc" } },
        })
      : patients;

    const items = patientsWithTokens
      .filter((p) => p.lifestyleAssessment?.requestedAt)
      .map((patient) => {
        const a = patient.lifestyleAssessment!;
        const displayData = assessmentToDisplayData(a);
        const highlights = displayData ? getLifestyleHighlights(displayData) : [];
        const pending = a.requestedAt != null && a.submittedAt == null;
        const analytics = getLifestyleAnalyticsSummary(displayData, highlights, a.lifestyleScore);

        return {
          id: a.id,
          patientProfileId: patient.id,
          patientName: patient.user.name,
          username: patient.user.username,
          requestedAt: a.requestedAt,
          submittedAt: a.submittedAt,
          pending,
          lifestyleScore: a.lifestyleScore,
          doctorRecommendation: a.doctorRecommendation,
          accessToken: a.accessToken,
          formLink: a.accessToken ? buildAssessmentFormUrl(a.accessToken, origin) : null,
          data: displayData,
          highlights,
          highlightCount: highlights.length,
          analytics,
        };
      })
      .sort((a, b) => {
        if (a.pending !== b.pending) return a.pending ? -1 : 1;
        const riskOrder = { high: 0, medium: 1, low: 2 };
        const aRisk = riskOrder[a.analytics?.riskLevel ?? "low"];
        const bRisk = riskOrder[b.analytics?.riskLevel ?? "low"];
        if (aRisk !== bRisk) return aRisk - bRisk;
        return (b.highlightCount ?? 0) - (a.highlightCount ?? 0);
      });

    const aggregate = {
      totalSent: items.length,
      pending: items.filter((i) => i.pending).length,
      submitted: items.filter((i) => !i.pending && i.submittedAt).length,
      highRisk: items.filter((i) => i.analytics?.riskLevel === "high").length,
      mediumRisk: items.filter((i) => i.analytics?.riskLevel === "medium").length,
    };

    return NextResponse.json({ items, aggregate });
  } catch (error) {
    console.error("[lifestyle-assessments]", error);
    const message = error instanceof Error ? error.message : "Could not load assessments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
