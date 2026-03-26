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
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group">
            <Package className="h-8 w-8 text-black/50" />
          </div>
          <div className="space-y-3">
             <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black">
               Track <br/> Order
             </h1>
             <p className="text-black/50 text-sm max-w-sm mx-auto">
               Enter your details to track your order.
             </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-black/5 p-8 md:p-12 shadow-sm space-y-8">
           <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-black">Order Details</h2>
              <p className="text-sm font-medium text-black/50 leading-relaxed">Enter your unique order ID to track its status.</p>
           </div>

           <form onSubmit={handleTrack} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-black/50 px-2">Order ID</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/30" />
                    <Input
                      type="text"
                      placeholder="e.g. 12345678"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-12 h-14 bg-white border border-gray-200 focus:border-black rounded-xl text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-black/50 px-2">Email Address</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/30" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-white border border-gray-200 focus:border-black rounded-xl text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-black text-white hover:bg-black/80 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? "Tracking..." : (
                  <>
                    Track Order
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
           </form>

           <div className="flex items-center justify-between pt-8 border-t border-black/5">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-xs font-semibold text-black/40">Secure Connection</span>
              </div>
           </div>
        </div>

        <div className="text-center">
           <Link href="/" className="text-xs font-bold text-black/40 hover:text-black transition-colors inline-flex items-center group">
              Return Home
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>
    </div>
  );
}
