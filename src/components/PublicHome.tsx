"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Baby,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/BrandLogo";
import { PublicHeader } from "@/components/PublicHeader";
import { InquiryForm } from "@/components/InquiryForm";
import type { PatientLocale } from "@/lib/patient-locale";
import { PUBLIC_LOCALE_KEY, publicSiteCopy } from "@/lib/public-site-i18n";

const ABOUT_ICONS = [Stethoscope, Leaf, ShieldCheck, Sparkles] as const;
const SERVICE_ICONS = [
  HeartPulse,
  Baby,
  GraduationCap,
  ClipboardCheck,
  CalendarCheck,
  Smartphone,
] as const;

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path
        d="M24 6c8 8 14 16 14 26a14 14 0 1 1-28 0C10 22 16 14 24 6Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M24 12v24" stroke="#f5f8f5" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function readStoredLocale(): PatientLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(PUBLIC_LOCALE_KEY);
  return stored === "en" || stored === "gu" ? stored : "en";
}

export function PublicHome({ patientLoggedIn }: { patientLoggedIn: boolean }) {
  const [locale, setLocale] = useState<PatientLocale>("en");
  const copy = publicSiteCopy(locale);

  useEffect(() => {
    setLocale(readStoredLocale());
    document.documentElement.lang = readStoredLocale();
  }, []);

  function handleLocaleChange(next: PatientLocale) {
    setLocale(next);
    window.localStorage.setItem(PUBLIC_LOCALE_KEY, next);
    document.documentElement.lang = next;
  }

  return (
    <div className="jeevanm-atmosphere relative min-h-dvh text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="login-orb login-orb--green" />
        <div className="login-orb login-orb--gold" />
        <div className="login-orb login-orb--soft" />
        <LeafMark className="animate-login-leaf absolute left-[5%] top-[22%] hidden h-14 w-14 text-[var(--primary)]/20 lg:block" />
        <LeafMark className="animate-login-leaf-delay absolute right-[7%] top-[48%] hidden h-16 w-16 text-[var(--secondary)]/25 lg:block" />
      </div>

      <PublicHeader
        locale={locale}
        onLocaleChange={handleLocaleChange}
        portalHref={patientLoggedIn ? "/patient" : undefined}
        portalLabel={patientLoggedIn ? copy.portalMyPlan : undefined}
      />

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
          <div className="animate-jeevanm-rise grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {copy.heroKicker}
              </p>
              <h1 className="font-display mt-5 text-5xl font-semibold tracking-[0.06em] text-[var(--primary)] sm:text-6xl lg:text-7xl">
                JEEVAN<span className="text-[var(--gold)]">M</span>
              </h1>
              <div className="login-brand-rule mx-auto mt-4 h-px w-44 lg:mx-0" aria-hidden />
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Transforming Habits Into Health
              </p>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--foreground)] sm:text-xl lg:mx-0">
                {copy.heroLine}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base lg:mx-0">
                {copy.heroBody}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                {patientLoggedIn ? (
                  <Link
                    href="/patient"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-[rgba(31,107,69,0.22)] transition hover:bg-[#185738] sm:w-auto"
                  >
                    {copy.ctaOpenPlan}
                  </Link>
                ) : null}
                <a
                  href="#services"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-light)] sm:w-auto"
                >
                  {copy.ctaServices}
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="animate-jeevanm-logo relative">
                <div
                  className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,rgba(31,107,69,0.16),transparent_68%)]"
                  aria-hidden
                />
                <BrandLogo size="xl" priority className="relative h-52 w-52 sm:h-60 sm:w-60" />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="relative scroll-mt-24 border-y border-[var(--border)]/80 bg-white/55">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                {copy.aboutKicker}
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                {copy.aboutTitle}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {copy.aboutBody}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {copy.aboutCards.map((item, index) => {
                const Icon = ABOUT_ICONS[index];
                return (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-[var(--border)]/90 bg-white/90 p-5 shadow-[0_10px_30px_rgba(20,32,26,0.04)]"
                  >
                    <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden />
                    <p className="mt-3 font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section id="services" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              {copy.servicesKicker}
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {copy.servicesTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {copy.servicesIntro}
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.services.map((service, index) => {
              const Icon = SERVICE_ICONS[index];
              return (
                <li
                  key={service.title}
                  className="rounded-[1.5rem] border border-[var(--border)]/90 bg-white/85 p-6 shadow-[0_12px_36px_rgba(20,32,26,0.05)] backdrop-blur-sm"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{service.title}</h3>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary)]">
                    {service.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{service.body}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="programs" className="relative scroll-mt-24 border-y border-[var(--border)]/80 bg-white/55">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                {copy.programsKicker}
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                {copy.programsTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {copy.programsIntro}
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {copy.programs.map((program) => (
                <article
                  key={program.title}
                  className="rounded-[1.5rem] border border-[var(--border)]/90 bg-white/90 p-6 shadow-[0_12px_36px_rgba(20,32,26,0.05)]"
                >
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{program.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{program.lead}</p>
                  <ul className="mt-4 space-y-2.5">
                    {program.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-[var(--foreground)]/85">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="relative scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                {copy.howKicker}
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                {copy.howTitle}
              </h2>
            </div>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.steps.map((step) => (
                <li
                  key={step.n}
                  className="rounded-[1.5rem] border border-[var(--border)]/90 bg-white/90 p-6"
                >
                  <p className="font-display text-3xl font-semibold text-[var(--gold)]">{step.n}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="portal" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
          <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,#1f6b45_0%,#185738_55%,#b8892d_140%)] px-6 py-12 text-center text-white shadow-[0_20px_50px_rgba(31,107,69,0.28)] sm:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-soft)]">
              {copy.portalKicker}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{copy.portalTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              {copy.portalBody}
            </p>
            {patientLoggedIn ? (
              <Link
                href="/patient"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:bg-[var(--gold-soft)]"
              >
                {copy.portalCtaDashboard}
              </Link>
            ) : null}
          </div>
        </section>

        <section id="inquiry" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              {copy.inquiryKicker}
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {copy.inquiryTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {copy.inquiryBody}
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <InquiryForm
              copy={{
                name: copy.inquiryName,
                phone: copy.inquiryPhone,
                email: copy.inquiryEmail,
                emailOptional: copy.inquiryEmailOptional,
                interest: copy.inquiryInterest,
                message: copy.inquiryMessage,
                submit: copy.inquirySubmit,
                sending: copy.inquirySending,
                success: copy.inquirySuccess,
                another: copy.inquiryAnother,
                error: copy.inquiryError,
                interests: copy.inquiryInterests,
              }}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <BrandMark size="sm" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{copy.footerBlurb}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/terms" className="text-[var(--muted)] hover:text-[var(--primary)]">
              {copy.footerTerms}
            </Link>
            <Link href="/privacy" className="text-[var(--muted)] hover:text-[var(--primary)]">
              {copy.footerPrivacy}
            </Link>
            <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--primary)]">
              {copy.footerClinic}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
