import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateLifestyleAssessment,
  dataToDbFields,
} from "@/lib/lifestyle-assessment";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  const assessment = await prisma.lifestyleAssessment.findUnique({
    where: { accessToken: token },
    include: {
      patientProfile: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!assessment?.requestedAt) {
    return NextResponse.json({ error: "Invalid or expired assessment link" }, { status: 404 });
  }

  const pending = assessment.submittedAt == null;

  return NextResponse.json({
    pending,
    submitted: !pending,
    patientName: assessment.patientProfile.user.name,
    requestedAt: assessment.requestedAt,
    submittedAt: assessment.submittedAt,
  });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { token } = await params;

  const assessment = await prisma.lifestyleAssessment.findUnique({
    where: { accessToken: token },
  });

  if (!assessment?.requestedAt) {
    return NextResponse.json({ error: "Invalid or expired assessment link" }, { status: 404 });
  }

  if (assessment.submittedAt) {
    return NextResponse.json({ error: "Assessment already submitted" }, { status: 400 });
  }

  const body = await req.json();
  const { data, error } = validateLifestyleAssessment(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const fields = dataToDbFields(data);
  const updated = await prisma.lifestyleAssessment.update({
    where: { id: assessment.id },
    data: {
      ...fields,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ assessment: updated }, { status: 201 });
}
