"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Badge, Input } from "@/components/ui";
import { useStaffPortal } from "@/components/StaffPortalContext";
import { Users, ClipboardList, Baby, GraduationCap, MessageSquare } from "lucide-react";

export function AdminDashboard() {
  const { capabilities, name } = useStaffPortal();
  const [stats, setStats] = useState({
    patients: 0,
    plans: 0,
    garbha: 0,
    childGuidance: 0,
    inquiries: 0,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const requests: Promise<unknown>[] = [
      fetch("/api/admin/patients").then((r) => r.json()),
    ];
    if (capabilities.canWritePlans) {
      requests.push(
        fetch("/api/admin/plans").then((r) => r.json()),
        fetch("/api/admin/garbha-plans").then((r) => r.json()),
        fetch("/api/admin/child-guidance-plans").then((r) => r.json())
      );
    }
    if (capabilities.canManageInquiries) {
      requests.push(fetch("/api/admin/inquiries").then((r) => r.json()));
    }
    Promise.all(requests).then((results) => {
      const patients = results[0] as { length?: number };
      const plans = capabilities.canWritePlans ? (results[1] as { length?: number }) : [];
      const garbha = capabilities.canWritePlans ? (results[2] as { length?: number }) : [];
      const childGuidance = capabilities.canWritePlans ? (results[3] as { length?: number }) : [];
      const inquiries = capabilities.canManageInquiries
        ? (results[capabilities.canWritePlans ? 4 : 1] as { aggregate?: { newCount?: number } })
        : { aggregate: { newCount: 0 } };
      setStats({
        patients: patients.length || 0,
        plans: plans.length || 0,
        garbha: garbha.length || 0,
        childGuidance: childGuidance.length || 0,
        inquiries: inquiries.aggregate?.newCount || 0,
      });
    });
  }, [capabilities.canWritePlans, capabilities.canManageInquiries]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    const res = await fetch("/api/auth/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await res.json();
    setChangingPassword(false);

    if (!res.ok) {
      setPasswordError(data.error || "Password change failed");
      return;
    }

    setPasswordSuccess(data.message || "Password બદલાઈ ગયો");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  const cards = [
    { label: "Total Patients", value: stats.patients, icon: Users, href: `${capabilities.basePath}/patients`, color: "green", show: true },
    { label: "Active Plans", value: stats.plans, icon: ClipboardList, href: `${capabilities.basePath}/plans`, color: "gold", show: capabilities.canWritePlans },
    { label: "Garbh Sanskruti", value: stats.garbha, icon: Baby, href: `${capabilities.basePath}/garbha-sanskar`, color: "green", show: capabilities.canWritePlans },
    { label: "Parenting Sanskruti", value: stats.childGuidance, icon: GraduationCap, href: `${capabilities.basePath}/child-guidance`, color: "slate", show: capabilities.canWritePlans },
    { label: "New Inquiries", value: stats.inquiries, icon: MessageSquare, href: `${capabilities.basePath}/inquiries`, color: "gold", show: capabilities.canManageInquiries },
  ].filter((card) => card.show);

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--muted)] sm:text-base">
          {name ? `Welcome, ${name}` : "JEEVANM care management overview"}
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="hover:border-[var(--border)] transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-[var(--primary)]" />
                    <Badge color={card.color as "green" | "gold" | "slate" | "pink" | "purple"}>{card.value}</Badge>
                  </div>
                  <p className="mt-4 text-lg font-semibold">{card.label}</p>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="mt-8">
          <h2 className="font-semibold text-slate-900">Quick Guide</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>First create a week-wise plan in <strong>Plans</strong> (with image/video upload)</li>
            <li>Then add exercises, images and videos to each <strong>Week</strong></li>
            <li>Add <strong>Patients</strong> — the system automatically generates an ID/password</li>
            <li>Assign a plan to each patient based on their requirements</li>
            <li>Create a week-wise plan in <strong>Garbh Sanskruti</strong> or <strong>Parenting Sanskruti</strong> and assign it to patients</li>
            <li>In <strong>Supplements</strong>, open a patient and assign a personal list with a title like &quot;For 2 months&quot;. Next time, assign again with a new title — old list stays in history.</li>
          </ol>
        </Card>

        <Card className="mt-8">
          <h2 className="font-semibold text-slate-900">Change Password</h2>
          <p className="mt-1 text-sm text-slate-500">Update the password for this clinic login.</p>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#185738] disabled:opacity-50"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
