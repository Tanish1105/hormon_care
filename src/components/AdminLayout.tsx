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
} from "lucide-react";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/admin/plans", label: "Arogya Sanskruti", shortLabel: "Arogya", icon: ClipboardList },
  { href: "/admin/patients", label: "Patients", shortLabel: "Patients", icon: Users },
  { href: "/admin/lifestyle-assessments", label: "Lifestyle", shortLabel: "Lifestyle", icon: FileText },
  { href: "/admin/followups", label: "Followups", shortLabel: "Followup", icon: BarChart3 },
  { href: "/admin/inquiries", label: "Inquiries", shortLabel: "Inquiry", icon: MessageSquare },
  { href: "/admin/supplements", label: "Supplements", shortLabel: "Supp", icon: Pill },
  { href: "/admin/garbha-sanskar", label: "Garbh Sanskruti", shortLabel: "Garbh", icon: Baby },
  { href: "/admin/child-guidance", label: "Parenting Sanskruti", shortLabel: "Parenting", icon: GraduationCap },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] md:flex-row">
      <aside className="relative hidden w-64 flex-col border-r border-[var(--border)] bg-white md:flex">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <BrandMark subtitle="Admin Panel" size="md" />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
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
        <BrandMark subtitle="Admin Panel" size="sm" />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-mist)]"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-auto p-4 pb-36 md:p-8 md:pb-8">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-white/95 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
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
