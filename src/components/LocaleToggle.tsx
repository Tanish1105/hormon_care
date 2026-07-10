"use client";

import type { PatientLocale } from "@/lib/patient-locale";
import { cn } from "@/lib/utils";

export function LocaleToggle({
  locale,
  onChange,
  className,
  variant = "light",
}: {
  locale: PatientLocale;
  onChange: (locale: PatientLocale) => void;
  className?: string;
  variant?: "light" | "onDark";
}) {
  const onDark = variant === "onDark";

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5 text-xs",
        onDark ? "border-white/30 bg-white/15 backdrop-blur-sm" : "border-slate-200 bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("en")}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition",
          locale === "en"
            ? onDark
              ? "bg-white text-pink-700"
              : "bg-pink-600 text-white"
            : onDark
              ? "text-white/85 hover:bg-white/10"
              : "text-slate-600 hover:bg-slate-50"
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("gu")}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition",
          locale === "gu"
            ? onDark
              ? "bg-white text-pink-700"
              : "bg-pink-600 text-white"
            : onDark
              ? "text-white/85 hover:bg-white/10"
              : "text-slate-600 hover:bg-slate-50"
        )}
      >
        ગુજરાતી
      </button>
    </div>
  );
}
