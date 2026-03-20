"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  Download, Eye, ShoppingBag, X, Activity, 
  ChevronRight, Sparkles, Diamond, Search
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { downloadReceipt, generateReceiptNumber, ReceiptData } from "@/lib/receipt";

export default function OrderHistoryPage() {
  const { t } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadOrderHistory = () => {
      if (typeof window !== 'undefined') {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        setOrders(orderHistory);
      }
      setIsLoading(false);
    };
    loadOrderHistory();
  }, []);

  const handleDownloadReceipt = (order: Order) => {
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

  const getStatusNode = (status: string) => {
    const configs: any = {
      pending: { color: 'bg-yellow-500', label: 'Awaiting Authorization' },
      processing: { color: 'bg-blue-500', label: 'Preparing Manifest' },
      shipped: { color: 'bg-purple-500', label: 'Logistics Deployment' },
      delivered: { color: 'bg-green-500', label: 'Mission Accomplished' },
      cancelled: { color: 'bg-red-500', label: 'Manifest Voided' },
    };
    const config = configs[status] || { color: 'bg-black/10', label: status };
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-1.5 h-1.5 rounded-full ${config.color} animate-pulse`} />
        <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{config.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-24 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center">
           <Link href="/profile" className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">
             <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             Return to Profile
           </Link>
           <Link href="/products">
             <Button variant="outline" className="h-10 px-6 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest">
               Execute Acquisition
             </Button>
           </Link>
        </div>

        {/* Hero Node */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
                Manifest <br/> History
              </h1>
              <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.3em] max-w-sm">Chronological record of all acquisitions and logistics missions authorized via OS CARA.</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
              <div className="px-6 py-4 text-center border-r border-black/5">
                <p className="text-2xl font-black text-black">{orders.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Total Manifests</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-2xl font-black text-green-500">${orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(0)}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Capital Allocated</p>
              </div>
           </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-black/5 p-20 text-center space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
             <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center mx-auto text-black/20">
               <Package className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">Vault Empty</h2>
                <p className="text-black/40 text-sm max-w-xs mx-auto">No acquisitions have been recorded under your digital identification node.</p>
             </div>
             <Button asChild className="bg-black text-white px-10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">
               <Link href="/products">Initialize First Acquisition</Link>
             </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Search Protocol */}
            <div className="relative max-w-md">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
               <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Locate manifest by ID or asset name..."
                className="w-full pl-14 pr-6 h-14 bg-white border border-black/5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest focus:ring-0 shadow-sm"
               />
            </div>

            {/* Manifest List */}
            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden group hover:shadow-[0_20px_50px_rgb(0,0,0,0.05)] transition-all duration-700">
                  <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-6 flex-1">
                       <div className="flex flex-wrap items-center gap-4">
                          <span className="text-sm font-black text-black uppercase tracking-tight">#{order.id?.slice(-8).toUpperCase()}</span>
                          {getStatusNode(order.status)}
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="flex -space-x-3">
                             {order.items?.slice(0, 3).map((item, i) => (
                               <div key={i} className="w-16 h-20 bg-black/[0.03] rounded-xl overflow-hidden border-2 border-white shadow-lg relative group/item">
                                 <img src={item.image} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-700" alt="" />
                               </div>
                             ))}
                             {order.items && order.items.length > 3 && (
                               <div className="w-16 h-20 bg-black text-white rounded-xl flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg">
                                  +{order.items.length - 3}
                               </div>
                             )}
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Creation Node: {new Date(order.createdAt as any).toLocaleDateString()}</p>
                             <p className="text-lg font-black text-black uppercase tracking-tight">{order.items?.[0]?.name} {order.items && order.items.length > 1 && `+ ${order.items.length - 1} Assets`}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-6 border-t md:border-t-0 md:border-l border-black/5 pt-8 md:pt-0 md:pl-10">
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Authorized Allocation</p>
                          <p className="text-2xl font-black text-black">${order.total?.toFixed(2)}</p>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          <Link href={`/order-tracking/${order.id}`}>
                            <Button variant="outline" className="h-12 px-6 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest bg-black/[0.01] hover:bg-black hover:text-white transition-all">
                               Track Logic
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => handleDownloadReceipt(order)}
                            className="h-12 px-6 rounded-xl bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-[1.05] transition-all"
                          >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Receipt.pdf
                          </Button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
