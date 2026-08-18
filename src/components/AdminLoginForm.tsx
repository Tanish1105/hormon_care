"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Input } from "@/components/ui";

export function AdminLoginForm() {
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
      const res = await fetch("/api/auth/admin/login", {
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

      window.location.href = data.panel || "/admin";
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
    <div className="login-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="login-orb login-orb--green" aria-hidden />
      <div className="login-orb login-orb--gold" aria-hidden />
      <div className="login-orb login-orb--soft" aria-hidden />

      <div className="animate-jeevanm-rise relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="animate-jeevanm-logo mx-auto inline-flex">
            <BrandLogo size="lg" priority />
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold tracking-[0.06em] text-[var(--primary)]">
            JEEVAN<span className="text-[var(--gold)]">M</span>
          </h1>
          <div className="login-brand-rule mx-auto mt-3 h-px w-32" aria-hidden />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
            Clinic login
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">Admin, doctor, staff & dietitian</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Role badalva pehla Logout karo, pachhi bijo username thi login karo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-jeevanm-rise-delay space-y-4 rounded-[1.75rem] border border-[var(--border)]/90 bg-white/85 p-7 shadow-[0_20px_60px_rgba(20,32,26,0.08)] backdrop-blur-md sm:p-8"
        >
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        </form>
      </div>
    </div>
  );
}
