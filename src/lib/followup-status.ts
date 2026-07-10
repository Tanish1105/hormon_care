import { getFollowupCompulsory } from "@/lib/app-settings";
import { generateAssessmentAccessToken, buildFollowupFormUrl } from "@/lib/assessment-link";
import { getDueFollowupWeeks } from "@/lib/weekly-followup";
import { prisma } from "@/lib/prisma";

type FollowupProfile = {
  id: string;
  startDate: Date;
  currentWeek: number;
  followupAccessToken: string | null;
  plan: { totalWeeks: number; title?: string } | null;
  weeklyFollowups: { weekNumber: number }[];
  user?: { name: string };
};

export async function ensureFollowupAccessToken(patientProfileId: string) {
  return prisma.patientProfile.update({
    where: { id: patientProfileId },
    data: { followupAccessToken: generateAssessmentAccessToken() },
    select: { followupAccessToken: true },
  });
}

export async function buildFollowupStatus(
  profile: FollowupProfile,
  options?: { origin?: string }
) {
  const compulsory = await getFollowupCompulsory();

  if (!profile.plan) {
    return {
      hasCarePlan: false,
      compulsory,
      pendingWeeks: [] as number[],
      nextDueWeek: null as number | null,
      submittedWeeks: [] as number[],
      blocked: false,
      showPrompt: false,
      formLink: null as string | null,
      patientName: profile.user?.name ?? "",
    };
  }

  const submittedWeeks = profile.weeklyFollowups.map((f) => f.weekNumber);
  const pendingWeeks = getDueFollowupWeeks(
    profile.startDate,
    profile.currentWeek,
    profile.plan.totalWeeks,
    submittedWeeks
  );

  let accessToken = profile.followupAccessToken;
  if (pendingWeeks.length > 0 && !accessToken) {
    try {
      const updated = await ensureFollowupAccessToken(profile.id);
      accessToken = updated.followupAccessToken;
    } catch {
      accessToken = null;
    }
  }

  const formLink =
    pendingWeeks.length > 0 && accessToken
      ? buildFollowupFormUrl(accessToken, options?.origin)
      : null;

  return {
    hasCarePlan: true,
    compulsory,
    pendingWeeks,
    nextDueWeek: pendingWeeks[0] ?? null,
    submittedWeeks,
    blocked: false,
    showPrompt: pendingWeeks.length > 0 && compulsory,
    formLink,
    patientName: profile.user?.name ?? "",
    planTitle: profile.plan.title ?? "",
  };
}
