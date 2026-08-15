import { getSession } from "@/lib/auth";
import { PublicHome } from "@/components/PublicHome";

export default async function HomePage() {
  const session = await getSession();
  return <PublicHome patientLoggedIn={session?.role === "PATIENT"} />;
}
