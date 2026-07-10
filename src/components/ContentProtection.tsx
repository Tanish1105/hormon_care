"use client";

import { useEffect } from "react";

export function ContentProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function blockContextMenu(e: Event) {
      e.preventDefault();
    }

    function blockCopy(e: ClipboardEvent) {
      e.preventDefault();
    }

    function blockKeys(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "u", "s", "p", "a"].includes(key)) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
      }
    }

    function blockDragStart(e: DragEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault();
      }
    }

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("dragstart", blockDragStart);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("dragstart", blockDragStart);
    };
  }, []);

  return <div className="patient-protected">{children}</div>;
}
