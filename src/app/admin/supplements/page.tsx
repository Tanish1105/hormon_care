"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminPatientSupplements } from "@/components/AdminPatientSupplements";
import { Button, Card, Input, Textarea, Select, Badge } from "@/components/ui";
import { SUPPLEMENT_TIME_OPTIONS } from "@/lib/supplements";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";

type CatalogItem = {
  id: string;
  name: string;
  description: string | null;
  defaultTime: string | null;
  defaultQuantity: string | null;
  sortOrder: number;
};

type PatientRow = {
  id: string;
  user: { name: string; username: string };
  supplementPlans?: { id: string; title: string; _count: { items: number } }[];
};

const emptyForm = {
  name: "",
  description: "",
  defaultTime: "Morning",
  defaultQuantity: "1 tablet",
};

export default function AdminSupplementsPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadCatalog() {
    const res = await fetch("/api/admin/supplements");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load supplements");
    setCatalog(Array.isArray(data) ? data : []);
  }

  async function loadPatients() {
    const res = await fetch("/api/admin/patients");
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) {
      throw new Error(data?.error || "Could not load patients");
    }
    setPatients(data);
  }

  async function loadAll() {
    setError("");
    try {
      await Promise.all([loadCatalog(), loadPatients()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) => {
      const name = patient.user.name.toLowerCase();
      const username = patient.user.username.toLowerCase();
      const title = patient.supplementPlans?.[0]?.title.toLowerCase() || "";
      return name.includes(q) || username.includes(q) || title.includes(q);
    });
  }, [patients, query]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowCatalog(true);
    setShowForm(true);
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      defaultTime: item.defaultTime || "Morning",
      defaultQuantity: item.defaultQuantity || "1 tablet",
    });
    setShowCatalog(true);
    setShowForm(true);
  }

  async function saveCatalog(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = editingId ? `/api/admin/supplements/${editingId}` : "/api/admin/supplements";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save supplement");
      return;
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    loadCatalog();
  }

  async function removeCatalog(id: string) {
    if (!confirm("Delete this supplement from the master list?")) return;
    await fetch(`/api/admin/supplements/${id}`, { method: "DELETE" });
    loadCatalog();
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Supplements</h1>
          <p className="text-sm text-slate-500 sm:text-base">
            Patient પસંદ કરીને personal list assign કરો. દરેક નવી assign પર title બદલાય, જૂની list historyમાં રહે.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={startCreate}>
          <Plus className="mr-1 h-4 w-4" /> Add to catalog
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowCatalog((open) => !open)}
        className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800"
      >
        Master catalog ({catalog.length})
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showCatalog ? "rotate-180" : ""}`} />
      </button>

      {showCatalog && (
        <div className="mt-3 space-y-3">
          {showForm && (
            <Card>
              <h2 className="mb-4 font-semibold text-slate-900">
                {editingId ? "Edit Supplement" : "New Supplement"}
              </h2>
              <form onSubmit={saveCatalog} className="space-y-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Folic Acid"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    label="Default time"
                    value={form.defaultTime}
                    onChange={(e) => setForm({ ...form, defaultTime: e.target.value })}
                  >
                    {SUPPLEMENT_TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Default quantity"
                    value={form.defaultQuantity}
                    onChange={(e) => setForm({ ...form, defaultQuantity: e.target.value })}
                    placeholder="e.g. 1 tablet"
                  />
                </div>
                <Textarea
                  label="Notes (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingId ? "Save" : "Add"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {catalog.map((item) => (
            <Card key={item.id} className="flex items-start justify-between gap-3 !py-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {item.defaultTime || "Time not set"} · {item.defaultQuantity || "Quantity not set"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-[var(--primary)]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeCatalog(item.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Patients</h2>
          <p className="text-sm text-slate-500">Click a patient to assign or change their list.</p>
        </div>
        <div className="w-full sm:max-w-xs">
          <Input
            label="Search patient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or Patient ID"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filteredPatients.map((patient) => {
          const current = patient.supplementPlans?.[0];
          const expanded = expandedId === patient.id;
          return (
            <Card key={patient.id} className="!overflow-hidden !p-0">
              <button
                type="button"
                onClick={() => setExpandedId((prev) => (prev === patient.id ? null : patient.id))}
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50/80 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{patient.user.name}</h3>
                    <Badge color="purple">{patient.user.username}</Badge>
                    {current ? (
                      <Badge color="green">{current.title}</Badge>
                    ) : (
                      <Badge color="slate">Not assigned</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {current
                      ? `${current._count.items} supplements · current: ${current.title}`
                      : "No personal supplement list yet"}
                  </p>
                </div>
                <ChevronDown
                  className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              {expanded ? (
                <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
                  <AdminPatientSupplements
                    patientId={patient.id}
                    patientName={patient.user.name}
                    onSaved={loadPatients}
                  />
                </div>
              ) : null}
            </Card>
          );
        })}
        {filteredPatients.length === 0 && (
          <p className="py-8 text-center text-slate-500">
            {patients.length === 0
              ? "No patients yet. Add a patient first."
              : "No matching patients."}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
