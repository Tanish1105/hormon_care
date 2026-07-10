import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateLifestyleAssessment, dataToDbFields } from "@/lib/lifestyle-assessment";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.lifestyleAssessment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (body.doctorRecommendation !== undefined) {
    const assessment = await prisma.lifestyleAssessment.update({
      where: { id },
      data: {
        doctorRecommendation:
          typeof body.doctorRecommendation === "string"
            ? body.doctorRecommendation.trim() || null
            : null,
      },
    });
    return NextResponse.json({ assessment });
  }

  const { data, error } = validateLifestyleAssessment(body);
  if (!data || error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const assessment = await prisma.lifestyleAssessment.update({
    where: { id },
    data: {
      ...dataToDbFields(data),
      submittedAt: existing.submittedAt ?? new Date(),
    },
  });

  return NextResponse.json({ assessment });
}
