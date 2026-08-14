"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[#185738] shadow-sm shadow-[rgba(31,107,69,0.22)]",
    secondary:
      "bg-[var(--secondary)] text-white hover:bg-[#9a7424] shadow-sm shadow-[rgba(184,137,45,0.22)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  label,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]/80">{label}</label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
            isPassword && "pr-11",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function Textarea({
  className,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]/80">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]/80">{label}</label>
      )}
      <select
        className={cn(
          "w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(20,32,26,0.05)] sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color?: "pink" | "purple" | "green" | "slate" | "gold";
}) {
  const colors = {
    pink: "bg-[var(--primary-light)] text-[var(--primary)]",
    purple: "bg-[var(--gold-soft)] text-[var(--secondary)]",
    green: "bg-[var(--primary-light)] text-[var(--primary)]",
    gold: "bg-[var(--gold-soft)] text-[var(--secondary)]",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={cn("rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide", colors[color])}>
      {children}
    </span>
  );
}
