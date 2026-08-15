"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandLogo";
import { LocaleToggle } from "@/components/LocaleToggle";
import type { PatientLocale } from "@/lib/patient-locale";
import { publicSiteCopy } from "@/lib/public-site-i18n";

export function PublicHeader({
  locale,
  onLocaleChange,
  portalHref,
  portalLabel,
}: {
  locale: PatientLocale;
  onLocaleChange: (locale: PatientLocale) => void;
  portalHref?: string;
  portalLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const copy = publicSiteCopy(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)]/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
          <BrandMark size="sm" />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label={copy.navAria}>
          {copy.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--primary)]"
            >
              {item.label}
            </a>
          ))}
          <LocaleToggle locale={locale} onChange={onLocaleChange} />
          {portalHref && portalLabel ? (
            <Link
              href={portalHref}
              className="inline-flex items-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[rgba(31,107,69,0.22)] transition hover:bg-[#185738]"
            >
              {portalLabel}
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleToggle locale={locale} onChange={onLocaleChange} />
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--primary)]"
            aria-expanded={open}
            aria-controls="public-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{open ? copy.menuClose : copy.menuOpen}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="public-mobile-nav"
          className="border-t border-[var(--border)] bg-white/95 px-4 py-3 lg:hidden"
          aria-label={copy.mobileNavAria}
        >
          {copy.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {portalHref && portalLabel ? (
            <Link
              href={portalHref}
              className="mt-1 block rounded-xl bg-[var(--primary)] px-3 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              {portalLabel}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
