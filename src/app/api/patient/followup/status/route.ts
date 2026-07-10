import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildFollowupStatus } from "@/lib/followup-status";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: { select: { name: true } },
      plan: { select: { totalWeeks: true, title: true } },
      weeklyFollowups: { select: { weekNumber: true }, orderBy: { weekNumber: "asc" } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  return NextResponse.json(await buildFollowupStatus(profile, { origin }));
}
