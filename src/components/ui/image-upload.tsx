"use client"

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "./button";

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

  // Sync preview with prop (Critical for parent-driven state updates)
  useEffect(() => {
    if (currentImage !== undefined) {
      setPreview(currentImage || null);
    }
  }, [currentImage]);

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
        /* ── Compact slot (matching Admin Grid) ── */
        <div className="relative w-full h-full">
           {preview ? (
             <>
               <img src={preview} alt="Upload Preview" className="w-full h-full object-cover transition-opacity duration-300" />
               <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white p-2" title="Change">
                    <Upload className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleRemove} className="text-white p-2" title="Delete">
                    <X className="h-4 w-4" />
                  </button>
               </div>
             </>
           ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 group bg-black/[0.01] hover:bg-black/[0.03] transition-colors"
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
           )}
        </div>
      ) : (
        /* ── Full area (matching Admin Visual Capture) ── */
        <div className="relative aspect-[3/4] w-full border-4 border-dashed border-black/10 rounded-[3rem] bg-black/[0.01] overflow-hidden group hover:border-black/20 transition-all">
          {preview ? (
            <>
              <img src={preview} alt="Capture Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                 <Button type="button" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 bg-white text-black hover:bg-gray-100" onClick={() => fileInputRef.current?.click()}>
                   Authorized Replacement
                 </Button>
                 <Button type="button" variant="destructive" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6" onClick={handleRemove}>
                   Purge Frame
                 </Button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                <div className="w-16 h-16 bg-black/[0.03] rounded-2xl flex items-center justify-center mb-6">
                   <Upload className="h-6 w-6 text-black/20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Visual Signal Required</p>
                <p className="text-[9px] text-black/20 mt-2">Initialize frame capture with a high-resolution beauty asset.</p>
                <Button type="button" className="mt-8 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-black text-white pointer-events-auto shadow-xl" onClick={() => fileInputRef.current?.click()}>
                   {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Capturing...</> : "Initialize Capture"}
                </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
