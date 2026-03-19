"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Package, ArrowRight, ShieldCheck } from "lucide-react";
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
      setError("Please enter your Order ID");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Look up and verify the order 
      const order = await getOrder(orderId.trim());
      
      if (!order) {
        setError("Order not found. Please verify your Order ID and try again.");
      } else if (email && order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
        setError("Email does not match this order's records.");
      } else {
        // Success! Redirect to the tracking page
        router.push(`/order-tracking/${orderId.trim()}`);
      }
    } catch (err) {
      setError("An error occurred while looking up your order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            Track Your <span className="gradient-text">Order</span>
          </h1>
          <p className="text-muted-foreground font-light text-lg">
            Never lose sight of your delivery.
          </p>
        </div>

        <Card className="glass rounded-[2rem] border-white/20 shadow-2xl p-2 sm:p-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Order Details</CardTitle>
            <CardDescription className="font-light">Find your Order ID in the confirmation email we sent you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order ID</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="e.g. jx9A2bK..."
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-12 h-14 bg-white/50 border-gray-200 focus:border-black focus:ring-black rounded-xl text-lg font-medium tracking-wider"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address (Optional)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-white/50 border-gray-200 focus:border-black focus:ring-black rounded-xl text-base"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">For extra verification</p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-xl text-base font-bold uppercase tracking-wider shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group"
              >
                {isLoading ? "Locating Order..." : (
                  <>
                    Find My Order
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
