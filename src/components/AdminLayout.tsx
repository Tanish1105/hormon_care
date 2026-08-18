"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Users,
  Baby,
  GraduationCap,
  BarChart3,
  FileText,
  MessageSquare,
  Pill,
  Stethoscope,
} from "lucide-react";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useStaffPortal } from "@/components/StaffPortalContext";
import type { StaffCapabilities } from "@/lib/staff-roles";

function navItems(caps: StaffCapabilities) {
  const b = caps.basePath;
  const items = [
    { href: b, label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
    { href: `${b}/patients`, label: "Patients", shortLabel: "Patients", icon: Users },
  ];

  if (caps.canManageStaff) {
    items.push({ href: `${b}/staff`, label: "Staff", shortLabel: "Staff", icon: Stethoscope });
  }
  if (caps.canWritePlans) {
    items.push(
      { href: `${b}/plans`, label: "Arogya Sanskruti", shortLabel: "Arogya", icon: ClipboardList },
      { href: `${b}/garbha-sanskar`, label: "Garbh Sanskruti", shortLabel: "Garbh", icon: Baby },
      {
        href: `${b}/child-guidance`,
        label: "Parenting Sanskruti",
        shortLabel: "Parenting",
        icon: GraduationCap,
      }
    );
  }
  items.push({
    href: `${b}/lifestyle-assessments`,
    label: "Lifestyle",
    shortLabel: "Lifestyle",
    icon: FileText,
  });
  items.push({
    href: `${b}/followups`,
    label: "Followups",
    shortLabel: "Followup",
    icon: BarChart3,
  });
  if (caps.canManageInquiries) {
    items.push({
      href: `${b}/inquiries`,
      label: "Inquiries",
      shortLabel: "Inquiry",
      icon: MessageSquare,
    });
  }
  if (caps.canManageSupplements) {
    items.push({
      href: `${b}/supplements`,
      label: "Supplements",
      shortLabel: "Supp",
      icon: Pill,
    });
  }
  return items;
}

function isActive(pathname: string, href: string, basePath: string) {
  return pathname === href || (href !== basePath && pathname.startsWith(href));
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { name, capabilities, accountRole } = useStaffPortal();
  const items = navItems(capabilities);
  const previewing = accountRole === "ADMIN" && capabilities.role !== "ADMIN";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] md:flex-row">
      <aside className="relative hidden w-64 flex-col border-r border-[var(--border)] bg-white md:flex">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <BrandMark subtitle={capabilities.panelLabel} size="md" />
          {name ? <p className="mt-2 truncate text-xs text-[var(--muted)]">{name}</p> : null}
        </div>
        {accountRole === "ADMIN" ? (
          <div className="grid grid-cols-2 gap-1 border-b border-[var(--border)] p-3">
            {[
              { href: "/admin", label: "Admin" },
              { href: "/doctor", label: "Doctor" },
              { href: "/staff", label: "Staff" },
              { href: "/dietitian", label: "Dietitian" },
            ].map((panel) => (
              <Link
                key={panel.href}
                href={panel.href}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition",
                  capabilities.basePath === panel.href
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-mist)] text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {panel.label}
              </Link>
            ))}
          </div>
        ) : null}
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, capabilities.basePath);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-mist)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-mist)]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <BrandMark subtitle={capabilities.panelLabel} size="sm" />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-mist)]"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-auto p-4 pb-36 md:p-8 md:pb-8">
        {previewing ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Admin account thi {capabilities.panelLabel} open chhe. Bijo user thi login karva{" "}
            <strong>Logout</strong> karo, pachhi doctor / staff / dietitian username thi login karo.
          </div>
        ) : null}
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-white/95 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className={cn("grid gap-1", items.length > 5 ? "grid-cols-5" : "grid-cols-4")}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, capabilities.basePath);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition",
                  active ? "text-[var(--primary)]" : "text-[var(--muted)]"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-[var(--primary)]")} />
                <span className="truncate">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
