"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { capabilitiesFor, type StaffCapabilities } from "@/lib/staff-roles";
import type { StaffRole } from "@/lib/auth";

type StaffMe = {
  name: string;
  username: string;
  role: StaffRole;
  accountRole: StaffRole;
  doctorId: string | null;
  capabilities: StaffCapabilities;
};

const StaffPortalContext = createContext<StaffMe | null>(null);

export function StaffPortalProvider({
  value,
  children,
}: {
  value: StaffMe;
  children: React.ReactNode;
}) {
  return <StaffPortalContext.Provider value={value}>{children}</StaffPortalContext.Provider>;
}

export function roleFromPath(pathname: string): StaffRole {
  if (pathname.startsWith("/doctor")) return "DOCTOR";
  if (pathname.startsWith("/staff")) return "DOCTOR_STAFF";
  if (pathname.startsWith("/dietitian")) return "DIETITIAN";
  return "ADMIN";
}

export function useStaffPortal(): StaffMe {
  const ctx = useContext(StaffPortalContext);
  const pathname = usePathname();
  const panelRole = roleFromPath(pathname);
  const [account, setAccount] = useState<{
    name: string;
    username: string;
    role: StaffRole;
    doctorId: string | null;
  } | null>(ctx ? {
    name: ctx.name,
    username: ctx.username,
    role: ctx.accountRole,
    doctorId: ctx.doctorId,
  } : null);

  useEffect(() => {
    if (ctx) return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.user?.role) return;
        setAccount({
          name: data.user.name,
          username: data.user.username,
          role: data.user.role,
          doctorId: data.user.doctorId ?? null,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ctx]);

  if (ctx) {
    return {
      ...ctx,
      role: panelRole,
      capabilities: capabilitiesFor(panelRole),
    };
  }

  return {
    name: account?.name ?? "",
    username: account?.username ?? "",
    role: panelRole,
    accountRole: account?.role ?? panelRole,
    doctorId: account?.doctorId ?? null,
    capabilities: capabilitiesFor(panelRole),
  };
}
