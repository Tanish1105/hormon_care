"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type InquiryFormCopy = {
  name: string;
  phone: string;
  email: string;
  emailOptional: string;
  interest: string;
  message: string;
  submit: string;
  sending: string;
  success: string;
  another: string;
  error: string;
  interests: { value: string; label: string }[];
};

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
        <Icon className="h-3.5 w-3.5 text-[var(--secondary)]" aria-hidden />
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-mist)]/80 px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary-light)]";

export function InquiryForm({ copy }: { copy: InquiryFormCopy }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, interest, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : copy.error);
        return;
      }
      setDone(true);
      setName("");
      setPhone("");
      setEmail("");
      setInterest("");
      setMessage("");
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white px-6 py-14 text-center shadow-[0_20px_50px_rgba(31,107,69,0.1)] sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(31,107,69,0.12),transparent_55%)]"
          aria-hidden
        />
        <CheckCircle2 className="relative mx-auto h-14 w-14 text-[var(--primary)]" aria-hidden />
        <p className="font-display relative mt-5 text-2xl font-semibold text-[var(--primary)]">
          {copy.success}
        </p>
        <button
          type="button"
          className="relative mt-6 inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-light)]"
          onClick={() => setDone(false)}
        >
          {copy.another}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-[0_20px_50px_rgba(31,107,69,0.08)] backdrop-blur-md sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.16),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(31,107,69,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.name} icon={User}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className={fieldClass}
            />
          </Field>
          <Field label={copy.phone} icon={Phone}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              required
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label={`${copy.email} (${copy.emailOptional})`} icon={Mail}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={fieldClass}
          />
        </Field>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            <SparkleMark />
            {copy.interest}
          </p>
          <div className="flex flex-wrap gap-2">
            {copy.interests.map((option) => {
              const selected = interest === option.value;
              return (
                <button
                  key={option.value || "general"}
                  type="button"
                  onClick={() => setInterest(option.value)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition",
                    selected
                      ? "bg-[var(--primary)] text-white shadow-sm shadow-[rgba(31,107,69,0.25)]"
                      : "border border-[var(--border)] bg-[var(--surface-mist)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-white"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label={copy.message} icon={MessageSquare}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            className={cn(fieldClass, "resize-none")}
          />
        </Field>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_12px_28px_rgba(31,107,69,0.28)] transition hover:bg-[#185738] disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
        >
          <Send className="h-4 w-4" aria-hidden />
          {loading ? copy.sending : copy.submit}
        </button>
      </div>
    </form>
  );
}

function SparkleMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[var(--secondary)]" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1.2 9.1 6 14 7.2 9.1 8.4 8 13.2 6.9 8.4 2 7.2 6.9 6z"
      />
    </svg>
  );
}
