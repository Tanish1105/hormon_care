"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2, Play } from "lucide-react";
import { cn, getYoutubeEmbedUrl, getYoutubeVideoId } from "@/lib/utils";
import { buildSecureYoutubeEmbedUrl } from "@/lib/youtube";

type FullscreenYoutubeProps = {
  url?: string;
  contentId?: string;
  source?: "plan" | "garbha" | "child-guidance";
  secure?: boolean;
  title?: string;
  className?: string;
};

export function FullscreenYoutube({
  url,
  contentId,
  source = "plan",
  secure = false,
  title = "YouTube Video",
  className,
}: FullscreenYoutubeProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const embedUrl = !secure && url ? getYoutubeEmbedUrl(url) : null;
  const videoId = !secure && url ? getYoutubeVideoId(url) : null;
  const thumbnail = secure && contentId
    ? `/api/patient/youtube-thumb/${contentId}?source=${source}`
    : videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;

  const popupSrc = secure && contentId
    ? `/api/patient/youtube-embed/${contentId}?source=${source}&autoplay=1`
    : embedUrl
      ? `${buildSecureYoutubeEmbedUrl(videoId!, true)}`
      : null;

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

  if (!secure && !embedUrl) {
    return <p className="mt-3 text-sm text-slate-500">Video ઉપલબ્ધ નથી</p>;
  }

  if (secure && !contentId) {
    return <p className="mt-3 text-sm text-slate-500">Video ઉપલબ્ધ નથી</p>;
  }

  const popup =
    open && mounted && popupSrc
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
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={popupSrc}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
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
        className={cn("relative mt-3 block w-full overflow-hidden rounded-lg text-left", className)}
        aria-label="YouTube video fullscreen ma jovo"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="aspect-video w-full bg-slate-900">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="pointer-events-none h-full w-full object-cover select-none"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-red-600 text-sm font-medium text-white">
              Video
            </div>
          )}
        </div>
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
            <Play className="ml-1 h-7 w-7" />
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
