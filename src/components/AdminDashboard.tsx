"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Badge } from "@/components/ui";
import { Users, ClipboardList, Baby, GraduationCap } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, plans: 0, garbha: 0, childGuidance: 0 });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/patients").then((r) => r.json()),
      fetch("/api/admin/plans").then((r) => r.json()),
      fetch("/api/admin/garbha-plans").then((r) => r.json()),
      fetch("/api/admin/child-guidance-plans").then((r) => r.json()),
    ]).then(([patients, plans, garbha, childGuidance]) => {
      setStats({
        patients: patients.length || 0,
        plans: plans.length || 0,
        garbha: garbha.length || 0,
        childGuidance: childGuidance.length || 0,
      });
    });
  }, []);

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
    { label: "Total Patients", value: stats.patients, icon: Users, href: "/admin/patients", color: "pink" },
    { label: "Active Plans", value: stats.plans, icon: ClipboardList, href: "/admin/plans", color: "purple" },
    { label: "Garbh Sanskruti", value: stats.garbha, icon: Baby, href: "/admin/garbha-sanskar", color: "green" },
    { label: "Parenting Sanskruti", value: stats.childGuidance, icon: GraduationCap, href: "/admin/child-guidance", color: "slate" },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-slate-500 sm:text-base">Gynecology care management overview</p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="hover:border-pink-200 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-pink-500" />
                    <Badge color={card.color as "pink" | "purple" | "green" | "slate"}>{card.value}</Badge>
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
          </ol>
        </Card>

        <Card className="mt-8">
          <h2 className="font-semibold text-slate-900">Change Admin Password</h2>
          <p className="mt-1 text-sm text-slate-500">Password change option માત્ર admin portal અંદર ઉપલબ્ધ છે.</p>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700 disabled:opacity-50"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
