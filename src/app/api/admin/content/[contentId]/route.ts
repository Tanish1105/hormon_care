import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { contentId } = await params;
  const { type, title, description, url, content, imageUrl, videoUrl } =
    await request.json();

  const item = await prisma.weekContent.update({
    where: { id: contentId },
    data: { type, title, description, url, content, imageUrl, videoUrl },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { contentId } = await params;
  await prisma.weekContent.delete({ where: { id: contentId } });
  return NextResponse.json({ success: true });
}
