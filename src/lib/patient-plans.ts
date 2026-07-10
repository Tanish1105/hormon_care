import { prisma } from "@/lib/prisma";
import { createWeekDaysData, createWeeksData } from "@/lib/plan-includes";
import { buildWeeksCreateData, weekCopyInclude } from "@/lib/custom-plan-copy";

export type PatientProgram = "care" | "garbha" | "child";

const programConfig = {
  care: {
    planIdField: "planId" as const,
    listFilter: { isCustom: false },
    editPath: (id: string) => `/admin/plans/${id}`,
  },
  garbha: {
    planIdField: "garbhaPlanId" as const,
    listFilter: { isCustom: false },
    editPath: (id: string) => `/admin/garbha-sanskar/${id}`,
  },
  child: {
    planIdField: "childGuidancePlanId" as const,
    listFilter: { isCustom: false },
    editPath: (id: string) => `/admin/child-guidance/${id}`,
  },
};

export function getProgramEditPath(program: PatientProgram, planId: string) {
  return programConfig[program].editPath(planId);
}

export async function deleteCustomPlanIfNeeded(
  program: PatientProgram,
  planId: string | null | undefined
) {
  if (!planId) return;

  if (program === "care") {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { isCustom: true },
    });
    if (plan?.isCustom) await prisma.plan.delete({ where: { id: planId } });
    return;
  }

  if (program === "garbha") {
    const plan = await prisma.garbhaPlan.findUnique({
      where: { id: planId },
      select: { isCustom: true },
    });
    if (plan?.isCustom) await prisma.garbhaPlan.delete({ where: { id: planId } });
    return;
  }

  const plan = await prisma.childGuidancePlan.findUnique({
    where: { id: planId },
    select: { isCustom: true },
  });
  if (plan?.isCustom) await prisma.childGuidancePlan.delete({ where: { id: planId } });
}

async function cloneCarePlan(sourceId: string, title: string) {
  const source = await prisma.plan.findUnique({
    where: { id: sourceId },
    include: { weeks: { include: weekCopyInclude, orderBy: { weekNumber: "asc" } } },
  });
  if (!source) return null;

  return prisma.plan.create({
    data: {
      title,
      description: source.description,
      imageUrl: source.imageUrl,
      videoUrl: source.videoUrl,
      totalWeeks: source.totalWeeks,
      isCustom: true,
      isDayWise: source.isDayWise,
      weeks: { create: buildWeeksCreateData(source.weeks, source.isDayWise) },
    },
  });
}

async function cloneGarbhaPlan(sourceId: string, title: string) {
  const source = await prisma.garbhaPlan.findUnique({
    where: { id: sourceId },
    include: { weeks: { include: weekCopyInclude, orderBy: { weekNumber: "asc" } } },
  });
  if (!source) return null;

  return prisma.garbhaPlan.create({
    data: {
      title,
      description: source.description,
      imageUrl: source.imageUrl,
      videoUrl: source.videoUrl,
      totalWeeks: source.totalWeeks,
      isCustom: true,
      isDayWise: source.isDayWise,
      weeks: { create: buildWeeksCreateData(source.weeks, source.isDayWise) },
    },
  });
}

async function cloneChildPlan(sourceId: string, title: string) {
  const source = await prisma.childGuidancePlan.findUnique({
    where: { id: sourceId },
    include: { weeks: { include: weekCopyInclude, orderBy: { weekNumber: "asc" } } },
  });
  if (!source) return null;

  return prisma.childGuidancePlan.create({
    data: {
      title,
      description: source.description,
      imageUrl: source.imageUrl,
      videoUrl: source.videoUrl,
      totalWeeks: source.totalWeeks,
      isCustom: true,
      isDayWise: source.isDayWise,
      weeks: { create: buildWeeksCreateData(source.weeks, source.isDayWise) },
    },
  });
}

export async function createPatientPlanCopy(
  program: PatientProgram,
  sourcePlanId: string,
  title: string
) {
  if (program === "care") return cloneCarePlan(sourcePlanId, title);
  if (program === "garbha") return cloneGarbhaPlan(sourcePlanId, title);
  return cloneChildPlan(sourcePlanId, title);
}

export async function createNewPatientPlan(
  program: PatientProgram,
  title: string,
  totalWeeks: number,
  isDayWise: boolean
) {
  const weeks = Math.max(1, totalWeeks);

  if (program === "care") {
    return prisma.plan.create({
      data: {
        title,
        totalWeeks: weeks,
        isCustom: true,
        isDayWise,
        weeks: { create: createWeeksData(weeks, isDayWise) },
      },
    });
  }

  if (program === "garbha") {
    return prisma.garbhaPlan.create({
      data: {
        title,
        totalWeeks: weeks,
        isCustom: true,
        isDayWise,
        weeks: { create: createWeeksData(weeks, isDayWise) },
      },
    });
  }

  return prisma.childGuidancePlan.create({
    data: {
      title,
      totalWeeks: weeks,
      isCustom: true,
      isDayWise,
      weeks: { create: createWeeksData(weeks, isDayWise) },
    },
  });
}

export async function assignPatientPlan(
  patientId: string,
  program: PatientProgram,
  planId: string
) {
  const field = programConfig[program].planIdField;
  return prisma.patientProfile.update({
    where: { id: patientId },
    data: { [field]: planId },
  });
}

export async function ensureEditablePatientPlan(
  patientId: string,
  program: PatientProgram,
  patientName: string
) {
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: { plan: true, garbhaPlan: true, childGuidancePlan: true },
  });
  if (!patient) return null;

  const current =
    program === "care"
      ? patient.plan
      : program === "garbha"
        ? patient.garbhaPlan
        : patient.childGuidancePlan;

  if (!current) return null;

  if (current.isCustom) {
    return { planId: current.id, editPath: getProgramEditPath(program, current.id) };
  }

  const title = `${patientName} - ${current.title}`;
  const cloned = await createPatientPlanCopy(program, current.id, title);
  if (!cloned) return null;

  await assignPatientPlan(patientId, program, cloned.id);
  return { planId: cloned.id, editPath: getProgramEditPath(program, cloned.id) };
}
