import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createWeekDaysData } from "@/lib/plan-includes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const body = await request.json();
  const mode: "new" | "copy" = body.mode === "copy" ? "copy" : "new";
  const title: string =
    (body.title && String(body.title).trim()) ||
    `${patient.user.name} - Custom Plan`;

  let createData;

  if (mode === "copy") {
    const sourcePlanId = body.sourcePlanId as string | undefined;
    if (!sourcePlanId) {
      return NextResponse.json(
        { error: "Select a source plan to copy from" },
        { status: 400 }
      );
    }

    const source = await prisma.plan.findUnique({
      where: { id: sourcePlanId },
      include: {
        weeks: {
          include: {
            contents: { orderBy: { sortOrder: "asc" } },
            days: {
              include: { contents: { orderBy: { sortOrder: "asc" } } },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Source plan not found" }, { status: 404 });
    }

    createData = {
      title,
      description: source.description,
      imageUrl: source.imageUrl,
      videoUrl: source.videoUrl,
      totalWeeks: source.totalWeeks,
      isCustom: true,
      isDayWise: source.isDayWise,
      weeks: {
        create: source.weeks.map((week) => ({
          weekNumber: week.weekNumber,
          title: week.title,
          description: week.description,
          contents: {
            create: week.contents.map((c) => ({
              type: c.type,
              title: c.title,
              description: c.description,
              url: c.url,
              content: c.content,
              imageUrl: c.imageUrl,
              videoUrl: c.videoUrl,
              sortOrder: c.sortOrder,
            })),
          },
          ...(source.isDayWise
            ? {
                days: {
                  create: week.days.map((day) => ({
                    dayNumber: day.dayNumber,
                    title: day.title,
                    description: day.description,
                    contents: {
                      create: day.contents.map((c) => ({
                        type: c.type,
                        title: c.title,
                        description: c.description,
                        url: c.url,
                        content: c.content,
                        imageUrl: c.imageUrl,
                        videoUrl: c.videoUrl,
                        sortOrder: c.sortOrder,
                      })),
                    },
                  })),
                },
              }
            : {}),
        })),
      },
    };
  } else {
    const weeks = Math.max(1, Number(body.totalWeeks) || 1);
    const dayWise = Boolean(body.isDayWise);

    createData = {
      title,
      description: body.description || null,
      totalWeeks: weeks,
      isCustom: true,
      isDayWise: dayWise,
      weeks: {
        create: Array.from({ length: weeks }, (_, wi) => ({
          weekNumber: wi + 1,
          title: `Week ${wi + 1}`,
          description: null,
          ...(dayWise ? { days: { create: createWeekDaysData() } } : {}),
        })),
      },
    };
  }

  const plan = await prisma.plan.create({ data: createData });

  await prisma.patientProfile.update({
    where: { id },
    data: { planId: plan.id },
  });

  return NextResponse.json({ plan });
}
