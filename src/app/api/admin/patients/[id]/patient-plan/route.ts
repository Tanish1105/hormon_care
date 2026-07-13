import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assignPatientPlan,
  createNewPatientPlan,
  createPatientPlanCopy,
  ensureEditablePatientPlan,
  type PatientProgram,
} from "@/lib/patient-plans";

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
  const program = body.program as PatientProgram;
  if (!["care", "garbha", "child"].includes(program)) {
    return NextResponse.json({ error: "Invalid program" }, { status: 400 });
  }

  if (body.action === "open") {
    const result = await ensureEditablePatientPlan(id, program, patient.user.name);
    if (!result) {
      return NextResponse.json({ error: "No plan assigned to edit" }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  const mode: "new" | "copy" = body.mode === "copy" ? "copy" : "new";
  const defaultTitle =
    program === "care"
      ? `${patient.user.name} - Custom Plan`
      : program === "garbha"
        ? `${patient.user.name} - Custom Garbh Sanskruti Plan`
        : `${patient.user.name} - Custom Parenting Sanskruti`;
  const title = (body.title && String(body.title).trim()) || defaultTitle;

  let plan;

  if (mode === "copy") {
    const sourcePlanId = body.sourcePlanId as string | undefined;
    if (!sourcePlanId) {
      return NextResponse.json({ error: "Select a source plan to copy from" }, { status: 400 });
    }
    plan = await createPatientPlanCopy(program, sourcePlanId, title);
    if (!plan) {
      return NextResponse.json({ error: "Source plan not found" }, { status: 404 });
    }
  } else {
    const weeks = Math.max(1, Number(body.totalWeeks) || 1);
    const dayWise = Boolean(body.isDayWise);
    plan = await createNewPatientPlan(program, title, weeks, dayWise);
  }

  await assignPatientPlan(id, program, plan.id);

  return NextResponse.json({ plan });
}
