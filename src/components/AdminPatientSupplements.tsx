"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { SUPPLEMENT_TIME_OPTIONS } from "@/lib/supplements";
import { Pill, Plus, Trash2 } from "lucide-react";

type CatalogItem = {
  id: string;
  name: string;
  defaultTime: string | null;
  defaultQuantity: string | null;
  description: string | null;
};

type PlanItem = {
  id?: string;
  supplementId: string | null;
  name: string;
  time: string;
  quantity: string;
  notes: string | null;
};

type Plan = {
  id: string;
  title: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  items: PlanItem[];
};

type DraftItem = {
  key: string;
  supplementId: string;
  name: string;
  time: string;
  quantity: string;
  notes: string;
};

function blankItem(): DraftItem {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    supplementId: "",
    name: "",
    time: "Morning",
    quantity: "1 tablet",
    notes: "",
  };
}

function toDraft(items: PlanItem[]): DraftItem[] {
  if (!items.length) return [blankItem()];
  return items.map((item, index) => ({
    key: item.id || `item-${index}`,
    supplementId: item.supplementId || "",
    name: item.name,
    time: item.time || "Morning",
    quantity: item.quantity || "1 tablet",
    notes: item.notes || "",
  }));
}

export function AdminPatientSupplements({
  patientId,
  patientName,
  onSaved,
}: {
  patientId: string;
  patientName: string;
  onSaved?: () => void;
}) {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [title, setTitle] = useState("For 2 months");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activePlan = useMemo(
    () => plans.find((plan) => plan.isActive) ?? null,
    [plans]
  );
  const history = useMemo(
    () => plans.filter((plan) => !plan.isActive),
    [plans]
  );

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/patients/${patientId}/supplements`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load supplements");
      setLoading(false);
      return;
    }
    const nextPlans: Plan[] = data.plans || [];
    const current = nextPlans.find((plan) => plan.isActive) ?? null;
    setCatalog(data.catalog || []);
    setPlans(nextPlans);
    setTitle("For 2 months");
    setNotes("");
    setItems(toDraft(current?.items || []));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function applyCatalog(index: number, supplementId: string) {
    const picked = catalog.find((item) => item.id === supplementId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              supplementId,
              name: picked?.name || item.name,
              time: picked?.defaultTime || item.time,
              quantity: picked?.defaultQuantity || item.quantity,
            }
          : item
      )
    );
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function payloadItems() {
    return items
      .filter((item) => item.name.trim())
      .map((item) => ({
        supplementId: item.supplementId || null,
        name: item.name.trim(),
        time: item.time.trim(),
        quantity: item.quantity.trim(),
        notes: item.notes.trim() || null,
      }));
  }

  async function assignNewPeriod() {
    const nextItems = payloadItems();
    if (!title.trim()) {
      setError("Title is required, e.g. For 2 months");
      return;
    }
    if (!nextItems.length) {
      setError("Add at least one supplement");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/patients/${patientId}/supplements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notes, items: nextItems }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not assign supplements");
      return;
    }
    await load();
    onSaved?.();
  }

  async function reactivate(planId: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/patients/${patientId}/supplements/${planId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setSaving(false);
    if (res.ok) {
      await load();
      onSaved?.();
    }
  }

  async function removePlan(planId: string) {
    if (!confirm("Delete this supplement list?")) return;
    await fetch(`/api/admin/patients/${patientId}/supplements/${planId}`, {
      method: "DELETE",
    });
    await load();
    onSaved?.();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading supplements...</p>;
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex items-center gap-2">
        <Pill className="h-4 w-4 text-[var(--primary)]" />
        <h4 className="text-sm font-semibold text-slate-800">
          Assign supplements · {patientName}
        </h4>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        દરેક વખત નવી list assign કરો ત્યારે નવું title આપો (જેમ કે For 2 months). જૂની list historyમાં રહેશે, patientને નવી current list દેખાશે.
      </p>

      {activePlan && (
        <div className="mt-3 rounded-lg border border-[var(--primary)]/20 bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
            Current list
          </p>
          <p className="text-sm font-semibold text-slate-900">{activePlan.title}</p>
          <p className="text-xs text-slate-500">
            {activePlan.items.length} supplements ·{" "}
            {new Date(activePlan.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Input
          label="New period title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="For 2 months"
        />
        <Textarea
          label="Doctor notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={1}
        />
      </div>

      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={item.key} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="From catalog"
                value={item.supplementId}
                onChange={(e) => applyCatalog(index, e.target.value)}
              >
                <option value="">Custom / pick supplement</option>
                {catalog.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Name"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value, supplementId: "" })}
                placeholder="Supplement name"
              />
              <Select
                label="Time"
                value={
                  SUPPLEMENT_TIME_OPTIONS.includes(
                    item.time as (typeof SUPPLEMENT_TIME_OPTIONS)[number]
                  )
                    ? item.time
                    : "__custom"
                }
                onChange={(e) =>
                  updateItem(index, {
                    time: e.target.value === "__custom" ? "" : e.target.value,
                  })
                }
              >
                {SUPPLEMENT_TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
                <option value="__custom">Custom time</option>
              </Select>
              <Input
                label="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: e.target.value })}
                placeholder="1 tablet"
              />
            </div>
            {!SUPPLEMENT_TIME_OPTIONS.includes(
              item.time as (typeof SUPPLEMENT_TIME_OPTIONS)[number]
            ) && (
              <div className="mt-3">
                <Input
                  label="Custom time"
                  value={item.time}
                  onChange={(e) => updateItem(index, { time: e.target.value })}
                  placeholder="e.g. 9:00 PM"
                />
              </div>
            )}
            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Item notes (optional)"
                  value={item.notes}
                  onChange={(e) => updateItem(index, { notes: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) =>
                    prev.length === 1 ? [blankItem()] : prev.filter((_, i) => i !== index)
                  )
                }
                className="mb-0.5 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, blankItem()])}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        <Plus className="h-4 w-4" /> Add supplement
      </button>

      <div className="mt-3">
        <Button onClick={assignNewPeriod} disabled={saving}>
          {saving
            ? "Saving..."
            : activePlan
              ? "Assign new list"
              : "Assign to patient"}
        </Button>
      </div>

      {history.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Previous lists
          </p>
          {history.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{plan.title}</p>
                <p className="text-xs text-slate-500">
                  {plan.items.length} supplements ·{" "}
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => reactivate(plan.id)}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Make current
                </button>
                <button
                  type="button"
                  onClick={() => removePlan(plan.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
