"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, Badge } from "@/components/ui";
import { PlanBreadcrumb, PatientWeekPicker, PatientDayPicker } from "@/components/PlanWeekDay";
import { isWeekUnlocked, isDayUnlocked, formatDisplayDate } from "@/lib/utils";
import { useMidnightRefresh } from "@/hooks/useMidnightRefresh";
import { writeGateStatusCache } from "@/lib/gate-status-cache";
import { FullscreenImage } from "@/components/FullscreenImage";
import { FullscreenVideo } from "@/components/FullscreenVideo";
import { FullscreenYoutube } from "@/components/FullscreenYoutube";
import { Dumbbell, Video, ExternalLink, ImageIcon } from "lucide-react";

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
  const Icon = contentIcons[item.type as keyof typeof contentIcons] || Dumbbell;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-purple-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium">{item.title}</h4>
            <Badge color="purple">{item.type}</Badge>
          </div>
          {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
          {item.content && (
            <div className="mt-3 rounded-lg bg-white p-4 text-sm whitespace-pre-wrap">{item.content}</div>
          )}
          {item.imageUrl && (
            <FullscreenImage src={item.imageUrl} alt={item.title} protected className="mt-3 max-h-72 w-full rounded-lg object-contain" />
          )}
          {item.videoUrl && (
            <FullscreenVideo src={item.videoUrl} title={item.title} protected className="mt-3 w-full rounded-lg" />
          )}
          {item.type === "IMAGE" && item.url && (
            <FullscreenImage src={item.url} alt={item.title} protected className="mt-3 max-h-72 w-full rounded-lg object-contain" />
          )}
          {item.type === "YOUTUBE" && (
            <FullscreenYoutube contentId={item.id} source="plan" secure title={item.title} />
          )}
          {item.type === "VIDEO" && item.url && (
            <FullscreenVideo src={item.url} title={item.title} protected className="mt-3 w-full rounded-lg" />
          )}
        </div>
      </div>
    </div>
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
        <Card className="text-center">
          <p className="font-medium text-slate-800">Plan load થઈ શક્યો નહીં</p>
          <p className="mt-2 text-sm text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            ફરી પ્રયાસ કરો
          </button>
        </Card>
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

  function selectWeek(weekNumber: number) {
    setSelectedWeek(weekNumber);
    setSelectedDay(1);
  }

  return (
    <PatientLayout>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">નમસ્તે, {profile.user.name}</h1>
        <p className="text-slate-500">Patient ID: {profile.user.username}</p>
      </div>

      {profile.requirements && (
        <Card className="mt-6 border-purple-100 bg-purple-50/50">
          <h2 className="font-semibold text-purple-900">તમારી Requirements</h2>
          <p className="mt-2 text-sm text-purple-800">{profile.requirements}</p>
        </Card>
      )}

      {!plan ? (
        <Card className="mt-6 text-center">
          <p className="text-slate-500">હજુ plan assign નથી. Doctor સાથે contact કરો.</p>
        </Card>
      ) : unlockedWeek === 0 ? (
        <Card className="mt-6 border-amber-200 bg-amber-50 text-center">
          <h2 className="text-lg font-semibold text-amber-900">{plan.title}</h2>
          <p className="mt-3 text-amber-800">
            તમારો plan <strong>{formatDisplayDate(profile.startDate)}</strong> થી શરૂ થશે.
          </p>
          <p className="mt-1 text-sm text-amber-700">આ તારીખ સુધી content unlock નહીં થાય.</p>
        </Card>
      ) : (
        <>
          <Card className="mt-6">
            {plan.imageUrl && (
              <FullscreenImage src={plan.imageUrl} alt={plan.title} protected className="mb-4 max-h-40 w-full rounded-lg object-cover" />
            )}
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
            {plan.videoUrl && (
              <FullscreenVideo src={plan.videoUrl} title={plan.title} protected className="mt-3 w-full rounded-lg" />
            )}
            <p className="mt-3 text-sm">
              હાલ unlock: <Badge color="green">Week {unlockedWeek}</Badge>
              {plan.isDayWise && (
                <span className="ml-2">
                  <Badge color="green">Day {unlockedDay}</Badge>
                </span>
              )}
            </p>
          </Card>

          <div className="mt-4">
            <PatientWeekPicker
              weeks={plan.weeks}
              activeWeek={selectedWeek}
              unlockedWeek={unlockedWeek}
              onSelectWeek={selectWeek}
              isDayWise={plan.isDayWise}
            />
          </div>

          {plan.isDayWise && week && weekUnlocked && (
            <div className="mt-4">
              <PatientDayPicker
                days={week.days}
                activeDay={selectedDay}
                unlockedDay={unlockedDay}
                unlockedWeek={unlockedWeek}
                activeWeek={selectedWeek}
                onSelectDay={setSelectedDay}
              />
            </div>
          )}

          <div className="mt-4 space-y-4">
            {week && weekUnlocked && dayUnlocked ? (
              <Card className="border-2 border-pink-200">
                <div className="border-b border-pink-100 bg-pink-50/50 -mx-4 -mt-4 mb-4 rounded-t-xl px-4 py-4 sm:-mx-6 sm:-mt-6 sm:mb-6 sm:px-6">
                  <PlanBreadcrumb
                    planTitle={plan.title}
                    weekNumber={week.weekNumber}
                    dayNumber={plan.isDayWise ? selectedDay : undefined}
                  />
                  <h2 className="mt-2 text-lg font-bold text-pink-900 sm:text-xl">
                    {plan.isDayWise
                      ? `Week ${week.weekNumber} · Day ${selectedDay}: ${day?.title ?? ""}`
                      : `Week ${week.weekNumber}: ${week.title}`}
                  </h2>
                  {plan.isDayWise ? (
                    day?.description && <p className="mt-1 text-sm text-pink-700">{day.description}</p>
                  ) : (
                    week.description && <p className="mt-1 text-sm text-pink-700">{week.description}</p>
                  )}
                </div>

                {activeContents.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    {plan.isDayWise
                      ? `Day ${selectedDay} માટે હજુ content add નથી થયું`
                      : `Week ${week.weekNumber} માટે હજુ content add નથી થયું`}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeContents.map((item) => (
                      <ContentItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </Card>
            ) : week && weekUnlocked && plan.isDayWise ? (
              <Card className="text-center">
                <p className="text-slate-500">આ day માટે plan ઉપલબ્ધ નથી.</p>
              </Card>
            ) : (
              <Card className="text-center">
                <p className="text-slate-500">આ week માટે plan ઉપલબ્ધ નથી.</p>
              </Card>
            )}
          </div>
        </>
      )}
    </PatientLayout>
  );
}
