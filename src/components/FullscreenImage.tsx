"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/media-url";

type FullscreenImageProps = {
  src: string;
  alt?: string;
  className?: string;
  protected?: boolean;
};

export function FullscreenImage({
  src,
  alt = "",
  className,
  protected: isProtected = false,
}: FullscreenImageProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const resolvedSrc = resolvePublicMediaUrl(src);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(4, s + 0.25));
      if (e.key === "-") setScale((s) => Math.max(1, s - 0.25));
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

  function touchDistance(touches: React.TouchList) {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

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

            <div className="absolute left-3 top-3 z-10 flex gap-2 sm:left-5 sm:top-5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setScale((s) => Math.max(1, Number((s - 0.25).toFixed(2))));
                  if (scale <= 1.25) setOffset({ x: 0, y: 0 });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                aria-label="Zoom out"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setScale((s) => Math.min(4, Number((s + 0.25).toFixed(2))));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                aria-label="Zoom in"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative flex max-h-[90dvh] max-w-[95vw] items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.15 : 0.15;
                setScale((s) => {
                  const next = Math.min(4, Math.max(1, Number((s + delta).toFixed(2))));
                  if (next <= 1) setOffset({ x: 0, y: 0 });
                  return next;
                });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (scale > 1.05) {
                  setScale(1);
                  setOffset({ x: 0, y: 0 });
                } else {
                  setScale(2.5);
                }
              }}
              onPointerDown={(e) => {
                if (scale <= 1) return;
                dragging.current = true;
                lastPoint.current = { x: e.clientX, y: e.clientY };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!dragging.current || !lastPoint.current || scale <= 1) return;
                const dx = e.clientX - lastPoint.current.x;
                const dy = e.clientY - lastPoint.current.y;
                lastPoint.current = { x: e.clientX, y: e.clientY };
                setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
              }}
              onPointerUp={() => {
                dragging.current = false;
                lastPoint.current = null;
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  pinchStart.current = {
                    dist: touchDistance(e.touches),
                    scale,
                  };
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && pinchStart.current) {
                  e.preventDefault();
                  const dist = touchDistance(e.touches);
                  const ratio = dist / (pinchStart.current.dist || dist);
                  const next = Math.min(
                    4,
                    Math.max(1, Number((pinchStart.current.scale * ratio).toFixed(2)))
                  );
                  setScale(next);
                  if (next <= 1) setOffset({ x: 0, y: 0 });
                }
              }}
              onTouchEnd={() => {
                pinchStart.current = null;
              }}
            >
              <img
                src={resolvedSrc}
                alt={alt}
                className="block max-h-[90dvh] max-w-[95vw] origin-center object-contain select-none touch-none"
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  cursor: scale > 1 ? "grab" : "zoom-in",
                }}
                onContextMenu={isProtected ? (e) => e.preventDefault() : undefined}
              />
            </div>

            <p className="pointer-events-none absolute bottom-5 text-center text-xs text-white/70">
              Pinch / scroll / +/- thi zoom · બહાર tap કરીને બંધ
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
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn(className, isProtected && "select-none pointer-events-none")}
          draggable={false}
        />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white opacity-80 backdrop-blur-sm">
          <ZoomIn className="h-3 w-3" />
          View
        </span>
      </button>
      {popup}
    </>
  );
}
