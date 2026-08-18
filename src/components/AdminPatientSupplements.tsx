"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";
import { SUPPLEMENT_TIME_OPTIONS } from "@/lib/supplements";
import { ArrowDown, ArrowUp, Pill, Plus, Trash2 } from "lucide-react";

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

const fieldClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

function newKey() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function blankItem(): DraftItem {
  return {
    key: newKey(),
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

function timeOptions(current: string) {
  if (
    current &&
    !(SUPPLEMENT_TIME_OPTIONS as readonly string[]).includes(current)
  ) {
    return [current, ...SUPPLEMENT_TIME_OPTIONS];
  }
  return [...SUPPLEMENT_TIME_OPTIONS];
}

export function AdminPatientSupplements({
  patientId,
  patientName,
  readOnly = false,
  onSaved,
}: {
  patientId: string;
  patientName: string;
  readOnly?: boolean;
  onSaved?: () => void;
}) {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");

  const activePlan = useMemo(
    () => plans.find((plan) => plan.isActive) ?? null,
    [plans]
  );
  const history = useMemo(
    () => plans.filter((plan) => !plan.isActive),
    [plans]
  );
  const filledCount = items.filter((item) => item.name.trim()).length;

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
    setTitle(current?.title || "");
    setNotes(current?.notes || "");
    setItems(toDraft(current?.items || []));
    setMode("view");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addRow(partial?: Partial<DraftItem>) {
    setItems((prev) => {
      const next = blankItem();
      const filled = { ...next, ...partial, key: newKey() };
      const emptyIndex = prev.findIndex((item) => !item.name.trim());
      if (emptyIndex >= 0 && partial?.name) {
        return prev.map((item, i) => (i === emptyIndex ? { ...item, ...filled } : item));
      }
      return [...prev, filled];
    });
  }

  function removeRow(index: number) {
    setItems((prev) =>
      prev.length === 1 ? [blankItem()] : prev.filter((_, i) => i !== index)
    );
  }

  function moveRow(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function payloadItems() {
    return items
      .filter((item) => item.name.trim())
      .map((item) => ({
        supplementId: item.supplementId || null,
        name: item.name.trim(),
        time: item.time.trim() || "Morning",
        quantity: item.quantity.trim() || "1",
        notes: item.notes.trim() || null,
      }));
  }

  async function saveList() {
    if (readOnly) return;
    const nextItems = payloadItems();
    const nextTitle = title.trim() || "Supplement list";
    if (!nextItems.length) {
      setError("List ma at least 1 supplement add karo");
      return;
    }
    setSaving(true);
    setError("");

    const body = { title: nextTitle, notes, items: nextItems };
    const updating = mode === "edit" && activePlan;
    const res = await fetch(
      updating
        ? `/api/admin/patients/${patientId}/supplements/${activePlan.id}`
        : `/api/admin/patients/${patientId}/supplements`,
      {
        method: updating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save supplements");
      return;
    }
    await load();
    onSaved?.();
  }

  function openNewList() {
    if (readOnly) return;
    setError("");
    setTitle("");
    setNotes("");
    setItems([blankItem()]);
    setMode("new");
  }

  function openEditList() {
    if (readOnly) return;
    if (!activePlan) {
      openNewList();
      return;
    }
    setError("");
    setTitle(activePlan.title);
    setNotes(activePlan.notes || "");
    setItems(toDraft(activePlan.items || []));
    setMode("edit");
  }

  function cancelEditor() {
    setError("");
    setTitle(activePlan?.title || "");
    setNotes(activePlan?.notes || "");
    setItems(toDraft(activePlan?.items || []));
    setMode("view");
  }

  async function reactivate(planId: string) {
    if (readOnly) return;
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
    if (readOnly) return;
    if (!confirm("Delete this old list?")) return;
    await fetch(`/api/admin/patients/${patientId}/supplements/${planId}`, {
      method: "DELETE",
    });
    await load();
    onSaved?.();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading supplements...</p>;
  }

  const editing = !readOnly && mode !== "view";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
            <Pill className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-slate-900">
              Supplement list · {patientName}
            </h4>
            <p className="mt-0.5 text-sm text-slate-500">
              {editing
                ? mode === "new"
                  ? "Navi list 1, 2, 3 number sathe assign karo."
                  : "Hali ni list edit karo. Number order patient app ma dekhase."
                : readOnly
                  ? "Assigned supplement list. Staff aa list joi sake, change nathi kari shakto."
                  : "Pehla current list jovao. Navi assign karvi hoi to upar Assign new list dabavo."}
            </p>
          </div>
        </div>
        {!editing && !readOnly ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {activePlan ? (
              <Button type="button" variant="ghost" onClick={openEditList}>
                Edit list
              </Button>
            ) : null}
            <Button type="button" onClick={openNewList}>
              <Plus className="mr-1 h-4 w-4" /> Assign new list
            </Button>
          </div>
        ) : null}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!editing ? (
        <>
          {activePlan ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--primary)]/20">
              <div className="border-b border-slate-100 bg-[var(--primary-light)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Current list
                </p>
                <p className="text-lg font-semibold text-slate-900">{activePlan.title}</p>
                {activePlan.notes ? (
                  <p className="mt-1 text-sm text-slate-600">{activePlan.notes}</p>
                ) : null}
              </div>
              <ol className="divide-y divide-slate-100">
                {activePlan.items.map((item, index) => (
                  <li key={item.id || index} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {item.time} · {item.quantity}
                      </p>
                      {item.notes ? (
                        <p className="mt-1 text-sm text-slate-500">{item.notes}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="font-medium text-slate-800">Haju list assign nathi</p>
              {!readOnly ? (
                <p className="mt-1 text-sm text-slate-500">
                  Upar <span className="font-semibold">Assign new list</span> par click karo.
                </p>
              ) : null}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Old lists
              </p>
              {history.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{plan.title}</p>
                    <p className="text-xs text-slate-500">
                      {plan.items.map((item) => item.name).join(", ") ||
                        `${plan.items.length} supplements`}{" "}
                      · {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!readOnly ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => reactivate(plan.id)}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline"
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
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
            <Input
              label="List title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. For 2 months"
            />
            <div className="flex items-end">
              <p className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                {filledCount} supplement{filledCount === 1 ? "" : "s"} in list
              </p>
            </div>
          </div>

          {catalog.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tap to add
              </p>
              <div className="flex flex-wrap gap-2">
                {catalog.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      addRow({
                        supplementId: option.id,
                        name: option.name,
                        time: option.defaultTime || "Morning",
                        quantity: option.defaultQuantity || "1 tablet",
                        notes: option.description || "",
                      })
                    }
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  >
                    + {option.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[2.5rem_minmax(0,1.4fr)_9rem_8rem_minmax(0,1fr)_5.5rem] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
              <span>#</span>
              <span>Supplement</span>
              <span>Time</span>
              <span>Quantity</span>
              <span>Notes</span>
              <span className="text-right">Move</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <div
                  key={item.key}
                  className="grid gap-3 px-3 py-3 md:grid-cols-[2.5rem_minmax(0,1.4fr)_9rem_8rem_minmax(0,1fr)_5.5rem] md:items-center md:gap-2"
                >
                  <div className="flex items-center justify-between md:block">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 md:hidden"
                      aria-label={`Remove ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <label className="block md:contents">
                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">
                      Supplement
                    </span>
                    <input
                      className={fieldClass}
                      value={item.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const picked = catalog.find((option) => option.name === name);
                        if (picked) {
                          updateItem(index, {
                            name,
                            supplementId: picked.id,
                            time: picked.defaultTime || item.time,
                            quantity: picked.defaultQuantity || item.quantity,
                          });
                        } else {
                          updateItem(index, { name, supplementId: "" });
                        }
                      }}
                      placeholder={`Supplement ${index + 1} name`}
                      list={`catalog-${patientId}`}
                    />
                  </label>

                  <label className="block md:contents">
                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">
                      Time
                    </span>
                    <select
                      className={fieldClass}
                      value={item.time}
                      onChange={(e) => updateItem(index, { time: e.target.value })}
                    >
                      {timeOptions(item.time).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:contents">
                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">
                      Quantity
                    </span>
                    <input
                      className={fieldClass}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                      placeholder="1 tablet"
                    />
                  </label>

                  <label className="block md:contents">
                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">
                      Notes
                    </span>
                    <input
                      className={fieldClass}
                      value={item.notes}
                      onChange={(e) => updateItem(index, { notes: e.target.value })}
                      placeholder="Optional"
                    />
                  </label>

                  <div className="hidden justify-end gap-1 md:flex">
                    <button
                      type="button"
                      onClick={() => moveRow(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(index, 1)}
                      disabled={index === items.length - 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <datalist id={`catalog-${patientId}`}>
            {catalog.map((option) => (
              <option key={option.id} value={option.name} />
            ))}
          </datalist>

          <button
            type="button"
            onClick={() => addRow()}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            <Plus className="h-4 w-4" /> Add {items.length + 1}
          </button>

          <div className="mt-4">
            <Input
              label="Doctor notes for this list (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. After food, 2 months"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={saveList} disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "new"
                  ? "Assign list to patient"
                  : "Save list"}
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={cancelEditor}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
