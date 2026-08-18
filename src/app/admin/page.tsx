import { getSession, isStaffRole } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { panelPath } from "@/lib/staff-roles";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !isStaffRole(session.role)) {
    return <AdminLoginForm />;
  }

  if (session.role !== "ADMIN") {
    redirect(panelPath(session.role));
  }

  return <AdminDashboard />;
}
