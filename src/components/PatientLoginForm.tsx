"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Input } from "@/components/ui";

export function PatientLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/patient/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    window.location.href = "/patient";
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#faf6f3] p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(190,24,93,0.14),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(251,146,60,0.12),_transparent_45%)]"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#eadfd6] bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="bg-[linear-gradient(160deg,#fff1f5_0%,#ffffff_60%,#fff7ed_100%)] px-6 pb-2 pt-8 text-center">
          <BrandLogo size="xl" className="mx-auto" priority />
          <p className="mt-4 text-sm text-slate-500">
            Doctor દ્વારા આપેલ ID અને Password થી login કરો
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <Input
            label="Patient ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="PAT123456"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full rounded-xl py-3 font-semibold shadow-sm shadow-pink-600/20"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="border-t border-[#f0e8e1] px-6 py-4 text-center text-xs leading-relaxed text-slate-500">
          Login કરીને તમે અમારી{" "}
          <Link href="/terms" className="font-medium text-pink-700 underline-offset-2 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          અને{" "}
          <Link
            href="/privacy"
            className="font-medium text-pink-700 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          સાથે સહમત છો.
        </div>
      </div>
    </div>
  );
}
