import { NextResponse } from "next/server";
import { getSession, isStaffRole } from "@/lib/auth";
import { capabilitiesFor, panelPath } from "@/lib/staff-roles";
import type { StaffRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.role as StaffRole;
  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      name: session.name,
      role,
      doctorId: session.doctorId ?? null,
    },
    panel: panelPath(role),
    capabilities: capabilitiesFor(role),
  });
}
