import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  validateLifestyleAssessment,
  dataToDbFields,
} from "@/lib/lifestyle-assessment";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: { select: { name: true } },
      lifestyleAssessment: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const assessment = profile.lifestyleAssessment;
  const pending =
    assessment?.requestedAt != null && assessment.submittedAt == null;

  return NextResponse.json({
    pending,
    patientName: profile.user.name,
    requestedAt: assessment?.requestedAt ?? null,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: { lifestyleAssessment: true },
  });

  if (!profile?.lifestyleAssessment?.requestedAt) {
    return NextResponse.json({ error: "No assessment requested" }, { status: 400 });
  }

  if (profile.lifestyleAssessment.submittedAt) {
    return NextResponse.json({ error: "Assessment already submitted" }, { status: 400 });
  }

  const body = await req.json();
  const { data, error } = validateLifestyleAssessment(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const fields = dataToDbFields(data);
  const assessment = await prisma.lifestyleAssessment.update({
    where: { patientProfileId: profile.id },
    data: {
      ...fields,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ assessment }, { status: 201 });
}
