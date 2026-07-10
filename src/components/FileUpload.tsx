"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  label: string;
  accept: "image" | "video";
  value?: string;
  onChange: (url: string) => void;
  className?: string;
};

export function FileUpload({ label, accept, value, onChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const acceptTypes =
    accept === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", accept);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {value ? (
        <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-2">
          {accept === "image" ? (
            <img src={value} alt="Uploaded" className="max-h-40 rounded object-contain" />
          ) : (
            <video src={value} controls className="max-h-40 w-full rounded" />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 transition hover:border-pink-300 hover:bg-pink-50/50"
        >
          {uploading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-5 w-5" /> Click to upload {accept}</>
          )}
        </button>
      )}

      <input ref={inputRef} type="file" accept={acceptTypes} onChange={handleFile} className="hidden" />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
