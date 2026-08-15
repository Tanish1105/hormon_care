import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = items.filter((item) => item.status === "NEW").length;

  return NextResponse.json({
    items,
    aggregate: {
      total: items.length,
      newCount,
      read: items.filter((item) => item.status === "READ").length,
      contacted: items.filter((item) => item.status === "CONTACTED").length,
    },
  });
}
