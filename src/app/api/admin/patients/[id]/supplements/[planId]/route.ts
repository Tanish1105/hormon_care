import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession, requirePatientAccess } from "@/lib/staff-access";
import {
  normalizeSupplementItems,
  supplementPlanInclude,
} from "@/lib/supplements";

async function getOwnedPlan(patientId: string, planId: string) {
  return prisma.patientSupplementPlan.findFirst({
    where: { id: planId, patientProfileId: patientId },
    include: supplementPlanInclude,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  const access = await requireStaffSession("supplements.write");
  if (!access.ok) return access.response;

  const { id, planId } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;
  const existing = await getOwnedPlan(id, planId);
  if (!existing) {
    return NextResponse.json({ error: "Supplement list not found" }, { status: 404 });
  }

  const body = await request.json();
  const title =
    body.title !== undefined ? String(body.title).trim() : existing.title;
  if (!title) {
    return NextResponse.json(
      { error: "Title is required, e.g. For 2 months" },
      { status: 400 }
    );
  }

  const replaceItems = Array.isArray(body.items);
  const items = replaceItems ? normalizeSupplementItems(body.items) : null;
  if (replaceItems && items!.length === 0) {
    return NextResponse.json(
      { error: "Add at least one supplement" },
      { status: 400 }
    );
  }

  const makeActive = body.isActive === true && !existing.isActive;

  const plan = await prisma.$transaction(async (tx) => {
    if (makeActive) {
      await tx.patientSupplementPlan.updateMany({
        where: { patientProfileId: id, isActive: true },
        data: { isActive: false },
      });
    }

    if (replaceItems) {
      await tx.patientSupplementItem.deleteMany({ where: { planId } });
    }

    return tx.patientSupplementPlan.update({
      where: { id: planId },
      data: {
        title,
        notes: body.notes !== undefined ? body.notes?.trim() || null : undefined,
        isActive: makeActive ? true : undefined,
        items: replaceItems
          ? {
              create: items!.map((item, index) => ({
                ...item,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: supplementPlanInclude,
    });
  });

  return NextResponse.json(plan);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  const access = await requireStaffSession("supplements.write");
  if (!access.ok) return access.response;

  const { id, planId } = await params;
  const patientAccess = await requirePatientAccess(access.session, id);
  if (!patientAccess.ok) return patientAccess.response;
  const existing = await getOwnedPlan(id, planId);
  if (!existing) {
    return NextResponse.json({ error: "Supplement list not found" }, { status: 404 });
  }

  await prisma.patientSupplementPlan.delete({ where: { id: planId } });
  return NextResponse.json({ success: true });
}
