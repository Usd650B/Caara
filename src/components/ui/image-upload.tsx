"use client"

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
  /** compact = icon-only slot style (for extra photo grid) */
  compact?: boolean;
}

export function ImageUpload({ onImageUpload, currentImage, className, compact }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    setIsUploading(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      onImageUpload(downloadUrl);
    } catch (err) {
      console.error("Firebase Storage error:", err);
      // fallback: use base64
      const b64Reader = new FileReader();
      b64Reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageUpload(base64);
      };
      b64Reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputId = `image-upload-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload product image"
      />

      {compact ? (
        /* ── Compact slot (for extra photo grid) ── */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 group"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-black/30" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5 text-black/20 group-hover:text-black transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-black/20 group-hover:text-black transition-colors">
                Add Photo
              </span>
            </>
          )}
        </button>
      ) : (
        /* ── Full upload button (for main image area) ── */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-3.5 w-3.5" /> {preview ? "Change Photo" : "Upload Photo"}</>
          )}
        </button>
      )}
    </div>
  );
}
