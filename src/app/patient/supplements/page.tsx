"use client";

import { useEffect, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { Clock3, Pill } from "lucide-react";

type SupplementItem = {
  id: string;
  name: string;
  time: string;
  quantity: string;
  notes: string | null;
};

type SupplementPlan = {
  id: string;
  title: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  items: SupplementItem[];
};

function PlanCard({
  plan,
  current,
}: {
  plan: SupplementPlan;
  current?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[1.5rem] border bg-white shadow-sm ${
        current ? "border-[var(--primary)]/25" : "border-[var(--border)]"
      }`}
    >
      <div
        className={`border-b px-5 py-5 sm:px-6 ${
          current
            ? "border-[var(--border)] bg-[linear-gradient(120deg,#e8f3ec,#ffffff_55%)]"
            : "border-[var(--border)] bg-slate-50/80"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]/70">
          {current ? "Current list" : "Previous list"}
        </p>
        <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {plan.title}
        </h2>
        {plan.notes && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{plan.notes}</p>
        )}
      </div>
      <div className="divide-y divide-[var(--border)]">
        {plan.items.map((item) => (
          <article key={item.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Pill className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <div className="mt-1.5 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </span>
                <span className="rounded-md bg-[var(--gold-soft)] px-2 py-0.5 font-medium text-[var(--secondary)]">
                  {item.quantity}
                </span>
              </div>
              {item.notes && (
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.notes}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function PatientSupplementsPage() {
  const [activePlan, setActivePlan] = useState<SupplementPlan | null>(null);
  const [history, setHistory] = useState<SupplementPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patient/supplements")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Could not load supplements");
        return data as { plans: SupplementPlan[]; activePlan: SupplementPlan | null };
      })
      .then((data) => {
        setActivePlan(data.activePlan);
        setHistory((data.plans || []).filter((plan) => !plan.isActive));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PatientLayout>
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
          Personal
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Supplements
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Doctor દ્વારા આપેલી તમારી personal supplement list — time અને quantity સાથે.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : !activePlan && history.length === 0 ? (
        <div className="rounded-2xl border border-[#d5e2d8] bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-800">હજુ supplement assign નથી</p>
          <p className="mt-2 text-sm text-slate-500">
            Doctor assign કરે ત્યારે તમારી personal list અહીં દેખાશે.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {activePlan && <PlanCard plan={activePlan} current />}
          {history.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Previous lists
              </h2>
              {history.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      )}
    </PatientLayout>
  );
}
