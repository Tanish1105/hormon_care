"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Button, Card, Input, Textarea, Badge } from "@/components/ui";
import { FileUpload } from "@/components/FileUpload";
import { Plus, Trash2, ChevronRight } from "lucide-react";

type GarbhaPlan = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  totalWeeks: number;
  _count: { patients: number };
};

export default function GarbhaSanskarPage() {
  const [plans, setPlans] = useState<GarbhaPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalWeeks, setTotalWeeks] = useState("12");
  const [isDayWise, setIsDayWise] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const res = await fetch("/api/admin/garbha-plans");
    if (!res.ok) {
      setError("Could not load Garbha plans");
      setPlans([]);
      return;
    }
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load(); }, []);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/garbha-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, totalWeeks, imageUrl, videoUrl, isDayWise }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create plan");
      setLoading(false);
      return;
    }
    setTitle("");
    setDescription("");
    setTotalWeeks("12");
    setIsDayWise(false);
    setImageUrl("");
    setVideoUrl("");
    setShowForm(false);
    setLoading(false);
    load();
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this Garbha plan?")) return;
    await fetch(`/api/admin/garbha-plans/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Garbha Sanskar</h1>
          <p className="text-sm text-slate-500 sm:text-base">Week-wise Garbha Sanskar plans</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> New Garbha Plan
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <Card className="mt-6">
          <h2 className="mb-4 font-semibold">Create New Garbha Sanskar Plan</h2>
          <form onSubmit={createPlan} className="space-y-4">
            <Input label="Plan Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Total Weeks" type="number" min="1" max="52" value={totalWeeks} onChange={(e) => setTotalWeeks(e.target.value)} required />
              <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={isDayWise}
                  onChange={(e) => setIsDayWise(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>
                  <strong>Day-wise plan</strong>
                  <span className="block text-xs text-slate-500">7 days per week with daily content</span>
                </span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FileUpload label="Image Upload" accept="image" value={imageUrl} onChange={setImageUrl} />
              <FileUpload label="Video Upload" accept="video" value={videoUrl} onChange={setVideoUrl} />
            </div>
            <p className="text-xs text-slate-500">
              {isDayWise
                ? "This creates Week 1–N, each with Day 1–7. Add daily content afterwards."
                : "This creates Week 1, Week 2, ... Only assigned patients can see it."}
            </p>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Plan"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3 sm:gap-4">
              {plan.imageUrl && <img src={plan.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-16 sm:w-16" />}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{plan.title}</h3>
                  <Badge>{plan.totalWeeks} weeks</Badge>
                  <Badge color="slate">{plan._count.patients} patients</Badge>
                </div>
                {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              <button onClick={() => deletePlan(plan.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
              <Link href={`/admin/garbha-sanskar/${plan.id}`} className="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100">
                Manage <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
        {plans.length === 0 && (
          <p className="text-center text-slate-500 py-8">No Garbha plans yet. Create a New Garbha Plan.</p>
        )}
      </div>
    </AdminLayout>
  );
}
