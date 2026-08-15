import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PatientLoginForm } from "@/components/PatientLoginForm";

export const metadata: Metadata = {
  title: "Patient Login",
};

export default async function PatientLoginPage() {
  const session = await getSession();
  if (session?.role === "PATIENT") {
    redirect("/patient");
  }
  return <PatientLoginForm />;
}
