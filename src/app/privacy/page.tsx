import Link from "next/link";
import { BrandLogo, BrandMark } from "@/components/BrandLogo";

function LegalShell({
  title,
  guTitle,
  children,
}: {
  title: string;
  guTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf6f3]">
      <header className="border-b border-[#eadfd6] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/">
            <BrandMark size="sm" />
          </Link>
          <Link href="/" className="text-sm font-medium text-pink-700 hover:underline">
            Back to Login
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex justify-center sm:justify-start">
          <BrandLogo size="md" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pink-700/80">
          {guTitle}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">{children}</div>
      </main>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" guTitle="ગોપનીયતા નીતિ">
      <p>
        Hormon Care respects your privacy. This policy explains what information we collect, how
        it is used, and how it is protected when you use the patient platform.
      </p>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">1. Information we collect</h2>
        <p>
          We may collect your name, Patient ID, care-plan progress, lifestyle assessment answers,
          weekly follow-up responses, and related clinical notes shared by your clinic.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">2. How we use information</h2>
        <p>
          Information is used to deliver your assigned plan, unlock content on schedule, support
          follow-ups, and help your doctor review progress. We do not sell your personal health
          information.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">3. Who can access your data</h2>
        <p>
          Authorized clinic staff (such as your doctor and admin users) can access records needed
          for your care. Technical operators may access systems for maintenance and security under
          confidentiality controls.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">4. Storage &amp; security</h2>
        <p>
          Data is stored in secured databases with access controls. You should keep your login
          credentials private and use the app only on trusted devices.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">5. Cookies &amp; sessions</h2>
        <p>
          We use session cookies/tokens so you can stay logged in securely while using the
          platform. These are required for authentication and are not used for advertising.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">6. Your choices</h2>
        <p>
          To correct account details, request access, or ask about deletion of records, contact
          your clinic. Some clinical records may be retained as required for medical and legal
          purposes.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">7. Updates</h2>
        <p>
          This privacy policy may be updated periodically. The latest version will be available on
          this page.
        </p>
      </section>
      <p className="rounded-xl border border-[#eadfd6] bg-white px-4 py-3 text-slate-600">
        તમારી તબીબી માહિતી ફક્ત સારવાર અને પ્લાન સપોર્ટ માટે વપરાય છે. વધુ માહિતી માટે તમારી ક્લિનિકનો
        સંપર્ક કરો.
      </p>
    </LegalShell>
  );
}
