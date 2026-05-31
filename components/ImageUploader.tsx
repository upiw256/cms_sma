"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImageBase64 } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Gambar Banner" }: ImageUploaderProps) {
  const [mode, setMode] = useState<"url" | "upload">(value && !value.startsWith("/uploads") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP, dll).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const res = await uploadImageBase64(base64);
        if (res.success && res.url) {
          onChange(res.url);
        } else {
          setError(res.message || "Gagal mengunggah gambar.");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Terjadi kesalahan saat mengunggah.");
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            mode === "upload"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            mode === "url"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> URL Gambar
        </button>
      </div>

      {/* URL mode */}
      {mode === "url" && (
        <Input
          placeholder="https://images.unsplash.com/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <>
          {value ? (
            // Preview
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-44">
              <img src={value} alt="preview banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Ganti
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearImage}
                  className="text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" /> Hapus
                </Button>
              </div>
            </div>
          ) : (
            // Drop zone
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm font-medium">Mengunggah...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400 select-none">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Klik atau drag & drop gambar
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — Maks. 5MB</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {/* Preview for URL mode */}
      {mode === "url" && value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-36">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
