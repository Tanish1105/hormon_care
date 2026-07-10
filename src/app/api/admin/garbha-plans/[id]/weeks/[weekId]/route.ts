import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekId } = await params;
  const { title, description } = await request.json();

  const week = await prisma.garbhaWeek.update({
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
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekId } = await params;
  const { type, title, description, url, content, imageUrl, videoUrl } =
    await request.json();

  if (!type || !title) {
    return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
  }

  const count = await prisma.garbhaContent.count({ where: { weekId } });

  const item = await prisma.garbhaContent.create({
    data: {
      weekId,
      type,
      title,
      description: description || null,
      url: url || null,
      content: content || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      sortOrder: count,
    },
  });

  return NextResponse.json(item);
}
