"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { Button, Card, Input, Textarea, Select, Badge } from "@/components/ui";
import { Plus, Trash2, Key, Copy, Check, Sparkles, SquarePen, Send, FileText, Link2 } from "lucide-react";
import { formatDateInputValue, formatDisplayDate } from "@/lib/utils";

type AssignedPlan = { id: string; title: string; totalWeeks: number; isCustom: boolean };
type PatientProgram = "care" | "garbha" | "child";

type Patient = {
  id: string;
  requirements: string | null;
  currentWeek: number;
  startDate: string;
  user: { id: string; username: string; name: string; createdAt: string };
  plan: AssignedPlan | null;
  garbhaPlan: AssignedPlan | null;
  childGuidancePlan: AssignedPlan | null;
  lifestyleAssessment: {
    requestedAt: string | null;
    submittedAt: string | null;
    lifestyleScore: number | null;
    accessToken: string | null;
  } | null;
};

type Plan = { id: string; title: string };

type CustomForm = {
  mode: "new" | "copy";
  title: string;
  totalWeeks: string;
  sourcePlanId: string;
};

const emptyCustomForm: CustomForm = {
  mode: "new",
  title: "",
  totalWeeks: "12",
  sourcePlanId: "",
};

function generatePreviewCredentials() {
  const num = Math.floor(100000 + Math.random() * 900000);
  const username = `PAT${num}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { username, password };
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [garbhaPlans, setGarbhaPlans] = useState<Plan[]>([]);
  const [childGuidancePlans, setChildGuidancePlans] = useState<Plan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    requirements: "",
    planId: "",
    garbhaPlanId: "",
    childGuidancePlanId: "",
    currentWeek: "1",
    startDate: formatDateInputValue(),
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");

  const [credentialPatientId, setCredentialPatientId] = useState<string | null>(null);
  const [credentialForm, setCredentialForm] = useState({ username: "", password: "" });
  const [credentialLoading, setCredentialLoading] = useState(false);

  const [customPatientId, setCustomPatientId] = useState<string | null>(null);
  const [customProgram, setCustomProgram] = useState<PatientProgram>("care");
  const [customForm, setCustomForm] = useState<CustomForm>(emptyCustomForm);
  const [customLoading, setCustomLoading] = useState(false);
  const [editLoading, setEditLoading] = useState<string | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState<string | null>(null);
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);

  async function load() {
    setLoadError("");
    try {
      const [pRes, plRes, gRes, cgRes] = await Promise.all([
        fetch("/api/admin/patients"),
        fetch("/api/admin/plans"),
        fetch("/api/admin/garbha-plans"),
        fetch("/api/admin/child-guidance-plans"),
      ]);

      const patientsData = await pRes.json();
      const plData = await plRes.json();
      const gData = await gRes.json();
      const cgData = await cgRes.json();

      if (!pRes.ok || !Array.isArray(patientsData)) {
        setPatients([]);
        setLoadError(patientsData?.error || "Could not load patients. Please restart the server (npm run dev).");
        return;
      }

      setPatients(patientsData);
      setPlans(Array.isArray(plData) ? plData : []);
      setGarbhaPlans(Array.isArray(gData) ? gData : []);
      setChildGuidancePlans(Array.isArray(cgData) ? cgData : []);

      if (!plRes.ok || !gRes.ok || !cgRes.ok) {
        setLoadError("Some plans could not load. Please restart the server (npm run dev).");
      }
    } catch {
      setPatients([]);
      setLoadError("Could not load data. Please restart the server (npm run dev).");
    }
  }

  useEffect(() => { load(); }, []);

  async function createPatient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    const res = await fetch("/api/admin/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || "Could not create patient");
      setLoading(false);
      return;
    }
    setCredentials(data.credentials);
    setForm({
      name: "",
      requirements: "",
      planId: "",
      garbhaPlanId: "",
    childGuidancePlanId: "",
      currentWeek: "1",
      startDate: formatDateInputValue(),
      username: "",
      password: "",
    });
    setShowForm(false);
    setLoading(false);
    load();
  }

  function openCredentialForm(patient: Patient) {
    setCredentialForm({ username: patient.user.username, password: "" });
    setCredentialPatientId(patient.id);
  }

  async function saveCredentials(patientId: string) {
    setCredentialLoading(true);
    const res = await fetch(`/api/admin/patients/${patientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentialForm),
    });
    const data = await res.json();
    setCredentialLoading(false);
    if (!res.ok) {
      alert(data.error || "Could not update credentials");
      return;
    }
    setCredentials(data.credentials);
    setCredentialPatientId(null);
    load();
  }

  async function deletePatient(id: string) {
    if (!confirm("Delete this patient?")) return;
    await fetch(`/api/admin/patients/${id}`, { method: "DELETE" });
    load();
  }

  async function resetPassword(id: string) {
    const res = await fetch(`/api/admin/patients/${id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not reset password");
      return;
    }
    setCredentials(data.credentials);
  }

  function autoFillCredentials() {
    const { username, password } = generatePreviewCredentials();
    setForm({ ...form, username, password });
  }

  function autoFillCredentialReset() {
    const { username, password } = generatePreviewCredentials();
    setCredentialForm({ username, password });
  }

  async function updatePatient(id: string, updates: Record<string, string>) {
    await fetch(`/api/admin/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    load();
  }

  function openCustomForm(patient: Patient, program: PatientProgram) {
    const defaultTitle =
      program === "care"
        ? `${patient.user.name} - Custom Plan`
        : program === "garbha"
          ? `${patient.user.name} - Custom Garbha Plan`
          : `${patient.user.name} - Custom Child Guidance`;
    setCustomForm({ ...emptyCustomForm, title: defaultTitle });
    setCustomPatientId(patient.id);
    setCustomProgram(program);
  }

  async function createCustomPlan(patientId: string) {
    setCustomLoading(true);
    const res = await fetch(`/api/admin/patients/${patientId}/patient-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program: customProgram, ...customForm }),
    });
    const data = await res.json();
    setCustomLoading(false);
    if (!res.ok) {
      alert(data.error || "Could not create custom plan");
      return;
    }
    setCustomPatientId(null);
    const editPath =
      customProgram === "care"
        ? `/admin/plans/${data.plan.id}`
        : customProgram === "garbha"
          ? `/admin/garbha-sanskar/${data.plan.id}`
          : `/admin/child-guidance/${data.plan.id}`;
    router.push(editPath);
  }

  async function editPatientPlan(patientId: string, program: PatientProgram) {
    setEditLoading(`${patientId}-${program}`);
    const res = await fetch(`/api/admin/patients/${patientId}/patient-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program, action: "open" }),
    });
    const data = await res.json();
    setEditLoading(null);
    if (!res.ok) {
      alert(data.error || "Could not open plan editor");
      return;
    }
    load();
    router.push(data.editPath);
  }

  function getPlanFieldKey(program: PatientProgram) {
    if (program === "care") return "planId";
    if (program === "garbha") return "garbhaPlanId";
    return "childGuidancePlanId";
  }

  function getTemplatePlans(program: PatientProgram) {
    if (program === "care") return plans;
    if (program === "garbha") return garbhaPlans;
    return childGuidancePlans;
  }

  function getAssignedPlan(patient: Patient, program: PatientProgram) {
    if (program === "care") return patient.plan;
    if (program === "garbha") return patient.garbhaPlan;
    return patient.childGuidancePlan;
  }

  function copyCredentials() {
    if (!credentials) return;
    navigator.clipboard.writeText(`ID: ${credentials.username}\nPassword: ${credentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendLifestyleAssessment(patientId: string) {
    if (
      !confirm(
        "Send Lifestyle Assessment to this patient? A shareable form link will be generated."
      )
    ) {
      return;
    }
    setAssessmentLoading(patientId);
    const res = await fetch(`/api/admin/patients/${patientId}/lifestyle-assessment`, {
      method: "POST",
    });
    const data = await res.json();
    setAssessmentLoading(null);
    if (!res.ok) {
      alert(data.error || "Could not send assessment");
      return;
    }
    if (data.formLink) {
      await navigator.clipboard.writeText(data.formLink);
      setLinkCopiedId(patientId);
      setTimeout(() => setLinkCopiedId(null), 3000);
      alert(`Assessment sent! Form link copied to clipboard:\n\n${data.formLink}`);
    }
    load();
  }

  function getAssessmentFormLink(patient: Patient) {
    const token = patient.lifestyleAssessment?.accessToken;
    if (!token) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/assessment/${token}`;
  }

  async function copyAssessmentLink(patient: Patient) {
    const link = getAssessmentFormLink(patient);
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setLinkCopiedId(patient.id);
    setTimeout(() => setLinkCopiedId(null), 2000);
  }

  function lifestyleStatus(patient: Patient) {
    const a = patient.lifestyleAssessment;
    if (!a?.requestedAt) return null;
    if (!a.submittedAt) return "pending";
    return "submitted";
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Patients</h1>
          <p className="text-sm text-slate-500 sm:text-base">Manage patients and assign plans</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Patient
        </Button>
      </div>

      {loadError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {credentials && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800">Patient Credentials Generated</h3>
          <p className="mt-2 text-sm text-green-700">
            Give these credentials to the patient. The password will not be shown again.
          </p>
          <div className="mt-3 rounded-lg bg-white p-4 font-mono text-sm">
            <p><strong>Patient ID:</strong> {credentials.username}</p>
            <p><strong>Password:</strong> {credentials.password}</p>
          </div>
          <Button className="mt-3" onClick={copyCredentials}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied!" : "Copy Credentials"}
          </Button>
        </Card>
      )}

      {showForm && (
        <Card className="mt-6">
          <h2 className="mb-4 font-semibold text-slate-900">New Patient</h2>
          <p className="mb-4 text-sm text-slate-500">
            Patient ID અને password manually આપો, અથવા ખાલી છોડો તો auto-generate થશે. Plan start date થી જ week/day unlock થશે.
          </p>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <form onSubmit={createPatient} className="space-y-4">
            <Input label="Patient Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Login Credentials</h3>
                <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={autoFillCredentials}>
                  Auto-generate ID & Password
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Patient ID"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. PAT123456"
                />
                <Input
                  label="Password"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 4 characters"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">બંને ખાલી હોય તો create કરતી વખતે auto-generate થશે.</p>
            </div>
            <Textarea label="Requirements / Notes" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} placeholder="Patient's special requirements..." />
            <Input
              label="Plan Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Select label="Care Plan" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
              <option value="">-- Select Plan --</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
            <Select label="Garbha Sanskar Plan" value={form.garbhaPlanId} onChange={(e) => setForm({ ...form, garbhaPlanId: e.target.value })}>
              <option value="">-- Select Garbha Plan --</option>
              {garbhaPlans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
            <Select label="Child Guidance Plan" value={form.childGuidancePlanId} onChange={(e) => setForm({ ...form, childGuidancePlanId: e.target.value })}>
              <option value="">-- Select Child Guidance Plan --</option>
              {childGuidancePlans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
            <Input label="Starting Week (override)" type="number" min="1" value={form.currentWeek} onChange={(e) => setForm({ ...form, currentWeek: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Patient"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {patients.map((patient) => {
          const programMeta: { program: PatientProgram; label: string; emptyLabel: string }[] = [
            { program: "care", label: "Care Plan", emptyLabel: "-- No Plan --" },
            { program: "garbha", label: "Garbha Sanskar Plan", emptyLabel: "-- No Garbha Plan --" },
            { program: "child", label: "Child Guidance Plan", emptyLabel: "-- No Child Guidance --" },
          ];

          return (
          <Card key={patient.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{patient.user.name}</h3>
                  <Badge color="purple">{patient.user.username}</Badge>
                  {lifestyleStatus(patient) === "pending" && (
                    <Badge color="pink">Assessment Pending</Badge>
                  )}
                  {lifestyleStatus(patient) === "submitted" && (
                    <Badge color="green">
                      Assessment Done
                      {patient.lifestyleAssessment?.lifestyleScore != null &&
                        ` · ${patient.lifestyleAssessment.lifestyleScore}/100`}
                    </Badge>
                  )}
                </div>
                {patient.requirements && (
                  <p className="mt-2 text-sm text-slate-600"><strong>Requirements:</strong> {patient.requirements}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  Plan: {patient.plan?.title || "Not assigned"} | Garbha: {patient.garbhaPlan?.title || "Not assigned"} | Child: {patient.childGuidancePlan?.title || "Not assigned"} | Week: {patient.currentWeek} | Start: {formatDisplayDate(patient.startDate)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 self-end sm:self-start">
                <button
                  onClick={() => openCredentialForm(patient)}
                  className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"
                  title="Edit ID / Password"
                >
                  <Key className="h-4 w-4" />
                </button>
                <button onClick={() => deletePatient(patient.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {credentialPatientId === patient.id && (
              <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50/40 p-4">
                <h4 className="text-sm font-semibold text-slate-800">Edit Login Credentials</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Input
                    label="Patient ID"
                    value={credentialForm.username}
                    onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value })}
                  />
                  <Input
                    label="New Password"
                    type="text"
                    value={credentialForm.password}
                    onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                    placeholder="Min 4 characters"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => saveCredentials(patient.id)} disabled={credentialLoading}>
                    {credentialLoading ? "Saving..." : "Save Credentials"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={autoFillCredentialReset}>
                    Auto-generate
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => resetPassword(patient.id)}>
                    Quick Auto-reset
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setCredentialPatientId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="!py-1.5 text-xs"
                disabled={assessmentLoading === patient.id}
                onClick={() => sendLifestyleAssessment(patient.id)}
              >
                <Send className="mr-1 h-3.5 w-3.5" />
                {assessmentLoading === patient.id
                  ? "Sending..."
                  : lifestyleStatus(patient) === "submitted"
                    ? "Re-send Assessment"
                    : "Send Assessment"}
              </Button>
              {lifestyleStatus(patient) === "pending" && patient.lifestyleAssessment?.accessToken && (
                <Button
                  variant="secondary"
                  className="!py-1.5 text-xs"
                  onClick={() => copyAssessmentLink(patient)}
                >
                  {linkCopiedId === patient.id ? (
                    <Check className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Link2 className="mr-1 h-3.5 w-3.5" />
                  )}
                  {linkCopiedId === patient.id ? "Link Copied!" : "Copy Form Link"}
                </Button>
              )}
              {lifestyleStatus(patient) === "submitted" && (
                <a
                  href="/admin/lifestyle-assessments"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Assessment
                </a>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {programMeta.map(({ program, label, emptyLabel }) => {
                const assigned = getAssignedPlan(patient, program);
                const fieldKey = getPlanFieldKey(program);
                const templates = getTemplatePlans(program);
                const editKey = `${patient.id}-${program}`;

                return (
                  <div key={program} className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">{label}</label>
                    {assigned ? (
                      <>
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2">
                          <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-pink-700">
                            {assigned.isCustom && <Sparkles className="h-3.5 w-3.5 shrink-0" />}
                            <span className="truncate">{assigned.title}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => editPatientPlan(patient.id, program)}
                            disabled={editLoading === editKey}
                            className="flex shrink-0 items-center gap-1 rounded-md bg-pink-600 px-2 py-1 text-xs font-medium text-white hover:bg-pink-700 disabled:opacity-50"
                          >
                            <SquarePen className="h-3 w-3" />
                            {editLoading === editKey ? "..." : "Edit"}
                          </button>
                        </div>
                        {assigned.isCustom ? (
                          <button
                            onClick={() => updatePatient(patient.id, { [fieldKey]: "" })}
                            className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                          >
                            Remove custom plan
                          </button>
                        ) : (
                          <Select
                            value={assigned.id}
                            onChange={(e) => updatePatient(patient.id, { [fieldKey]: e.target.value })}
                          >
                            <option value="">{emptyLabel}</option>
                            {templates.map((p) => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </Select>
                        )}
                      </>
                    ) : (
                      <>
                        <Select
                          value=""
                          onChange={(e) => updatePatient(patient.id, { [fieldKey]: e.target.value })}
                        >
                          <option value="">{emptyLabel}</option>
                          {templates.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </Select>
                        <button
                          onClick={() => openCustomForm(patient, program)}
                          className="flex items-center gap-1 text-xs font-medium text-pink-600 hover:underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Create custom plan
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input
                label="Plan Start Date"
                type="date"
                defaultValue={formatDateInputValue(patient.startDate)}
                onBlur={(e) => updatePatient(patient.id, { startDate: e.target.value })}
              />
              <Input
                label="Current Week"
                type="number"
                min="1"
                defaultValue={patient.currentWeek}
                onBlur={(e) => updatePatient(patient.id, { currentWeek: e.target.value })}
              />
            </div>

            {customPatientId === patient.id && (
              <div className="mt-3 rounded-lg border border-pink-100 bg-pink-50/40 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-600" />
                  <h4 className="text-sm font-semibold text-slate-800">
                    Custom {customProgram === "care" ? "Care" : customProgram === "garbha" ? "Garbha" : "Child Guidance"} Plan for {patient.user.name}
                  </h4>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setCustomForm({ ...customForm, mode: "new" })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      customForm.mode === "new"
                        ? "border-pink-500 bg-pink-100 text-pink-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Create new
                  </button>
                  <button
                    onClick={() => setCustomForm({ ...customForm, mode: "copy" })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      customForm.mode === "copy"
                        ? "border-pink-500 bg-pink-100 text-pink-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Copy from existing
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <Input
                    label="Plan Title"
                    value={customForm.title}
                    onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  />

                  {customForm.mode === "new" ? (
                    <Input
                      label="Total Weeks"
                      type="number"
                      min="1"
                      max="52"
                      value={customForm.totalWeeks}
                      onChange={(e) => setCustomForm({ ...customForm, totalWeeks: e.target.value })}
                    />
                  ) : (
                    <Select
                      label="Copy from which plan?"
                      value={customForm.sourcePlanId}
                      onChange={(e) => setCustomForm({ ...customForm, sourcePlanId: e.target.value })}
                    >
                      <option value="">-- Select Plan --</option>
                      {getTemplatePlans(customProgram).map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </Select>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => createCustomPlan(patient.id)}
                    disabled={customLoading || (customForm.mode === "copy" && !customForm.sourcePlanId)}
                  >
                    {customLoading ? "Creating..." : "Create & Edit"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setCustomPatientId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
          );
        })}
        {patients.length === 0 && (
          <p className="text-center text-slate-500 py-8">No patients yet. Click Add Patient.</p>
        )}
      </div>
    </AdminLayout>
  );
}
