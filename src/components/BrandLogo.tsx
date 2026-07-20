import Image from "next/image";
import { cn } from "@/lib/utils";

/** Cache-bust when logo asset is regenerated */
export const BRAND_LOGO_SRC = "/hormon-care-logo.png?v=6";

const SIZES = {
  xs: { width: 36, height: 36, className: "h-9 w-9" },
  sm: { width: 44, height: 44, className: "h-11 w-11" },
  md: { width: 56, height: 56, className: "h-14 w-14" },
  lg: { width: 160, height: 160, className: "h-40 w-40" },
  xl: { width: 220, height: 220, className: "h-52 w-52" },
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
  /** When true, show only the mark without extra frame chrome */
  plain?: boolean;
};

export function BrandLogo({
  size = "sm",
  className,
  priority,
  plain,
}: BrandLogoProps) {
  const dim = SIZES[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white",
        plain ? "rounded-lg" : "rounded-full ring-1 ring-slate-200/80 shadow-sm",
        dim.className,
        className
      )}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt="Hormone care"
        width={dim.width}
        height={dim.height}
        priority={priority}
        unoptimized
        className="h-full w-full object-contain bg-white"
      />
    </span>
  );
}

/** Horizontal brand lockup for headers: logo + optional subtitle */
export function BrandMark({
  subtitle,
  size = "sm",
  className,
}: {
  subtitle?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandLogo size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold leading-tight text-slate-900 sm:text-base">
          Hormone care
        </span>
        {subtitle ? (
          <span className="block text-[10px] leading-tight text-slate-500 sm:text-xs">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
