"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Package, ArrowRight, ShieldCheck, 
  Activity, Globe, Lock, ChevronRight, Sparkles
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
      } else if (email && order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
        setError("Identity mismatch. Security protocol blocked access.");
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
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Architectural Elements */}
      <div className="absolute top-0 right-0 p-24 opacity-[0.02] -mr-20 -mt-20">
        <Globe className="h-96 w-96 rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-[0.02] -ml-20 -mb-20">
        <Activity className="h-80 w-80 -rotate-12" />
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-12">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/20 group translate-y-0 hover:-translate-y-2 transition-transform duration-500">
            <Package className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
               Manifest <br/> Tracking
             </h1>
             <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto">
               Secure real-time synchronization with our worldwide logistics infrastructure.
             </p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-black/5 p-10 md:p-14 shadow-[0_20px_50px_rgb(0,0,0,0.06)] space-y-12">
           <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">Audit Credentials</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 leading-relaxed">Enter your unique manifest identifier to initialize the tracking sequence.</p>
           </div>

           <form onSubmit={handleTrack} className="space-y-10">
              {error && (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-100/50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 px-4">Manifest Identifier</label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/10" />
                    <Input
                      type="text"
                      placeholder="e.g. JX-9-PROTOCOL-X"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-14 h-16 bg-black/[0.01] border-black/5 focus:ring-1 focus:ring-black/10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 px-4">Entity Email (Verification)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/10" />
                    <Input
                      type="email"
                      placeholder="AUTHORIZED-USER@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-14 h-16 bg-black/[0.01] border-black/5 focus:ring-1 focus:ring-black/10 rounded-2xl text-base font-bold uppercase tracking-widest shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/10 hover:shadow-black/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-4 group"
              >
                {isLoading ? "Synchronizing Manifest..." : (
                  <>
                    Initialize Tracking
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
           </form>

           <div className="flex items-center justify-between pt-10 border-t border-black/5">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-black/20">System Online</span>
              </div>
              <div className="flex items-center gap-3">
                 <Lock className="h-3.5 w-3.5 text-black/10" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Authorized Encryption</span>
              </div>
           </div>
        </div>

        <div className="text-center">
           <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors inline-flex items-center group">
              Return to Gallery Profile
              <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>
    </div>
  );
}
