import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminDashboard } from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
