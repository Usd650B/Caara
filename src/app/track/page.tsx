"use client"

import { useState } from "react";
import { 
  MessageCircle, Phone, ArrowLeft, ShieldCheck, 
  Sparkles, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/lib/settings";
import WhatsAppButton from "@/components/ui/whatsapp-button";

export default function TrackOrderPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-32 px-6">
      <WhatsAppButton />
      
      <div className="w-full max-w-xl animate-fade-up">
        {/* Navigation */}
        <div className="mb-16 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-all">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t("Return to Store")}
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-300">
             <ShieldCheck size={14} /> Encrypted Session
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Order Concierge</h4>
             <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Track your <span className="luxury-italic">Journey</span></h1>
             <p className="text-zinc-500 text-lg leading-relaxed max-w-md">Our team is ready to provide live updates on your order. Connect with us for instant assistance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <a 
                href="https://wa.me/255749097220?text=Hello%2C%20I%27d%20like%20to%20track%20my%20order.%20" 
                className="group flex flex-col gap-8 p-10 bg-zinc-50 rounded-[40px] hover:bg-black transition-all duration-500 overflow-hidden relative"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                   <MessageCircle size={24} className="text-black" />
                </div>
                <div>
                   <h3 className="text-xl font-bold mb-1 group-hover:text-white transition-colors">WhatsApp Live</h3>
                   <p className="text-zinc-400 text-xs group-hover:text-zinc-500 transition-colors">Real-time status updates</p>
                </div>
                <ArrowRight className="absolute top-10 right-10 text-zinc-200 group-hover:text-white group-hover:translate-x-2 transition-all" size={20} />
             </a>

             <a 
                href="sms:+255749097220?body=Hello%2C%20I%27d%20like%20to%20track%20my%20order." 
                className="group flex flex-col gap-8 p-10 bg-zinc-50 rounded-[40px] hover:bg-black transition-all duration-500 overflow-hidden relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                   <Phone size={24} className="text-black" />
                </div>
                <div>
                   <h3 className="text-xl font-bold mb-1 group-hover:text-white transition-colors">SMS Tracking</h3>
                   <p className="text-zinc-400 text-xs group-hover:text-zinc-500 transition-colors">Direct message concierge</p>
                </div>
                <ArrowRight className="absolute top-10 right-10 text-zinc-200 group-hover:text-white group-hover:translate-x-2 transition-all" size={20} />
             </a>
          </div>

          {/* Security Notice */}
          <div className="bg-zinc-50 p-8 rounded-[32px] flex items-start gap-6 border border-zinc-100">
             <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <ShieldCheck size={20} className="text-zinc-300" />
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">Privacy First</span>
                <p className="text-zinc-500 text-xs leading-relaxed">
                   To protect your privacy, never share order IDs or screenshots in public social media comments. Our official support is only available via the channels above.
                </p>
             </div>
          </div>

          <div className="pt-24 pb-12 flex flex-col gap-4 text-center">
             <div className="flex items-center justify-center gap-3">
                <Sparkles size={16} className="text-zinc-200" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300">SheDoo Logistics • Premium Global Service</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
