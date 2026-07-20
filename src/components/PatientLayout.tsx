"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, Baby, GraduationCap, ClipboardCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";
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
      if (cached && Array.isArray(cached.assignedPlans)) {
        setStatus(cached);
        return;
      }
      if (cached && !Array.isArray(cached.assignedPlans)) {
        invalidateGateStatusCache();
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
      <div className="relative min-h-screen overflow-x-hidden bg-[#faf6f3] text-slate-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(190,24,93,0.12),_transparent_55%),radial-gradient(ellipse_at_80%_0%,_rgba(251,146,60,0.1),_transparent_45%)]"
        />

        <header className="sticky top-0 z-10 border-b border-[#eadfd6]/80 bg-[#faf6f3]/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5">
            <Link href="/patient" className="flex items-center gap-2.5">
              <BrandLogo size="sm" />
              <span className="text-base font-semibold tracking-tight text-slate-900">
                Hormone care
              </span>
            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-2">
              {showLifestyleNav &&
                (lifestyleBlocked ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-2 text-sm font-medium text-sky-900">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Assessment</span>
                  </span>
                ) : (
                  <Link
                    href="/patient/lifestyle-assessment"
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition",
                      pathname === "/patient/lifestyle-assessment"
                        ? "bg-sky-100 text-sky-900"
                        : "text-slate-600 hover:bg-white/70"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Assessment</span>
                  </Link>
                ))}

              {showFollowupNav && (
                <Link
                  href={`/patient/followup?week=${status?.followup.nextDueWeek ?? status?.followup.pendingWeeks[0] ?? 1}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition",
                    pathname === "/patient/followup"
                      ? "bg-amber-100 text-amber-900"
                      : "text-slate-600 hover:bg-white/70"
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
                      className="flex max-w-[9rem] cursor-not-allowed items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-300 sm:max-w-[12rem]"
                      title="Complete lifestyle assessment first"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="max-w-[7rem] truncate sm:max-w-[10rem]">{item.title}</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    className={cn(
                      "flex max-w-[9rem] items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition sm:max-w-[12rem]",
                      active
                        ? "bg-pink-600 text-white shadow-sm shadow-pink-600/20"
                        : "text-slate-600 hover:bg-white/70"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="max-w-[7rem] truncate sm:max-w-[10rem]">{item.title}</span>
                  </Link>
                );
              })}

              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-slate-500 transition hover:bg-white/70 hover:text-slate-800"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </header>

        {lifestyleBlocked && (
          <div className="relative border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            {status?.blockMessage}
          </div>
        )}

        <main className="relative mx-auto max-w-4xl px-4 py-8">
          {lifestyleBlocked && !isLifestyleExempt ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="font-medium text-amber-950">Lifestyle assessment pending</p>
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
