import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";
import { parsePlanContentInput } from "@/lib/plan-content-input";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { weekId } = await params;
  const { title, description } = await request.json();

  const week = await prisma.planWeek.update({
    where: { id: weekId },
    data: { title, description },
    include: { contents: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(week);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { weekId } = await params;
  const parsed = parsePlanContentInput(await request.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const count = await prisma.weekContent.count({ where: { weekId } });

  const item = await prisma.weekContent.create({
    data: {
      weekId,
      section: parsed.section,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      url: parsed.url,
      content: parsed.content,
      imageUrl: parsed.imageUrl,
      videoUrl: parsed.videoUrl,
      sortOrder: count,
    },
  });

  return NextResponse.json(item);
}
