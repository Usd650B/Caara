"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { signInWithGoogle, isCustomerAuthenticated } from "@/lib/customer-auth";

export function GoogleOneTapPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only show if not authenticated and not dismissed
    const checkAuthStatus = () => {
      const dismissed = localStorage.getItem("googleOneTapDismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
        return;
      }
      
      const isAuthenticated = isCustomerAuthenticated();
      if (!isAuthenticated) {
        // Delay showing popup by 3 seconds for better UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkAuthStatus();

    // Listen for auth changes to hide if they log in via other means
    const handleAuthChange = () => {
      if (isCustomerAuthenticated()) {
        setIsVisible(false);
      }
    };
    window.addEventListener("customer-auth-changed", handleAuthChange);
    return () => window.removeEventListener("customer-auth-changed", handleAuthChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("googleOneTapDismissed", "true");
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      setIsVisible(false);
    }
    setIsLoading(false);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-[360px] md:max-w-sm animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-5 pr-10 relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Logo/Icon */}
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-100">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight mb-1">
              Sign in to Caara
            </h3>
            <p className="text-[13px] text-gray-500 leading-snug mb-4">
              Use your Google account to track orders and save favorites.
            </p>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <svg viewBox="0 0 24 24" className="w-4 h-4 bg-white rounded-full p-0.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
