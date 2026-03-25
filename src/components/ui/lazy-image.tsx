"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  containerClassName,
  aspectRatio = "aspect-[4/5]" 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset loaded state when source changes
    setIsLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-gray-50", aspectRatio, containerClassName)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-black/[0.02]" />
      )}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
