import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  generateAssessmentAccessToken,
  buildAssessmentFormUrl,
} from "@/lib/assessment-link";

type RouteParams = { params: Promise<{ id: string }> };

const RESET_FIELDS = {
  requestedAt: new Date(),
  submittedAt: null,
  exerciseFrequency: null,
  exerciseDuration: null,
  exerciseType: null,
  heightCm: null,
  weightKg: null,
  bmi: null,
  sleepHours: null,
  sleepQuality: null,
  nightShift: null,
  stressQ1: null,
  stressQ2: null,
  stressQ3: null,
  stressQ4: null,
  stressQ5: null,
  stressQ6: null,
  stressQ7: null,
  stressQ8: null,
  stressQ9: null,
  stressQ10: null,
  stressScreeningScore: null,
  stressLevel: null,
  stressReason: null,
  dietType: null,
  breakfast: null,
  fastFood: null,
  waterIntake: null,
  teaCoffee: null,
  coldDrinks: null,
  sugarItems: null,
  knownConditions: null,
  irregularMenses: null,
  supplements: null,
  motherFamilyHistory: null,
  fatherFamilyHistory: null,
  partnerSmoking: null,
  partnerAlcohol: null,
  partnerExercise: null,
  lifestyleScore: null,
  doctorRecommendation: null,
} as const;

export async function POST(req: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: patientProfileId } = await params;
  const profile = await prisma.patientProfile.findUnique({
    where: { id: patientProfileId },
    include: { lifestyleAssessment: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const accessToken = generateAssessmentAccessToken();
  const origin = new URL(req.url).origin;

  const assessment = await prisma.lifestyleAssessment.upsert({
    where: { patientProfileId },
    create: {
      patientProfileId,
      accessToken,
      ...RESET_FIELDS,
    },
    update: {
      accessToken,
      ...RESET_FIELDS,
    },
  });

  const formLink = buildAssessmentFormUrl(accessToken, origin);

  return NextResponse.json({
    assessment,
    formLink,
    message: "Lifestyle assessment sent to patient",
  });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: patientProfileId } = await params;
  await prisma.lifestyleAssessment.deleteMany({ where: { patientProfileId } });
  return NextResponse.json({ ok: true });
}
