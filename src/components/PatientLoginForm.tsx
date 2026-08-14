"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Input } from "@/components/ui";

function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M24 6c8 8 14 16 14 26a14 14 0 1 1-28 0C10 22 16 14 24 6Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 12v24"
        stroke="#f5f8f5"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function PatientLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20_000);
      const res = await fetch("/api/auth/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/patient";
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      setError(
        aborted
          ? "Server response slow / DB connection fail. Hostinger DB settings check karo."
          : "Network error — server reach nathi thatu. Thodi vaar pachhi try karo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell relative min-h-screen overflow-hidden">
      <div className="login-orb login-orb--green" aria-hidden />
      <div className="login-orb login-orb--gold" aria-hidden />
      <div className="login-orb login-orb--soft" aria-hidden />

      <LeafMark className="animate-login-leaf pointer-events-none absolute left-[6%] top-[18%] hidden h-14 w-14 text-[var(--primary)]/25 lg:block" />
      <LeafMark className="animate-login-leaf-delay pointer-events-none absolute bottom-[16%] right-[8%] hidden h-16 w-16 text-[var(--secondary)]/30 lg:block" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
        <section className="animate-jeevanm-rise flex flex-1 flex-col items-center justify-center px-6 pb-4 pt-14 text-center lg:items-start lg:px-14 lg:pb-16 lg:pt-16 lg:text-left">
          <div className="animate-jeevanm-logo inline-flex">
            <BrandLogo size="xl" priority />
          </div>

          <h1 className="font-display mt-7 text-5xl font-semibold tracking-[0.06em] text-[var(--primary)] sm:text-6xl">
            JEEVAN<span className="text-[var(--gold)]">M</span>
          </h1>

          <div className="login-brand-rule mx-auto mt-4 h-px w-40 lg:mx-0" aria-hidden />

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
            Transforming Habits Into Health
          </p>

          <p className="animate-jeevanm-rise-delay mt-5 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Doctor દ્વારા આપેલ ID અને Password થી login કરો
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 pb-12 pt-2 lg:px-10 lg:py-16">
          <form
            onSubmit={handleSubmit}
            className="animate-jeevanm-rise-delay w-full max-w-md space-y-5 rounded-[1.75rem] border border-[var(--border)]/90 bg-white/85 p-7 shadow-[0_20px_60px_rgba(20,32,26,0.08)] backdrop-blur-md sm:p-8"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Patient access
              </p>
              <p className="mt-1.5 text-sm text-[var(--muted)]">
                તમારું Patient ID અને password દાખલ કરો
              </p>
            </div>

            <Input
              label="Patient ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="PAT123456"
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="pt-1 text-center text-xs leading-relaxed text-[var(--muted)]">
              Login કરીને તમે અમારી{" "}
              <Link
                href="/terms"
                className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
              >
                Terms &amp; Conditions
              </Link>{" "}
              અને{" "}
              <Link
                href="/privacy"
                className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              સાથે સહમત છો.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
