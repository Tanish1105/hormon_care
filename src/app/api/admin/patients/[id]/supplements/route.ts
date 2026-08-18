import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession, requirePatientAccess } from "@/lib/staff-access";
import {
  normalizeSupplementItems,
  supplementPlanInclude,
} from "@/lib/supplements";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("supplements.read");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const [catalog, plans] = await Promise.all([
    prisma.supplement.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.patientSupplementPlan.findMany({
      where: { patientProfileId: id },
      include: supplementPlanInclude,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    catalog,
    plans,
    activePlan: plans.find((plan) => plan.isActive) ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("supplements.write");
  if (!access.ok) return access.response;

  const { id } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json(
      { error: "Title is required, e.g. For 2 months" },
      { status: 400 }
    );
  }

  const items = normalizeSupplementItems(body.items);
  if (items.length === 0) {
    return NextResponse.json(
      { error: "Add at least one supplement" },
      { status: 400 }
    );
  }

  const plan = await prisma.$transaction(async (tx) => {
    await tx.patientSupplementPlan.updateMany({
      where: { patientProfileId: id, isActive: true },
      data: { isActive: false },
    });

    return tx.patientSupplementPlan.create({
      data: {
        patientProfileId: id,
        title,
        notes: body.notes?.trim() || null,
        isActive: true,
        items: {
          create: items.map((item, index) => ({
            ...item,
            sortOrder: index,
          })),
        },
      },
      include: supplementPlanInclude,
    });
  });

  return NextResponse.json(plan);
}
