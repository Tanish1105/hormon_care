import Image from "next/image";
import { cn } from "@/lib/utils";

/** Cache-bust when logo asset is regenerated */
export const BRAND_LOGO_SRC = "/jeevanm.png?v=2";

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
        plain
          ? "rounded-xl"
          : "rounded-full ring-1 ring-[rgba(31,107,69,0.18)] shadow-[0_8px_24px_rgba(31,107,69,0.12)]",
        dim.className,
        className
      )}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt="JEEVANM"
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
        <span className="font-display block truncate text-base font-semibold leading-tight tracking-wide text-[var(--primary)] sm:text-lg">
          JEEVANM
        </span>
        <span className="mt-0.5 block truncate text-[9px] font-semibold tracking-wide text-[var(--primary)] sm:text-[10px]">
          Transforming Habits Into Health
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
