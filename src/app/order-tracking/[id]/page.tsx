"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  MapPin, Download, ShoppingBag, Activity, 
  ChevronRight, Sparkles, Diamond, ShieldCheck,
  Mail, Phone, FileText, Target
} from "lucide-react";
import Link from "next/link";
import { getOrders, Order } from "@/lib/firestore";
import { downloadReceipt, generateReceiptNumber, ReceiptData } from "@/lib/receipt";

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productImages, setProductImages] = useState<{ [productId: string]: string }>({});

  const saveOrderToHistory = (order: Order) => {
    if (typeof window !== 'undefined') {
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const existingIndex = orderHistory.findIndex((o: Order) => o.id === order.id);
      if (existingIndex >= 0) {
        orderHistory[existingIndex] = order;
      } else {
        orderHistory.unshift(order);
      }
      if (orderHistory.length > 10) orderHistory.splice(10);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    const receiptData: ReceiptData = {
      order,
      receiptNumber: generateReceiptNumber(order.id || ''),
      issuedDate: new Date().toLocaleDateString(),
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      total: order.total || 0
    };
    downloadReceipt(receiptData);
  };

  const loadOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orders = await getOrders();
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder || null);
      if (foundOrder) saveOrderToHistory(foundOrder);
      
      if (foundOrder && foundOrder.items) {
        const { getProducts } = await import("@/lib/firestore");
        const products = await getProducts();
        const images: { [productId: string]: string } = {};
        foundOrder.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          images[item.productId] = prod?.image || "";
        });
        setProductImages(images);
      }
    } catch (error) {
       console.error('Error loading order:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (params.id && typeof window !== 'undefined') {
      loadOrder(params.id as string);
    }
  }, [params.id]);

  const steps = [
    { key: 'pending', label: 'Manifest Initialized', icon: Activity },
    { key: 'processing', label: 'Preparing Protocol', icon: Package },
    { key: 'shipped', label: 'Logistics Deployment', icon: Truck },
    { key: 'delivered', label: 'Mission Accomplished', icon: CheckCircle }
  ];

  const getActiveStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6 text-black/20">
          <XCircle />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Manifest Not Found</h1>
        <Button asChild className="mt-8 bg-black text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
           <Link href="/track">Return to Gateway</Link>
        </Button>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <Link href="/track" className="p-3 hover:bg-black/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black/20 mb-1">
               <span>Logistics</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-black">Tracking Stream</span>
             </div>
             <h1 className="text-xl font-black tracking-tighter">Manifest #{order.id?.slice(-8).toUpperCase()}</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
           <Button onClick={handleDownloadReceipt} variant="outline" className="h-11 px-6 border-black/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
             <Download className="h-4 w-4 mr-2 text-black/20" />
             Receipt.pdf
           </Button>
           <Link href="/products">
             <Button className="h-11 px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10">
               New Acquisition
             </Button>
           </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12 space-y-12">
        {/* Visual Pipeline */}
        <div className="bg-white rounded-[3rem] border border-black/5 p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12">
          <div className="flex items-center justify-between">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Deployment Status</h2>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Active Stream</span>
             </div>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/[0.03] -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
              {steps.map((step, i) => {
                const isCompleted = i <= activeIndex;
                const isActive = i === activeIndex;
                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-6 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl ${
                      isCompleted ? 'bg-black text-white' : 'bg-white border border-black/5 text-black/20'
                    } ${isActive ? 'scale-110 shadow-black/20' : ''}`}>
                       <step.icon className="h-6 w-6" />
                    </div>
                    <div className="text-left md:text-center space-y-1">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-black' : 'text-black/30'}`}>{step.label}</p>
                       {isActive && <p className="text-[9px] font-bold text-black/20 uppercase tracking-tighter">Current Node</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Detailed Audit */}
           <div className="lg:col-span-8 space-y-12">
              <section className="space-y-6">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Manifest Contents</h2>
                 <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="divide-y divide-black/5">
                      {order.items.map((item, i) => (
                        <div key={i} className="p-8 flex items-center gap-8 hover:bg-black/[0.01] transition-colors group">
                           <div className="w-24 h-32 bg-black/[0.03] rounded-2xl overflow-hidden shadow-sm">
                             <img src={productImages[item.productId] || ""} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                           </div>
                           <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-start">
                               <h3 className="text-lg font-black text-black uppercase tracking-tight">{item.name}</h3>
                               <span className="text-lg font-black text-black">${(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                             <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-black/30">
                               <span className="bg-black/5 px-3 py-1 rounded-lg">SIZE: {item.size || 'STD'}</span>
                               <span className="bg-black/5 px-3 py-1 rounded-lg">QTY: {item.quantity}</span>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30">Delivery Node</h3>
                       <MapPin className="h-4 w-4 text-black/10" />
                    </div>
                    <div className="space-y-2 font-black text-black text-xl uppercase tracking-tight leading-tight">
                       <p>{order.shippingAddress.address}</p>
                       <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                       <p className="text-sm text-black/40 mt-4">{order.shippingAddress.zipCode}</p>
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30">Protection</h3>
                       <ShieldCheck className="h-4 w-4 text-black/10" />
                    </div>
                    <div className="space-y-4">
                       {[
                         { label: 'Authorized Entity', value: order.customerName },
                         { label: 'Identifier Node', value: order.customerEmail },
                         { label: 'Verified Protocol', value: 'SSL/CARA-SEC-V2' }
                       ].map(item => (
                         <div key={item.label} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                           <p className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-1">{item.label}</p>
                           <p className="text-xs font-bold text-black uppercase tracking-tight truncate">{item.value}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </section>
           </div>

           {/* Quick Actions Deck */}
           <div className="lg:col-span-4 space-y-12">
              <section className="bg-black text-white rounded-[3rem] p-10 shadow-2xl shadow-black/20 flex flex-col justify-between overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                    <Target className="h-40 w-40" />
                 </div>
                 <div className="relative z-10 space-y-8">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Diamond className="h-8 w-8 text-white" />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black tracking-tighter leading-none mb-4">Tactical <br/> Assistance</h3>
                       <p className="text-white/40 text-sm leading-relaxed font-medium">System support node available 24/7 for manifest inquiries or protocol modifications.</p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/10">
                       <Button variant="ghost" className="w-full h-11 justify-start rounded-xl hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest">
                          <Phone className="h-4 w-4 mr-3" /> Connect with Concierge
                       </Button>
                       <Button variant="ghost" className="w-full h-11 justify-start rounded-xl hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest">
                          <Mail className="h-4 w-4 mr-3" /> Emergency Dispatch
                       </Button>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30">Audit Summary</h3>
                    <FileText className="h-4 w-4 text-black/10" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                       <span>Gross Value</span>
                       <span className="text-black">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                       <span>Logistics Node</span>
                       <span className="text-green-500">Authorized ($0.00)</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-black/5">
                       <span className="text-[10px] font-black uppercase tracking-widest">Final Allocation</span>
                       <span className="text-2xl font-black text-black">${order.total.toFixed(2)}</span>
                    </div>
                 </div>
              </section>

              <Link href="/products" className="block">
                <Button className="w-full h-16 rounded-[2rem] bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                  Synchronize New Acquisition
                </Button>
              </Link>
           </div>
        </div>
      </main>
    </div>
  );
}

function XCircle() {
  return <Clock className="h-10 w-10" />;
}
