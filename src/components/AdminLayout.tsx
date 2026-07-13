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
} from "lucide-react";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/admin/plans", label: "Plans", shortLabel: "Plans", icon: ClipboardList },
  { href: "/admin/patients", label: "Patients", shortLabel: "Patients", icon: Users },
  { href: "/admin/lifestyle-assessments", label: "Lifestyle", shortLabel: "Lifestyle", icon: FileText },
  { href: "/admin/followups", label: "Followups", shortLabel: "Followup", icon: BarChart3 },
  { href: "/admin/garbha-sanskar", label: "Garbha Sanskar", shortLabel: "Garbha", icon: Baby },
  { href: "/admin/child-guidance", label: "Child Guidance", shortLabel: "Child", icon: GraduationCap },
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="relative hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-5 py-4">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-pink-50 text-pink-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <BrandMark subtitle="Admin Panel" size="sm" />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 p-4 pb-24 md:p-8 md:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="grid grid-cols-7 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition",
                  active ? "text-pink-700" : "text-slate-500"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-pink-600")} />
                <span className="truncate">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
