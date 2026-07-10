import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PatientLoginForm } from "@/components/PatientLoginForm";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "PATIENT") {
    redirect("/patient");
  }
  return <PatientLoginForm />;
}
