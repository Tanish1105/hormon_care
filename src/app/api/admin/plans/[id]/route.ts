import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";
import { planInclude } from "@/lib/plan-includes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("plans.read");
  if (!access.ok) return access.response;
  const session = access.session;

  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: planInclude,
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { id } = await params;
  const { title, description, imageUrl, videoUrl } = await request.json();

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      title,
      description,
      imageUrl,
      videoUrl,
    },
    include: planInclude,
  });

  return NextResponse.json(plan);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { id } = await params;
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
