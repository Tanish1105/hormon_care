import { buildFollowupStatus } from "@/lib/followup-status";

type GateProfile = {
  id: string;
  startDate: Date;
  currentWeek: number;
  followupAccessToken: string | null;
  plan: { totalWeeks: number; title?: string } | null;
  weeklyFollowups: { weekNumber: number }[];
  user?: { name: string };
  lifestyleAssessment: {
    requestedAt: Date | null;
    submittedAt: Date | null;
  } | null;
};

export async function buildPatientGateStatus(
  profile: GateProfile,
  options?: { origin?: string }
) {
  const followup = await buildFollowupStatus(profile, options);

  const lifestyleRequested =
    profile.lifestyleAssessment?.requestedAt != null &&
    profile.lifestyleAssessment.submittedAt == null;

  const lifestyleBlocked = lifestyleRequested;

  let blocked = false;
  let blockType: "lifestyle" | "followup" | null = null;
  let redirectTo: string | null = null;
  let blockMessage = "";

  if (lifestyleBlocked) {
    blocked = true;
    blockType = "lifestyle";
    redirectTo = "/patient/lifestyle-assessment";
    blockMessage = "Lifestyle Assessment form pending. Please complete it to continue.";
  }

  return {
    lifestyle: {
      requested: profile.lifestyleAssessment?.requestedAt != null,
      submitted: profile.lifestyleAssessment?.submittedAt != null,
      pending: lifestyleRequested,
      blocked: lifestyleBlocked,
    },
    followup: {
      ...followup,
      showPrompt: followup.showPrompt && !lifestyleBlocked,
    },
    blocked,
    blockType,
    redirectTo,
    blockMessage,
    patientName: profile.user?.name ?? "",
  };
}
