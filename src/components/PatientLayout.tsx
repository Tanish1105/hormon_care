"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut, Home, Baby, GraduationCap, ClipboardCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentProtection } from "@/components/ContentProtection";
import { FollowupPromptModal } from "@/components/FollowupPromptModal";
import { useMidnightRefresh } from "@/hooks/useMidnightRefresh";
import {
  invalidateGateStatusCache,
  readGateStatusCache,
  writeGateStatusCache,
} from "@/lib/gate-status-cache";

type AssignedPlanNav = {
  href: string;
  title: string;
  program: "care" | "garbha" | "child";
};

type GateStatus = {
  blocked: boolean;
  blockType: "lifestyle" | "followup" | null;
  redirectTo: string | null;
  blockMessage: string;
  patientName: string;
  assignedPlans: AssignedPlanNav[];
  lifestyle: { pending: boolean };
  followup: {
    hasCarePlan: boolean;
    pendingWeeks: number[];
    nextDueWeek: number | null;
    showPrompt: boolean;
    formLink: string | null;
  };
};

const planIcons = {
  care: Home,
  garbha: Baby,
  child: GraduationCap,
} as const;

const lifestyleExemptPaths = ["/patient/lifestyle-assessment"];
const followupExemptPaths = ["/patient/followup"];

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<GateStatus | null>(null);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const lastFetchRef = useRef(0);

  const loadStatus = useCallback((force = false) => {
    const now = Date.now();
    if (!force) {
      const cached = readGateStatusCache<GateStatus>();
      if (cached) {
        setStatus(cached);
        return;
      }
      if (now - lastFetchRef.current < 15_000) return;
    }

    lastFetchRef.current = now;
    fetch("/api/patient/gate-status")
      .then(async (r) => {
        if (!r.ok) throw new Error("gate-status failed");
        return r.json() as Promise<GateStatus>;
      })
      .then((data) => {
        writeGateStatusCache(data);
        setStatus(data);
      })
      .catch(() => setStatus((prev) => prev));
  }, []);

  useEffect(() => {
    // On dashboard page, dashboard API already returns gate — wait briefly so it can fill cache first
    const delay = pathname === "/patient" ? 500 : 0;
    const timer = setTimeout(() => loadStatus(), delay);
    return () => clearTimeout(timer);
  }, [loadStatus, pathname]);

  useMidnightRefresh(() => loadStatus(true));

  const lifestyleBlocked = status?.blocked && status.blockType === "lifestyle";
  const isLifestyleExempt = lifestyleExemptPaths.includes(pathname);
  const isFollowupExempt = followupExemptPaths.includes(pathname);

  useEffect(() => {
    if (!lifestyleBlocked || !status?.redirectTo) return;
    if (isLifestyleExempt) return;
    router.replace(status.redirectTo);
  }, [status, lifestyleBlocked, isLifestyleExempt, router]);

  useEffect(() => {
    if (!status?.followup.showPrompt || isFollowupExempt || lifestyleBlocked) {
      setFollowupModalOpen(false);
      return;
    }
    setFollowupModalOpen(true);
  }, [status, pathname, isFollowupExempt, lifestyleBlocked]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < 60_000) return;
      loadStatus(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadStatus]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function handleFollowupSubmitted() {
    invalidateGateStatusCache();
    loadStatus(true);
    setFollowupModalOpen(false);
  }

  const showLifestyleNav = status?.lifestyle.pending || pathname === "/patient/lifestyle-assessment";
  const showFollowupNav =
    status?.followup.hasCarePlan &&
    (status.followup.pendingWeeks.length > 0 || pathname === "/patient/followup");

  return (
    <ContentProtection>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="border-b border-purple-100 bg-white/90 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-purple-700">Hormon Care</span>
            </div>
            <nav className="flex items-center gap-2">
              {showLifestyleNav && (
                lifestyleBlocked ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Assessment</span>
                  </span>
                ) : (
                  <Link
                    href="/patient/lifestyle-assessment"
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      pathname === "/patient/lifestyle-assessment"
                        ? "bg-blue-100 text-blue-800"
                        : "text-blue-700 hover:bg-blue-50"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Assessment</span>
                  </Link>
                )
              )}
              {showFollowupNav && (
                <Link
                  href={`/patient/followup?week=${status?.followup.nextDueWeek ?? status?.followup.pendingWeeks[0] ?? 1}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                    pathname === "/patient/followup"
                      ? "bg-amber-100 text-amber-800"
                      : "text-amber-700 hover:bg-amber-50"
                  )}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Followup</span>
                </Link>
              )}
              {(status?.assignedPlans ?? []).map((item) => {
                const Icon = planIcons[item.program];
                const active = pathname === item.href;
                if (lifestyleBlocked) {
                  return (
                    <span
                      key={item.href}
                      className="flex max-w-[9rem] cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 sm:max-w-[12rem]"
                      title="Complete lifestyle assessment first"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden truncate sm:inline">{item.title}</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    className={cn(
                      "flex max-w-[9rem] items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition sm:max-w-[12rem]",
                      active
                        ? "bg-purple-100 text-purple-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden truncate sm:inline">{item.title}</span>
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </header>

        {lifestyleBlocked && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            {status?.blockMessage}
          </div>
        )}

        <main className="mx-auto max-w-4xl px-4 py-8">
          {lifestyleBlocked && !isLifestyleExempt ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="font-medium text-amber-900">Lifestyle assessment pending</p>
              <p className="mt-2 text-sm text-amber-800">Redirecting...</p>
            </div>
          ) : (
            children
          )}
        </main>

        {followupModalOpen &&
          status?.followup.nextDueWeek &&
          !lifestyleBlocked &&
          !isFollowupExempt && (
            <FollowupPromptModal
              weekNumber={status.followup.nextDueWeek}
              patientName={status.patientName}
              onSubmitted={handleFollowupSubmitted}
              onViewPlan={() => setFollowupModalOpen(false)}
            />
          )}
      </div>
    </ContentProtection>
  );
}
