"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type FullscreenVideoProps = {
  src: string;
  className?: string;
  title?: string;
  protected?: boolean;
};

export function FullscreenVideo({ src, className, title = "Video", protected: isProtected = false }: FullscreenVideoProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popupVideoRef = useRef<HTMLVideoElement>(null);

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

    const timer = setTimeout(() => {
      popupVideoRef.current?.play().catch(() => {});
    }, 100);

    return () => {
      clearTimeout(timer);
      popupVideoRef.current?.pause();
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
            aria-label={title}
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
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={popupVideoRef}
                src={src}
                controls
                playsInline
                controlsList={isProtected ? "nodownload noplaybackrate" : undefined}
                disablePictureInPicture={isProtected}
                className="block max-h-[85dvh] w-full select-none"
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
        className="group relative block w-full text-left"
        aria-label="Video fullscreen ma jovo"
        onContextMenu={isProtected ? (e) => e.preventDefault() : undefined}
      >
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          className={cn(className, isProtected && "select-none pointer-events-none")}
          draggable={false}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <Play className="ml-0.5 h-6 w-6" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white opacity-80 backdrop-blur-sm">
          <Maximize2 className="h-3 w-3" />
          Fullscreen
        </span>
      </button>
      {popup}
    </>
  );
}
