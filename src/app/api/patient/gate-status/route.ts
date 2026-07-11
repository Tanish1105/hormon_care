import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildPatientGateStatus } from "@/lib/patient-gate";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.id },
      include: {
        user: { select: { name: true } },
        plan: { select: { totalWeeks: true, title: true } },
        garbhaPlan: { select: { title: true } },
        childGuidancePlan: { select: { title: true } },
        weeklyFollowups: { select: { weekNumber: true }, orderBy: { weekNumber: "asc" } },
        lifestyleAssessment: { select: { requestedAt: true, submittedAt: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    return NextResponse.json(await buildPatientGateStatus(profile, { origin }));
  } catch (error) {
    console.error("gate-status error:", error);
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please wait a minute and try again." },
      { status: 503 }
    );
  }
}
