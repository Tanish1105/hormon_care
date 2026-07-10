"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

type FullscreenImageProps = {
  src: string;
  alt?: string;
  className?: string;
  protected?: boolean;
};

export function FullscreenImage({ src, alt = "", className, protected: isProtected = false }: FullscreenImageProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const popup =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Image preview"}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md hover:bg-white/25 sm:right-5 sm:top-5"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative max-h-[90dvh] max-w-[95vw] overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="block max-h-[90dvh] max-w-[95vw] object-contain select-none"
                draggable={false}
                onContextMenu={isProtected ? (e) => e.preventDefault() : undefined}
              />
            </div>

            <p className="pointer-events-none absolute bottom-5 text-center text-xs text-white/70">
              બંધ કરવા બહાર tap કરો
            </p>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-zoom-in text-left"
        aria-label="Image popup ma jovo"
        onContextMenu={isProtected ? (e) => e.preventDefault() : undefined}
      >
        <img src={src} alt={alt} className={cn(className, isProtected && "select-none pointer-events-none")} draggable={false} />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white opacity-80 backdrop-blur-sm">
          <ZoomIn className="h-3 w-3" />
          View
        </span>
      </button>
      {popup}
    </>
  );
}
