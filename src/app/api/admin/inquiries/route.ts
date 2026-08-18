import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";

export async function GET() {
  const access = await requireStaffSession("inquiries.manage");
  if (!access.ok) return access.response;
  const session = access.session;

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
