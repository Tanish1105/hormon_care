"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge, Button, Card } from "@/components/ui";
import { Mail, Phone, Trash2 } from "lucide-react";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  interest: string | null;
  message: string;
  status: "NEW" | "READ" | "CONTACTED" | string;
  createdAt: string;
};

const INTEREST_LABEL: Record<string, string> = {
  arogya: "Arogya Sanskruti",
  garbha: "Garbh Sanskruti",
  parenting: "Parenting Sanskruti",
  other: "Other",
};

const STATUS_COLOR: Record<string, "green" | "gold" | "slate"> = {
  NEW: "gold",
  READ: "slate",
  CONTACTED: "green",
};

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [aggregate, setAggregate] = useState({ total: 0, newCount: 0, read: 0, contacted: 0 });
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "NEW" | "READ" | "CONTACTED">("all");

  async function load() {
    setLoadError("");
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "Could not load inquiries");
        return;
      }
      setItems(data.items);
      setAggregate(data.aggregate);
    } catch {
      setLoadError("Could not load inquiries");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  const filtered = items.filter((item) => (filter === "all" ? true : item.status === filter));

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          Forms submitted from the JEEVANM public website.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card className="!p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold">{aggregate.total}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500">New</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{aggregate.newCount}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500">Read</p>
          <p className="mt-1 text-2xl font-bold">{aggregate.read}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500">Contacted</p>
          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">{aggregate.contacted}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["NEW", "New"],
            ["READ", "Read"],
            ["CONTACTED", "Contacted"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === key
                ? "bg-[var(--primary)] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loadError ? <p className="mb-4 text-sm text-red-600">{loadError}</p> : null}

      {filtered.length === 0 ? (
        <Card className="text-center text-slate-500">No inquiries yet.</Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="!p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    <Badge color={STATUS_COLOR[item.status] ?? "slate"}>{item.status}</Badge>
                    {item.interest ? (
                      <Badge color="green">{INTEREST_LABEL[item.interest] ?? item.interest}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete inquiry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--primary)] hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {item.phone}
                </a>
                {item.email ? (
                  <a
                    href={`mailto:${item.email}`}
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[var(--primary)] hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {item.email}
                  </a>
                ) : null}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {item.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status !== "READ" ? (
                  <Button variant="ghost" onClick={() => setStatus(item.id, "READ")}>
                    Mark read
                  </Button>
                ) : null}
                {item.status !== "CONTACTED" ? (
                  <Button variant="secondary" onClick={() => setStatus(item.id, "CONTACTED")}>
                    Mark contacted
                  </Button>
                ) : null}
                {item.status !== "NEW" ? (
                  <Button variant="ghost" onClick={() => setStatus(item.id, "NEW")}>
                    Mark new
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
