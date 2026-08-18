import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { contentId } = await params;
  await prisma.garbhaContent.delete({ where: { id: contentId } });
  return NextResponse.json({ success: true });
}
