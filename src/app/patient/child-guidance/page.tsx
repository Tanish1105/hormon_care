"use client";

import { useEffect, useState, useCallback } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Card, Badge } from "@/components/ui";
import { PlanBreadcrumb, PatientWeekPicker, PatientDayPicker } from "@/components/PlanWeekDay";
import { isWeekUnlocked, isDayUnlocked, formatDisplayDate } from "@/lib/utils";
import { useMidnightRefresh } from "@/hooks/useMidnightRefresh";
import { FullscreenImage } from "@/components/FullscreenImage";
import { FullscreenVideo } from "@/components/FullscreenVideo";
import { FullscreenYoutube } from "@/components/FullscreenYoutube";
import { Dumbbell, Video, ExternalLink, ImageIcon, GraduationCap } from "lucide-react";

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

type ChildGuidanceData = {
  profile: {
    startDate: string;
    childGuidanceStartDate?: string;
    childGuidancePlan: {
      title: string;
      description: string | null;
      imageUrl: string | null;
      videoUrl: string | null;
      totalWeeks: number;
      isDayWise: boolean;
      weeks: Week[];
    } | null;
  };
  childGuidanceUnlockedWeek: number;
  childGuidanceUnlockedDay: number;
};

const contentIcons = { EXERCISE: Dumbbell, VIDEO: Video, YOUTUBE: ExternalLink, IMAGE: ImageIcon };

function ContentItem({ item }: { item: Content }) {
  const Icon = contentIcons[item.type as keyof typeof contentIcons] || Dumbbell;
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
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
          {item.content && <div className="mt-3 rounded-lg bg-white p-4 text-sm whitespace-pre-wrap">{item.content}</div>}
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
            <FullscreenYoutube contentId={item.id} source="child-guidance" secure title={item.title} />
          )}
          {item.type === "VIDEO" && item.url && (
            <FullscreenVideo src={item.url} title={item.title} protected className="mt-3 w-full rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientChildGuidancePage() {
  const [data, setData] = useState<ChildGuidanceData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const loadDashboard = useCallback(() => {
    fetch("/api/patient/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setSelectedWeek(d.childGuidanceUnlockedWeek || 1);
        setSelectedDay(d.childGuidanceUnlockedDay || 1);
      });
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useMidnightRefresh(loadDashboard);

  if (!data) {
    return <PatientLayout><p className="text-slate-500">Loading...</p></PatientLayout>;
  }

  const plan = data.profile.childGuidancePlan;
  const { childGuidanceUnlockedWeek, childGuidanceUnlockedDay } = data;
  const week = plan?.weeks.find((w) => w.weekNumber === selectedWeek);
  const day = week?.days?.find((d) => d.dayNumber === selectedDay);
  const weekUnlocked = week && isWeekUnlocked(week.weekNumber, childGuidanceUnlockedWeek);
  const dayUnlocked = plan?.isDayWise
    ? day && isDayUnlocked(day.dayNumber, selectedWeek, childGuidanceUnlockedWeek, childGuidanceUnlockedDay)
    : true;
  const activeContents = plan?.isDayWise ? (day?.contents ?? []) : (week?.contents ?? []);

  function selectWeek(weekNumber: number) {
    setSelectedWeek(weekNumber);
    setSelectedDay(1);
  }

  return (
    <PatientLayout>
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">{plan?.title ?? "Plan"}</h1>
          <p className="text-slate-500">તમારા માટે assign કરેલો પેરેન્ટિંગ સંસ્કૃતિ plan</p>
        </div>
      </div>

      {!plan ? (
        <Card className="mt-8 text-center">
          <p className="text-slate-500">હજુ પેરેન્ટિંગ સંસ્કૃતિ plan assign નથી. Doctor સાથે contact કરો.</p>
        </Card>
      ) : childGuidanceUnlockedWeek === 0 ? (
        <Card className="mt-6 border-amber-200 bg-amber-50 text-center">
          <h2 className="text-lg font-semibold text-amber-900">{plan.title}</h2>
          <p className="mt-3 text-amber-800">
            પેરેન્ટિંગ સંસ્કૃતિ plan{" "}
            <strong>
              {formatDisplayDate(
                data.profile.childGuidanceStartDate || data.profile.startDate
              )}
            </strong>{" "}
            થી શરૂ થશે.
          </p>
          <p className="mt-1 text-sm text-amber-700">આ તારીખ સુધી content unlock નહીં થાય.</p>
        </Card>
      ) : (
        <>
          <Card className="mt-6">
            {plan.imageUrl && <FullscreenImage src={plan.imageUrl} alt={plan.title} protected className="mb-4 max-h-40 w-full rounded-lg object-cover" />}
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
            {plan.videoUrl && (
              <FullscreenVideo src={plan.videoUrl} title={plan.title} protected className="mt-3 w-full rounded-lg" />
            )}
            <p className="mt-3 text-sm">
              Unlock: <Badge color="green">Week {childGuidanceUnlockedWeek}</Badge>
              {plan.isDayWise && (
                <span className="ml-2">
                  <Badge color="green">Day {childGuidanceUnlockedDay}</Badge>
                </span>
              )}
            </p>
          </Card>

          <div className="mt-4">
            <PatientWeekPicker
              weeks={plan.weeks}
              activeWeek={selectedWeek}
              unlockedWeek={childGuidanceUnlockedWeek}
              onSelectWeek={selectWeek}
              isDayWise={plan.isDayWise}
            />
          </div>

          {plan.isDayWise && week && weekUnlocked && (
            <div className="mt-4">
              <PatientDayPicker
                days={week.days}
                activeDay={selectedDay}
                unlockedDay={childGuidanceUnlockedDay}
                unlockedWeek={childGuidanceUnlockedWeek}
                activeWeek={selectedWeek}
                onSelectDay={setSelectedDay}
              />
            </div>
          )}

          <div className="mt-4 space-y-4">
            {week && weekUnlocked && dayUnlocked ? (
              <Card className="border-2 border-purple-200">
                <div className="border-b border-purple-100 bg-purple-50/50 -mx-4 -mt-4 mb-4 rounded-t-xl px-4 py-4 sm:-mx-6 sm:-mt-6 sm:mb-6 sm:px-6">
                  <PlanBreadcrumb
                    planTitle={plan.title}
                    weekNumber={week.weekNumber}
                    dayNumber={plan.isDayWise ? selectedDay : undefined}
                  />
                  <h2 className="mt-2 text-lg font-bold text-purple-900 sm:text-xl">
                    {plan.isDayWise
                      ? `Week ${week.weekNumber} · Day ${selectedDay}: ${day?.title ?? ""}`
                      : `Week ${week.weekNumber}: ${week.title}`}
                  </h2>
                  {plan.isDayWise ? (
                    day?.description && <p className="mt-1 text-sm text-purple-700">{day.description}</p>
                  ) : (
                    week.description && <p className="mt-1 text-sm text-purple-700">{week.description}</p>
                  )}
                </div>

                {activeContents.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    {plan.isDayWise ? `Day ${selectedDay} માં content નથી` : "આ week માં content નથી"}
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
