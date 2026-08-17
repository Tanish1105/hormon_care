import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.supplement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
  }

  const { name, description, defaultTime, defaultQuantity, sortOrder } = await request.json();
  const trimmedName = name !== undefined ? String(name).trim() : existing.name;
  if (!trimmedName) {
    return NextResponse.json({ error: "Supplement name is required" }, { status: 400 });
  }

  const item = await prisma.supplement.update({
    where: { id },
    data: {
      name: trimmedName,
      description:
        description !== undefined ? description?.trim() || null : undefined,
      defaultTime:
        defaultTime !== undefined ? defaultTime?.trim() || null : undefined,
      defaultQuantity:
        defaultQuantity !== undefined ? defaultQuantity?.trim() || null : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.supplement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
  }

  await prisma.supplement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
