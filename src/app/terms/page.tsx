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

export default function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions" guTitle="નિયમો અને શરતો">
      <p>
        Welcome to Hormon Care. By accessing or using this patient care platform, you agree to
        these Terms &amp; Conditions. If you do not agree, please do not use the service.
      </p>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">1. Service purpose</h2>
        <p>
          Hormon Care helps your doctor share care plans, lifestyle assessments, weekly follow-ups,
          and educational content. It is a support tool and does not replace in-person medical
          advice, diagnosis, or emergency care.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">2. Patient account</h2>
        <p>
          Your Patient ID and password are issued by your clinic. Keep them confidential. You are
          responsible for activity under your account. Contact the clinic immediately if you
          suspect unauthorized access.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">3. Accurate information</h2>
        <p>
          Information you submit in assessments and follow-ups should be honest and complete to the
          best of your knowledge. Your care team may use this information to guide your plan.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">4. Content &amp; unlock schedule</h2>
        <p>
          Plan content may unlock week-by-week or day-by-day as set by your doctor. Do not share
          protected media outside the app. Screenshots or redistribution of clinic content may be
          restricted.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">5. Medical disclaimer</h2>
        <p>
          Educational videos and written guidance are for informational support only. For urgent
          symptoms or medical emergencies, contact your doctor or local emergency services.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">6. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use after changes means you accept
          the updated terms. For questions, contact your clinic.
        </p>
      </section>
      <p className="rounded-xl border border-[#eadfd6] bg-white px-4 py-3 text-slate-600">
        આ સેવા તમારા ડૉક્ટરની સારવારમાં સહાયરૂપ છે; તાત્કાલિક તબીબી મદદ માટે હંમેશા તમારા ડૉક્ટર અથવા
        ઇમરજન્સી સેવાનો સંપર્ક કરો.
      </p>
    </LegalShell>
  );
}
