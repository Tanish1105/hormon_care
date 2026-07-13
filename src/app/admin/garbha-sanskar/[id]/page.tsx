"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Button, Card, Input, Textarea, Select, Badge } from "@/components/ui";
import { FileUpload } from "@/components/FileUpload";
import { FullscreenImage } from "@/components/FullscreenImage";
import { FullscreenVideo } from "@/components/FullscreenVideo";
import { FullscreenYoutube } from "@/components/FullscreenYoutube";
import { WeekSelector, DaySelector, PlanBreadcrumb } from "@/components/PlanWeekDay";
import { ArrowLeft, Plus, Trash2, Dumbbell, Video, ExternalLink, ImageIcon, Calendar } from "lucide-react";

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

type Plan = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  totalWeeks: number;
  isCustom?: boolean;
  isDayWise: boolean;
  weeks: Week[];
};

const contentIcons = {
  EXERCISE: Dumbbell,
  VIDEO: Video,
  YOUTUBE: ExternalLink,
  IMAGE: ImageIcon,
};

const emptyContentForm = {
  type: "EXERCISE",
  title: "",
  description: "",
  url: "",
  content: "",
  imageUrl: "",
  videoUrl: "",
};

export default function GarbhaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [addingWeek, setAddingWeek] = useState(false);

  async function loadPlan() {
    const res = await fetch(`/api/admin/garbha-plans/${id}`);
    setPlan(await res.json());
  }

  useEffect(() => { loadPlan(); }, [id]);

  const week = plan?.weeks.find((w) => w.weekNumber === activeWeek);
  const day = week?.days?.find((d) => d.dayNumber === activeDay);
  const activeContents = plan?.isDayWise ? (day?.contents ?? []) : (week?.contents ?? []);

  function selectWeek(weekNumber: number) {
    setActiveWeek(weekNumber);
    setActiveDay(1);
  }

  async function updateDay() {
    if (!day) return;
    await fetch(`/api/admin/garbha-plans/${id}/weeks/${week!.id}/days/${day.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: day.title, description: day.description }),
    });
  }

  async function updatePlanMedia(imageUrl: string, videoUrl: string) {
    await fetch(`/api/admin/garbha-plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: plan?.title, description: plan?.description, imageUrl, videoUrl }),
    });
    loadPlan();
  }

  async function updateWeek() {
    if (!week) return;
    await fetch(`/api/admin/garbha-plans/${id}/weeks/${week.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: week.title, description: week.description }),
    });
  }

  async function addContent(e: React.FormEvent) {
    e.preventDefault();
    if (!week) return;
    const endpoint = plan?.isDayWise && day
      ? `/api/admin/garbha-plans/${id}/weeks/${week.id}/days/${day.id}`
      : `/api/admin/garbha-plans/${id}/weeks/${week.id}`;
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contentForm),
    });
    setContentForm(emptyContentForm);
    setShowAddContent(false);
    loadPlan();
  }

  async function deleteContent(contentId: string) {
    if (!confirm("Delete this content?")) return;
    const endpoint = plan?.isDayWise
      ? `/api/admin/garbha-day-content/${contentId}`
      : `/api/admin/garbha-content/${contentId}`;
    await fetch(endpoint, { method: "DELETE" });
    loadPlan();
  }

  async function addWeek() {
    if (!plan || plan.totalWeeks >= 52) return;
    setAddingWeek(true);
    const res = await fetch(`/api/admin/garbha-plans/${id}/weeks`, { method: "POST" });
    const data = await res.json();
    setAddingWeek(false);
    if (!res.ok) {
      alert(data.error || "Could not add week");
      return;
    }
    setPlan(data);
    setActiveWeek(data.totalWeeks);
    setActiveDay(1);
  }

  if (!plan) {
    return (
      <AdminLayout>
        <p className="text-slate-500">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link href="/admin/garbha-sanskar" className="flex items-center gap-1 text-sm text-pink-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Garbh Sanskruti
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{plan.title}</h1>
          {plan.description && <p className="mt-1 text-slate-500">{plan.description}</p>}
          <div className="mt-2 flex gap-2">
            <Badge>{plan.totalWeeks} Weeks</Badge>
            {plan.isDayWise && <Badge color="purple">Day-wise</Badge>}
            {plan.isCustom && <Badge color="pink">Custom (Patient-specific)</Badge>}
          </div>
        </div>
        {week && (
          <PlanBreadcrumb
            planTitle={plan.title}
            weekNumber={week.weekNumber}
            dayNumber={plan.isDayWise ? activeDay : undefined}
          />
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-pink-600">Plan Image/Video Upload</summary>
        <Card className="mt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <FileUpload label="Plan Image" accept="image" value={plan.imageUrl || ""} onChange={(url) => updatePlanMedia(url, plan.videoUrl || "")} />
            <FileUpload label="Plan Video" accept="video" value={plan.videoUrl || ""} onChange={(url) => updatePlanMedia(plan.imageUrl || "", url)} />
          </div>
        </Card>
      </details>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* LEFT: Week list */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pink-600" />
            <h2 className="font-semibold text-slate-900">Weeks</h2>
          </div>
          <WeekSelector
            weeks={plan.weeks}
            activeWeek={activeWeek}
            onSelectWeek={selectWeek}
            variant="admin"
            isDayWise={plan.isDayWise}
          />
          {plan.totalWeeks < 52 && (
            <Button
              variant="ghost"
              className="mt-3 w-full border border-dashed border-pink-200 text-pink-600 hover:bg-pink-50"
              onClick={addWeek}
              disabled={addingWeek}
            >
              <Plus className="mr-1 h-4 w-4" />
              {addingWeek ? "Adding..." : `Add Week ${plan.totalWeeks + 1}`}
            </Button>
          )}
        </div>

        {/* RIGHT: Week plan */}
        <div className="space-y-6">
          {week && (
            <>
              <Card className="border-pink-100 bg-gradient-to-r from-pink-50/50 to-white">
                <h2 className="text-lg font-bold text-pink-800">
                  Week {week.weekNumber} — {week.title}
                </h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Input
                    label="Week Title"
                    value={week.title}
                    onChange={(e) => { week.title = e.target.value; setPlan({ ...plan }); }}
                    onBlur={updateWeek}
                  />
                  <Textarea
                    label="Week Description"
                    value={week.description || ""}
                    onChange={(e) => { week.description = e.target.value; setPlan({ ...plan }); }}
                    onBlur={updateWeek}
                    rows={1}
                  />
                </div>
              </Card>

              {plan.isDayWise && week.days?.length > 0 && (
                <Card className="border-purple-100">
                  <h3 className="mb-3 font-semibold text-purple-900">Days in Week {week.weekNumber}</h3>
                  <DaySelector
                    days={week.days}
                    activeDay={activeDay}
                    onSelectDay={setActiveDay}
                    variant="admin"
                  />
                  {day && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Input
                        label="Day Title"
                        value={day.title}
                        onChange={(e) => { day.title = e.target.value; setPlan({ ...plan }); }}
                        onBlur={updateDay}
                      />
                      <Textarea
                        label="Day Description"
                        value={day.description || ""}
                        onChange={(e) => { day.description = e.target.value; setPlan({ ...plan }); }}
                        onBlur={updateDay}
                        rows={1}
                      />
                    </div>
                  )}
                </Card>
              )}

              <Card className="border-2 border-purple-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">
                    {plan.isDayWise
                      ? `Week ${week.weekNumber} · Day ${activeDay} Content (${activeContents.length})`
                      : `Week ${week.weekNumber} Content (${activeContents.length})`}
                  </h3>
                  <Button className="w-full sm:w-auto" onClick={() => setShowAddContent(!showAddContent)}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>

                {showAddContent && (
                  <Card className="mt-4 border-dashed">
                    <form onSubmit={addContent} className="space-y-4">
                      <Select label="Type" value={contentForm.type} onChange={(e) => setContentForm({ ...emptyContentForm, type: e.target.value, title: contentForm.title, description: contentForm.description })}>
                        <option value="EXERCISE">Exercise</option>
                        <option value="IMAGE">Image Upload</option>
                        <option value="VIDEO">Video Upload</option>
                        <option value="YOUTUBE">YouTube Link</option>
                      </Select>
                      <Input label="Title" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} required />
                      <Textarea label="Description" value={contentForm.description} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} rows={2} />
                      {contentForm.type === "EXERCISE" && (
                        <>
                          <Textarea label="Instructions" value={contentForm.content} onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })} rows={4} />
                          <div className="grid gap-4 md:grid-cols-2">
                            <FileUpload label="Image (optional)" accept="image" value={contentForm.imageUrl} onChange={(url) => setContentForm({ ...contentForm, imageUrl: url })} />
                            <FileUpload label="Video (optional)" accept="video" value={contentForm.videoUrl} onChange={(url) => setContentForm({ ...contentForm, videoUrl: url })} />
                          </div>
                        </>
                      )}
                      {contentForm.type === "IMAGE" && (
                        <FileUpload label="Image" accept="image" value={contentForm.url} onChange={(url) => setContentForm({ ...contentForm, url })} />
                      )}
                      {contentForm.type === "VIDEO" && (
                        <FileUpload label="Video" accept="video" value={contentForm.url} onChange={(url) => setContentForm({ ...contentForm, url })} />
                      )}
                      {contentForm.type === "YOUTUBE" && (
                        <Input label="YouTube URL" value={contentForm.url} onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })} />
                      )}
                      <div className="flex gap-2">
                        <Button type="submit">
                          {plan.isDayWise ? `Add to Day ${activeDay}` : `Add to Week ${week.weekNumber}`}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setShowAddContent(false)}>Cancel</Button>
                      </div>
                    </form>
                  </Card>
                )}

                <div className="mt-4 space-y-3">
                  {activeContents.map((item) => {
                    const Icon = contentIcons[item.type as keyof typeof contentIcons] || Dumbbell;
                    return (
                      <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-pink-600 shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{item.title}</h4>
                              <Badge color="slate">{item.type}</Badge>
                            </div>
                            {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
                            {item.content && <p className="mt-2 text-sm whitespace-pre-wrap">{item.content}</p>}
                            {item.imageUrl && (
                              <FullscreenImage src={item.imageUrl} alt={item.title} className="mt-2 max-h-40 rounded-lg" />
                            )}
                            {item.videoUrl && (
                              <FullscreenVideo src={item.videoUrl} title={item.title} className="mt-2 max-h-40 w-full rounded-lg" />
                            )}
                            {item.type === "IMAGE" && item.url && (
                              <FullscreenImage src={item.url} alt={item.title} className="mt-2 max-h-40 rounded-lg" />
                            )}
                            {item.type === "VIDEO" && item.url && (
                              <FullscreenVideo src={item.url} title={item.title} className="mt-2 max-h-40 w-full rounded-lg" />
                            )}
                            {item.type === "YOUTUBE" && item.url && (
                              <FullscreenYoutube url={item.url} title={item.title} className="mt-2" />
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteContent(item.id)} className="self-end rounded p-1 text-red-500 hover:bg-red-50 sm:self-start">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  {activeContents.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-slate-500">
                      {plan.isDayWise
                        ? `No content in Day ${activeDay} yet — click Add`
                        : `No content in Week ${week.weekNumber} yet — click Add`}
                    </p>
                  )}
                </div>

                {plan.isDayWise && activeDay < 7 && (
                  <div className="mt-6 flex justify-stretch sm:justify-end">
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setActiveDay(activeDay + 1)}>
                      Next: Day {activeDay + 1} →
                    </Button>
                  </div>
                )}

                {!plan.isDayWise && activeWeek < plan.totalWeeks && (
                  <div className="mt-6 flex justify-stretch sm:justify-end">
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => selectWeek(activeWeek + 1)}>
                      Next: Week {activeWeek + 1} →
                    </Button>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
