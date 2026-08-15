"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";

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
      <div className="rounded-[1.75rem] border border-[var(--border)]/90 bg-white/90 p-7 text-center shadow-[0_12px_36px_rgba(20,32,26,0.05)] sm:p-8">
        <p className="text-lg font-semibold text-[var(--primary)]">{copy.success}</p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--primary)] hover:underline"
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
      className="space-y-4 rounded-[1.75rem] border border-[var(--border)]/90 bg-white/90 p-6 shadow-[0_12px_36px_rgba(20,32,26,0.05)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={copy.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label={copy.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={`${copy.email} (${copy.emailOptional})`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Select label={copy.interest} value={interest} onChange={(e) => setInterest(e.target.value)}>
          {copy.interests.map((option) => (
            <option key={option.value || "general"} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label={copy.message}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        required
      />
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
      ) : null}
      <Button type="submit" className="w-full py-3.5 text-base sm:w-auto" disabled={loading}>
        {loading ? copy.sending : copy.submit}
      </Button>
    </form>
  );
}
