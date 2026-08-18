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
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  Video,
  ExternalLink,
  ImageIcon,
  Calendar,
  ChefHat,
  Flower2,
  FileText,
} from "lucide-react";
import { useStaffPortal } from "@/components/StaffPortalContext";
import { PlanSectionTabs } from "@/components/PlanSectionTabs";
import {
  PLAN_SECTION_LABELS,
  contentSection,
  isSafeHttpUrl,
  sectionCounts,
  type PlanContentSection,
} from "@/lib/plan-sections";

type Content = {
  id: string;
  section?: string | null;
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
  TEXT: FileText,
  VIDEO: Video,
  YOUTUBE: ExternalLink,
  LINK: ExternalLink,
  IMAGE: ImageIcon,
};

const sectionIcons = {
  RECIPE: ChefHat,
  EXERCISE: Dumbbell,
  MEDITATION: Flower2,
};

const emptyContentForm = {
  type: "TEXT",
  title: "",
  description: "",
  url: "",
  content: "",
  imageUrl: "",
  videoUrl: "",
};

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { capabilities } = useStaffPortal();
  const { id } = use(params);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  const [activeSection, setActiveSection] = useState<PlanContentSection>("RECIPE");
  const [addingSection, setAddingSection] = useState<PlanContentSection | null>(null);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [savingContent, setSavingContent] = useState(false);
  const [addingWeek, setAddingWeek] = useState(false);

  async function loadPlan() {
    const res = await fetch(`/api/admin/plans/${id}`);
    setPlan(await res.json());
  }

  useEffect(() => { loadPlan(); }, [id]);

  const week = plan?.weeks.find((w) => w.weekNumber === activeWeek);
  const day = week?.days?.find((d) => d.dayNumber === activeDay);
  const activeContents = plan?.isDayWise ? (day?.contents ?? []) : (week?.contents ?? []);
  const contentCounts = sectionCounts(activeContents);
  const SectionIcon = sectionIcons[activeSection];
  const sectionItems = activeContents.filter((item) => contentSection(item) === activeSection);
  const isAdding = addingSection === activeSection;

  function selectWeek(weekNumber: number) {
    setActiveWeek(weekNumber);
    setActiveDay(1);
    setAddingSection(null);
    setContentForm(emptyContentForm);
  }

  async function updateDay() {
    if (!day) return;
    await fetch(`/api/admin/plans/${id}/weeks/${week!.id}/days/${day.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: day.title, description: day.description }),
    });
  }

  async function updatePlanMedia(imageUrl: string, videoUrl: string) {
    await fetch(`/api/admin/plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: plan?.title, description: plan?.description, imageUrl, videoUrl }),
    });
    loadPlan();
  }

  async function updateWeek() {
    if (!week) return;
    await fetch(`/api/admin/plans/${id}/weeks/${week.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: week.title, description: week.description }),
    });
  }

  async function addContent(e: React.FormEvent) {
    e.preventDefault();
    if (!week || !addingSection) return;
    const endpoint = plan?.isDayWise && day
      ? `/api/admin/plans/${id}/weeks/${week.id}/days/${day.id}`
      : `/api/admin/plans/${id}/weeks/${week.id}`;
    setSavingContent(true);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contentForm, section: addingSection }),
    });
    setSavingContent(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not add content");
      return;
    }
    setContentForm(emptyContentForm);
    setAddingSection(null);
    loadPlan();
  }

  async function deleteContent(contentId: string) {
    if (!confirm("Delete this content?")) return;
    const endpoint = plan?.isDayWise
      ? `/api/admin/day-content/${contentId}`
      : `/api/admin/content/${contentId}`;
    await fetch(endpoint, { method: "DELETE" });
    loadPlan();
  }

  async function addWeek() {
    if (!plan || plan.totalWeeks >= 52) return;
    setAddingWeek(true);
    const res = await fetch(`/api/admin/plans/${id}/weeks`, { method: "POST" });
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
      <Link href={`${capabilities.basePath}/plans`} className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Plans
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

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Content sections
        </p>
        <PlanSectionTabs
          value={activeSection}
          counts={contentCounts}
          onChange={(section) => {
            setActiveSection(section);
            setAddingSection(null);
            setContentForm(emptyContentForm);
          }}
        />
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--primary)]">Plan Image/Video Upload</summary>
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
            <Calendar className="h-4 w-4 text-[var(--primary)]" />
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
              className="mt-3 w-full border border-dashed border-[var(--border)] text-[var(--primary)] hover:bg-[var(--primary-light)]"
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
              <Card className="border-[var(--border)] bg-gradient-to-r from-[var(--primary-light)]/50 to-white">
                <h2 className="text-lg font-bold text-[var(--primary)]">
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
                <Card className="border-[var(--border)]">
                  <h3 className="mb-3 font-semibold text-[var(--secondary)]">Days in Week {week.weekNumber}</h3>
                  <DaySelector
                    days={week.days}
                    activeDay={activeDay}
                    onSelectDay={(dayNumber) => {
                      setActiveDay(dayNumber);
                      setAddingSection(null);
                      setContentForm(emptyContentForm);
                    }}
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

              <div className="space-y-4">
                    <Card className="border-2 border-[var(--border)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                            <SectionIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="font-semibold">{PLAN_SECTION_LABELS[activeSection]}</h3>
                            <p className="text-xs text-slate-500">
                              {sectionItems.length} item{sectionItems.length === 1 ? "" : "s"} · description, image, video, or link
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setAddingSection(isAdding ? null : activeSection);
                            setContentForm(emptyContentForm);
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>

                      {isAdding && (
                        <Card className="mt-4 border-dashed">
                          <form onSubmit={addContent} className="space-y-4">
                            <Select
                              label="Type"
                              value={contentForm.type}
                              onChange={(e) =>
                                setContentForm({
                                  ...emptyContentForm,
                                  type: e.target.value,
                                  title: contentForm.title,
                                  description: contentForm.description,
                                })
                              }
                            >
                              <option value="TEXT">Description</option>
                              <option value="IMAGE">Image</option>
                              <option value="VIDEO">Video</option>
                              <option value="LINK">Link (YouTube or URL)</option>
                            </Select>
                            <Input
                              label={contentForm.type === "TEXT" ? "Title (optional)" : "Title"}
                              value={contentForm.title}
                              onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                              required={contentForm.type !== "TEXT"}
                            />
                            {contentForm.type === "TEXT" ? (
                              <Textarea
                                label="Description"
                                value={contentForm.content}
                                onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                                rows={6}
                                required
                              />
                            ) : (
                              <Textarea
                                label="Description"
                                value={contentForm.description}
                                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                                rows={2}
                              />
                            )}
                            {contentForm.type === "IMAGE" && (
                              <FileUpload
                                label="Image"
                                accept="image"
                                value={contentForm.url}
                                onChange={(url) => setContentForm({ ...contentForm, url })}
                              />
                            )}
                            {contentForm.type === "VIDEO" && (
                              <FileUpload
                                label="Video"
                                accept="video"
                                value={contentForm.url}
                                onChange={(url) => setContentForm({ ...contentForm, url })}
                              />
                            )}
                            {contentForm.type === "LINK" && (
                              <Input
                                label="Link URL"
                                value={contentForm.url}
                                onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                                placeholder="https://..."
                                required
                              />
                            )}
                            <div className="flex gap-2">
                              <Button type="submit" disabled={savingContent}>
                                {savingContent
                                  ? "Adding..."
                                  : plan.isDayWise
                                    ? `Add to ${PLAN_SECTION_LABELS[activeSection]} · Day ${activeDay}`
                                    : `Add to ${PLAN_SECTION_LABELS[activeSection]}`}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setAddingSection(null);
                                  setContentForm(emptyContentForm);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Card>
                      )}

                      <div className="mt-4 space-y-3">
                        {sectionItems.map((item) => {
                          const Icon = contentIcons[item.type as keyof typeof contentIcons] || ExternalLink;
                          const linkUrl = item.type === "LINK" && item.url && isSafeHttpUrl(item.url) ? item.url : null;
                          return (
                            <div
                              key={item.id}
                              className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4"
                            >
                              <div className="flex min-w-0 gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--primary)] shadow-sm">
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <Badge color="slate">
                                      {item.type === "YOUTUBE" || item.type === "LINK"
                                        ? "LINK"
                                        : item.type === "TEXT" || item.type === "EXERCISE"
                                          ? "DESCRIPTION"
                                          : item.type}
                                    </Badge>
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
                                  {linkUrl && (
                                    <a
                                      href={linkUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      Open link
                                    </a>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteContent(item.id)}
                                className="self-end rounded p-1 text-red-500 hover:bg-red-50 sm:self-start"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                        {sectionItems.length === 0 && !isAdding && (
                          <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                            No {PLAN_SECTION_LABELS[activeSection].toLowerCase()} yet — click Add to write a description or upload image, video, or link
                          </p>
                        )}
                      </div>
                    </Card>

                {plan.isDayWise && activeDay < 7 && (
                  <div className="flex justify-stretch sm:justify-end">
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setActiveDay(activeDay + 1)}>
                      Next: Day {activeDay + 1} →
                    </Button>
                  </div>
                )}

                {!plan.isDayWise && activeWeek < plan.totalWeeks && (
                  <div className="flex justify-stretch sm:justify-end">
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => selectWeek(activeWeek + 1)}>
                      Next: Week {activeWeek + 1} →
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
