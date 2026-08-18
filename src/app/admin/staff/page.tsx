"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button, Card, Input, Select, Badge } from "@/components/ui";
import { Plus, Trash2, Key } from "lucide-react";

type StaffUser = {
  id: string;
  username: string;
  name: string;
  role: "DOCTOR" | "DOCTOR_STAFF" | "DIETITIAN";
  doctorId: string | null;
  doctor: { id: string; name: string; username: string } | null;
  _count: {
    patientsAsDoctor: number;
    patientsAsDietitian: number;
    staffMembers: number;
  };
};

const emptyForm = {
  name: "",
  username: "",
  password: "",
  role: "DOCTOR" as StaffUser["role"],
  doctorId: "",
};

function roleLabel(role: StaffUser["role"]) {
  if (role === "DOCTOR") return "Doctor";
  if (role === "DOCTOR_STAFF") return "Doctor's Staff";
  return "Dietitian";
}

export default function StaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const doctors = users.filter((u) => u.role === "DOCTOR");

  async function load() {
    setError("");
    const res = await fetch("/api/admin/staff");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load staff");
      return;
    }
    setUsers(Array.isArray(data.users) ? data.users : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create staff");
      return;
    }
    setCredentials(data.credentials);
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function savePassword(id: string) {
    if (!resetPassword.trim()) return;
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not update password");
      return;
    }
    setCredentials({ username: data.user.username, password: resetPassword });
    setResetId(null);
    setResetPassword("");
  }

  async function remove(id: string) {
    if (!confirm("Delete this staff account?")) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not delete");
      return;
    }
    load();
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Staff</h1>
          <p className="text-sm text-slate-500">
            Create doctors, doctor&apos;s staff and dietitians. Assign patients to them from the Patients page.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {credentials ? (
        <Card className="mt-6 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800">Login created</h3>
          <p className="mt-2 font-mono text-sm">
            Username: {credentials.username}
            <br />
            Password: {credentials.password}
          </p>
        </Card>
      ) : null}

      {showForm ? (
        <Card className="mt-6">
          <h2 className="mb-4 font-semibold text-slate-900">New staff member</h2>
          <form onSubmit={createStaff} className="space-y-4">
            <Select
              label="Role"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as StaffUser["role"], doctorId: "" })
              }
            >
              <option value="DOCTOR">Doctor</option>
              <option value="DOCTOR_STAFF">Doctor&apos;s Staff</option>
              <option value="DIETITIAN">Dietitian</option>
            </Select>
            {form.role === "DOCTOR_STAFF" ? (
              <Select
                label="Works with doctor"
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                required
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            ) : null}
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{user.name}</h3>
                  <Badge color={user.role === "DOCTOR" ? "green" : user.role === "DIETITIAN" ? "gold" : "purple"}>
                    {roleLabel(user.role)}
                  </Badge>
                  <Badge color="slate">{user.username}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {user.role === "DOCTOR_STAFF" && user.doctor
                    ? `Staff of ${user.doctor.name}`
                    : user.role === "DOCTOR"
                      ? `${user._count.patientsAsDoctor} patients · ${user._count.staffMembers} staff`
                      : `${user._count.patientsAsDietitian} assigned patients`}
                </p>
                {resetId === user.id ? (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <Input
                      label="New password"
                      type="password"
                      autoComplete="new-password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                    <Button onClick={() => savePassword(user.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setResetId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-[var(--secondary)] hover:bg-[var(--gold-soft)]"
                  title="Reset password"
                  onClick={() => {
                    setResetId(user.id);
                    setResetPassword("");
                  }}
                >
                  <Key className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  onClick={() => remove(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {users.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No doctors, staff or dietitians yet.</p>
        ) : null}
      </div>
    </AdminLayout>
  );
}
