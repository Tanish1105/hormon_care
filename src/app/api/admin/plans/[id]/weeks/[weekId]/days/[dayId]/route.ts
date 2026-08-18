import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/staff-access";
import { parsePlanContentInput } from "@/lib/plan-content-input";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { dayId } = await params;
  const { title, description } = await request.json();

  const day = await prisma.planDay.update({
    where: { id: dayId },
    data: { title, description },
    include: { contents: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(day);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const access = await requireStaffSession("plans.write");
  if (!access.ok) return access.response;
  const session = access.session;

  const { dayId } = await params;
  const parsed = parsePlanContentInput(await request.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const count = await prisma.dayContent.count({ where: { dayId } });

  const item = await prisma.dayContent.create({
    data: {
      dayId,
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
