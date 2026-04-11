"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Package, ArrowRight, ShieldCheck, 
  Activity, Globe, Lock, ChevronRight, Sparkles, MessageCircle, Phone, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrder } from "@/lib/firestore";
import Link from "next/link";
import { useSettings } from "@/lib/settings";

export default function TrackOrderPage() {
  const { t } = useSettings();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Please enter your Manifest Identifier");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const order = await getOrder(orderId.trim());
      if (!order) {
        setError("Manifest not located. Please verify your ID and try again.");
      } else {
        router.push(`/order-tracking/${orderId.trim()}`);
      }
    } catch (err) {
      setError("An error occurred during manifest retrieval.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden relative">
      {/* 🎭 Artistic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse" style={{ background: 'var(--brand-primary-50)' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse" style={{ background: 'var(--brand-accent-50)' }}></div>

      <div className="w-full max-w-[480px] relative">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <Link href="/" className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-all">
            <div className="p-1.5 rounded-full bg-white border border-gray-100 group-hover:bg-gray-50">
              <ArrowLeft className="h-3 w-3" />
            </div>
            {t("Return to Store")}
          </Link>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-black text-gray-300">
            <ShieldCheck className="h-3 w-3" /> SSL SECURE
          </div>
        </div>

        {/* 📦 Main Tracking Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden animate-in zoom-in-95 fade-in duration-700">
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[var(--brand-primary)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--brand-primary)]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[var(--brand-dark)] mb-2 tracking-tight">
              Direct <span className="text-[var(--brand-primary)]">Tracking</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Connect with our team to locate your manifest instantly.</p>
          </div>

          <div className="space-y-6">
            {/* 🛡️ SECURITY PRECAUTION */}
            <div className="p-5 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Security Precaution</p>
                <p className="text-[11px] text-red-700/80 leading-relaxed font-bold">
                  Never share your order details on social media comments. Only contact us via the official channels on this page.
                </p>
              </div>
            </div>

            {/* 📋 INSTRUCTIONS */}
            <div className="p-6 bg-[var(--brand-primary-50)] rounded-[2rem] border-2 border-transparent hover:border-[var(--brand-primary)]/20 transition-all">
              <p className="text-[12px] font-black text-[var(--brand-primary)] uppercase tracking-widest mb-4 text-center">Process</p>
              <div className="flex items-center gap-4 text-sm font-bold text-[var(--brand-dark)]">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs shrink-0 shadow-sm">1</div>
                <p>Click "Track on WhatsApp" below</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-[var(--brand-dark)] mt-4">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs shrink-0 shadow-sm">2</div>
                <p>Send a photo or screenshot of your receipt</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <a 
                href="https://wa.me/255749097220?text=Hello%2C%20I%27d%20like%20to%20track%20my%20order.%20I%20have%20my%20receipt%20ready." 
                className="w-full h-16 bg-[#25D366] text-white hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-6 w-6" />
                Track on WhatsApp
              </a>

              <a 
                href="sms:+255749097220?body=Hello%2C%20I%27d%20like%20to%20track%20my%20order." 
                className="btn-secondary w-full h-16 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 group"
              >
                <Phone className="h-6 w-6" />
                Track via SMS
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 slide-in-from-bottom-2">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">SheDoo Logistics • Mbezi Mwisho HQ</p>
        </div>
      </div>
    </div>
  );
}
