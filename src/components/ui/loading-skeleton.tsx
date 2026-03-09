import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button";
}

export function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("animate-pulse rounded-lg border", className)}>
        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("animate-pulse rounded-full bg-gray-200", className)}></div>
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("animate-pulse rounded-md bg-gray-200 h-10 w-20", className)}></div>
    );
  }

  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)}></div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-black h-8 w-8", className)}></div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
