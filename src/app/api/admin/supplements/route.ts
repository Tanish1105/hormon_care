import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.supplement.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, defaultTime, defaultQuantity, sortOrder } = await request.json();
  const trimmedName = String(name ?? "").trim();
  if (!trimmedName) {
    return NextResponse.json({ error: "Supplement name is required" }, { status: 400 });
  }

  const last = await prisma.supplement.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await prisma.supplement.create({
    data: {
      name: trimmedName,
      description: description?.trim() || null,
      defaultTime: defaultTime?.trim() || null,
      defaultQuantity: defaultQuantity?.trim() || null,
      sortOrder: sortOrder != null ? Number(sortOrder) : (last?.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(item);
}
