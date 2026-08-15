"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PatientLayout } from "@/components/PatientLayout";
import { PatientWeekPicker, PatientDayPicker } from "@/components/PlanWeekDay";
import { isWeekUnlocked, isDayUnlocked, formatDisplayDate } from "@/lib/utils";
import { useMidnightRefresh } from "@/hooks/useMidnightRefresh";
import { writeGateStatusCache } from "@/lib/gate-status-cache";
import { FullscreenImage } from "@/components/FullscreenImage";
import { FullscreenVideo } from "@/components/FullscreenVideo";
import { FullscreenYoutube } from "@/components/FullscreenYoutube";
import { cn } from "@/lib/utils";
import { CalendarDays, Dumbbell, ExternalLink, ImageIcon, Sparkles, Video } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

type Content = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
};

type Day = {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  contents: Content[];
};

type Week = {
  id: string;
  weekNumber: number;
  title: string;
  description: string | null;
  contents: Content[];
  days: Day[];
};

type DashboardData = {
  profile: {
    requirements: string | null;
    startDate: string;
    user: { name: string; username: string };
    plan: {
      title: string;
      description: string | null;
      imageUrl: string | null;
      videoUrl: string | null;
      totalWeeks: number;
      isDayWise: boolean;
      weeks: Week[];
    } | null;
  };
  unlockedWeek: number;
  unlockedDay: number;
  followup?: {
    blocked: boolean;
    nextDueWeek: number | null;
    pendingWeeks: number[];
  };
  gate?: {
    blocked: boolean;
    redirectTo: string | null;
  };
};

const contentIcons = {
  EXERCISE: Dumbbell,
  VIDEO: Video,
  YOUTUBE: ExternalLink,
  IMAGE: ImageIcon,
};

function ContentItem({ item }: { item: Content }) {
  const Icon = contentIcons[item.type as keyof typeof contentIcons] || Sparkles;
  const hasMedia =
    Boolean(item.imageUrl) ||
    Boolean(item.videoUrl) ||
    item.type === "YOUTUBE" ||
    (item.type === "IMAGE" && Boolean(item.url)) ||
    (item.type === "VIDEO" && Boolean(item.url));

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:border-[var(--primary)]/25">
      <div className="flex items-start gap-3 border-b border-[var(--border)]/70 px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">{item.title}</h4>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {item.type}
            </span>
          </div>
          {item.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
          )}
        </div>
      </div>

      <div className={cn("space-y-3 p-4", hasMedia && "pt-3")}>
        {item.content && (
          <div className="rounded-xl bg-[#f2f6f3] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
            {item.content}
          </div>
        )}
        {item.imageUrl && (
          <FullscreenImage
            src={item.imageUrl}
            alt={item.title}
            protected
            className="max-h-80 w-full rounded-xl object-contain"
          />
        )}
        {item.videoUrl && (
          <FullscreenVideo
            src={item.videoUrl}
            title={item.title}
            protected
            className="w-full rounded-xl"
          />
        )}
        {item.type === "IMAGE" && item.url && (
          <FullscreenImage
            src={item.url}
            alt={item.title}
            protected
            className="max-h-80 w-full rounded-xl object-contain"
          />
        )}
        {item.type === "YOUTUBE" && (
          <FullscreenYoutube contentId={item.id} source="plan" secure title={item.title} />
        )}
        {item.type === "VIDEO" && item.url && (
          <FullscreenVideo
            src={item.url}
            title={item.title}
            protected
            className="w-full rounded-xl"
          />
        )}
      </div>
    </article>
  );
}

export default function PatientDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setLoadError("");
    fetch("/api/patient/dashboard")
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          let message = "Could not load your plan.";
          try {
            const body = text ? JSON.parse(text) : null;
            if (body?.error) message = body.error;
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }
        if (!text) throw new Error("Empty dashboard response");
        return JSON.parse(text) as DashboardData;
      })
      .then((d) => {
        if (d.gate) {
          writeGateStatusCache(d.gate);
        }
        if (d.gate?.blocked && d.gate.redirectTo) {
          router.replace(d.gate.redirectTo);
          return;
        }
        setData(d);
        setSelectedWeek(d.unlockedWeek || 1);
        setSelectedDay(d.unlockedDay || 1);
      })
      .catch((err: Error) => {
        setData(null);
        setLoadError(err.message || "Could not load your plan.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useMidnightRefresh(loadDashboard);

  if (loading && !data) {
    return (
      <PatientLayout>
        <p className="text-slate-500">Loading...</p>
      </PatientLayout>
    );
  }

  if (!data) {
    return (
      <PatientLayout>
        <div className="rounded-2xl border border-[#d5e2d8] bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-800">Plan load થઈ શક્યો નહીં</p>
          <p className="mt-2 text-sm text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#185738]"
          >
            ફરી પ્રયાસ કરો
          </button>
        </div>
      </PatientLayout>
    );
  }

  const { profile, unlockedWeek, unlockedDay } = data;
  const plan = profile.plan;
  const week = plan?.weeks.find((w) => w.weekNumber === selectedWeek);
  const day = week?.days?.find((d) => d.dayNumber === selectedDay);
  const weekUnlocked = week && isWeekUnlocked(week.weekNumber, unlockedWeek);
  const dayUnlocked = plan?.isDayWise
    ? day && isDayUnlocked(day.dayNumber, selectedWeek, unlockedWeek, unlockedDay)
    : true;
  const activeContents = plan?.isDayWise ? (day?.contents ?? []) : (week?.contents ?? []);
  const progressPct = plan
    ? Math.min(100, Math.round((unlockedWeek / Math.max(plan.totalWeeks, 1)) * 100))
    : 0;

  function selectWeek(weekNumber: number) {
    setSelectedWeek(weekNumber);
    setSelectedDay(1);
  }

  return (
    <PatientLayout>
      <section className="animate-jeevanm-rise relative mb-2 overflow-hidden pb-4 pt-1">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[rgba(31,107,69,0.08)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[rgba(201,162,39,0.10)]"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-wide text-[var(--primary)]">
                JEEVANM
              </p>
              <p className="mt-0.5 text-[9px] font-semibold tracking-wide text-[var(--primary)] sm:text-[10px]">
                Transforming Habits Into Health
              </p>
            </div>
          </div>

          {plan && unlockedWeek > 0 ? (
            <div className="mt-5 w-full max-w-md rounded-2xl border border-[var(--border)] bg-white/85 p-5 shadow-[0_12px_40px_rgba(20,32,26,0.05)] backdrop-blur-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                    Progress
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                    {plan.title}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-[var(--gold-soft)] px-2.5 py-1.5 text-sm font-bold text-[var(--secondary)]">
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-md bg-[var(--primary-light)]">
                <div
                  className="h-full rounded-md bg-[linear-gradient(90deg,var(--primary),#2f8a58_70%,var(--secondary))] transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
                Week {unlockedWeek}/{plan.totalWeeks}
                {plan.isDayWise ? ` · Day ${unlockedDay}` : null}
              </p>
            </div>
          ) : (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {plan
                ? "તમારી આરોગ્ય સંસ્કૃતિ નીચે જુઓ."
                : "હજુ plan assign નથી. Doctor સાથે contact કરો."}
            </p>
          )}
        </div>
      </section>

      {profile.requirements && (
        <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-4">
          <h2 className="text-sm font-semibold text-amber-950">તમારી Requirements</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-900/90">{profile.requirements}</p>
        </div>
      )}

      {!plan ? (
        <div className="mt-6 rounded-2xl border border-[#d5e2d8] bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">હજુ plan assign નથી. Doctor સાથે contact કરો.</p>
        </div>
      ) : unlockedWeek === 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-amber-950">{plan.title}</h2>
          <p className="mt-3 text-amber-900">
            તમારો plan <strong>{formatDisplayDate(profile.startDate)}</strong> થી શરૂ થશે.
          </p>
          <p className="mt-1 text-sm text-amber-800">આ તારીખ સુધી content unlock નહીં થાય.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {(plan.imageUrl || plan.description || plan.videoUrl) && (
            <div className="overflow-hidden rounded-2xl border border-[#d5e2d8] bg-white shadow-sm">
              {plan.imageUrl && (
                <FullscreenImage
                  src={plan.imageUrl}
                  alt={plan.title}
                  protected
                  className="max-h-48 w-full object-cover"
                />
              )}
              <div className="px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
                {plan.description && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{plan.description}</p>
                )}
                {plan.videoUrl && (
                  <FullscreenVideo
                    src={plan.videoUrl}
                    title={plan.title}
                    protected
                    className="mt-3 w-full rounded-xl"
                  />
                )}
              </div>
            </div>
          )}

          <PatientWeekPicker
            weeks={plan.weeks}
            activeWeek={selectedWeek}
            unlockedWeek={unlockedWeek}
            onSelectWeek={selectWeek}
            isDayWise={plan.isDayWise}
          />

          {plan.isDayWise && week && weekUnlocked && (
            <PatientDayPicker
              days={week.days}
              activeDay={selectedDay}
              unlockedDay={unlockedDay}
              unlockedWeek={unlockedWeek}
              activeWeek={selectedWeek}
              onSelectDay={setSelectedDay}
            />
          )}

          {week && weekUnlocked && dayUnlocked ? (
            <section className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-sm">
              <div className="border-b border-[var(--border)] bg-[linear-gradient(120deg,#e8f3ec,#ffffff_55%)] px-5 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]/70">
                  {plan.title}
                  <span className="mx-1.5 text-[var(--secondary)]">/</span>
                  Week {week.weekNumber}
                  {plan.isDayWise ? (
                    <>
                      <span className="mx-1.5 text-[var(--secondary)]">/</span>
                      Day {selectedDay}
                    </>
                  ) : null}
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {plan.isDayWise
                    ? `Day ${selectedDay}: ${day?.title ?? ""}`
                    : `Week ${week.weekNumber}: ${week.title}`}
                </h2>
                {plan.isDayWise
                  ? day?.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{day.description}</p>
                    )
                  : week.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{week.description}</p>
                    )}
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {activeContents.length === 0 ? (
                  <p className="py-10 text-center text-slate-500">
                    {plan.isDayWise
                      ? `Day ${selectedDay} માટે હજુ content add નથી થયું`
                      : `Week ${week.weekNumber} માટે હજુ content add નથી થયું`}
                  </p>
                ) : (
                  activeContents.map((item) => <ContentItem key={item.id} item={item} />)
                )}
              </div>
            </section>
          ) : week && weekUnlocked && plan.isDayWise ? (
            <div className="rounded-2xl border border-[#d5e2d8] bg-white p-8 text-center text-slate-500 shadow-sm">
              આ day માટે plan ઉપલબ્ધ નથી.
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d5e2d8] bg-white p-8 text-center text-slate-500 shadow-sm">
              આ week માટે plan ઉપલબ્ધ નથી.
            </div>
          )}
        </div>
      )}
    </PatientLayout>
  );
}
