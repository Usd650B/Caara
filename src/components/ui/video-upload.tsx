"use client"

import { useState, useRef, useEffect } from "react";
import { Upload, Video, X, Loader2 } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface VideoUploadProps {
  onVideoUpload: (url: string) => void;
  currentVideo?: string;
}

export function VideoUpload({ onVideoUpload, currentVideo }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentVideo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with prop
  useEffect(() => {
    if (currentVideo !== undefined) {
      setPreview(currentVideo || null);
    }
  }, [currentVideo]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file (mp4, mov, webm, etc.)");
      return;
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      alert("Video size should be less than 100MB");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Show local preview while uploading
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const storageRef = ref(storage, `products/videos/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.error("Video upload error:", error);
          // Keep local preview as fallback
          onVideoUpload(localUrl);
          setIsUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPreview(downloadUrl);
          onVideoUpload(downloadUrl);
          setIsUploading(false);
          setProgress(100);
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      onVideoUpload(localUrl);
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setProgress(0);
    onVideoUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload product video"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-black/5 bg-black">
          <video
            src={preview}
            controls
            className="w-full max-h-52 object-contain"
            preload="metadata"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
              <div className="w-40 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white text-xs font-bold">{progress}%</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-black/10 rounded-2xl bg-black/[0.01] hover:bg-black/[0.03] hover:border-black/20 transition-all p-8 flex flex-col items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-black/5 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
              Upload Video
            </p>
            <p className="text-[9px] text-black/20 mt-1">MP4, MOV, WEBM · Max 100MB</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            <Upload className="h-3 w-3" />
            Choose File
          </div>
        </button>
      )}
    </div>
  );
}
