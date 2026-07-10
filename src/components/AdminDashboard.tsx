"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Badge } from "@/components/ui";
import { Users, ClipboardList, Baby, GraduationCap } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, plans: 0, garbha: 0, childGuidance: 0 });

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

  const cards = [
    { label: "Total Patients", value: stats.patients, icon: Users, href: "/admin/patients", color: "pink" },
    { label: "Active Plans", value: stats.plans, icon: ClipboardList, href: "/admin/plans", color: "purple" },
    { label: "Garbha Sanskar", value: stats.garbha, icon: Baby, href: "/admin/garbha-sanskar", color: "green" },
    { label: "Child Guidance", value: stats.childGuidance, icon: GraduationCap, href: "/admin/child-guidance", color: "slate" },
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
            <li>Create a week-wise plan in <strong>Garbha Sanskar</strong> or <strong>Child Guidance</strong> and assign it to patients</li>
          </ol>
        </Card>
      </div>
    </AdminLayout>
  );
}
