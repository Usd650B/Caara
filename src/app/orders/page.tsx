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
      pending: { color: 'bg-yellow-500', label: 'Processing' },
      processing: { color: 'bg-blue-500', label: 'Preparing Order' },
      shipped: { color: 'bg-purple-500', label: 'Shipped' },
      delivered: { color: 'bg-green-500', label: 'Delivered' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled' },
    };
    const config = configs[status] || { color: 'bg-black/10', label: status };
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-1.5 h-1.5 rounded-full ${config.color} animate-pulse`} />
        <span className="text-xs font-semibold uppercase tracking-widest text-black/60">{config.label}</span>
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
           <Link href="/profile" className="group inline-flex items-center text-xs font-semibold uppercase tracking-widest text-black/50 hover:text-black transition-colors">
             <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             Return to Profile
           </Link>
           <Link href="/products">
             <Button variant="outline" className="h-10 px-6 rounded-xl border-black/10 font-semibold text-xs transition-all">
               Shop Now
             </Button>
           </Link>
        </div>

        {/* Hero Node */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black">
                Order <br/> History
              </h1>
              <p className="text-black/50 text-sm max-w-sm">Review your past orders and track current shipments.</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
              <div className="px-6 py-4 text-center border-r border-black/5">
                <p className="text-2xl font-bold text-black">{orders.length}</p>
                <p className="text-xs font-semibold text-black/50">Total Orders</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-black">${orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(0)}</p>
                <p className="text-xs font-semibold text-black/50">Total Spent</p>
              </div>
           </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/5 p-16 text-center space-y-6 shadow-sm">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-black/30">
               <Package className="h-8 w-8" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">No Orders Yet</h2>
                <p className="text-black/50 text-sm max-w-xs mx-auto">You haven't placed any orders yet.</p>
             </div>
             <Button asChild className="bg-black text-white px-8 h-12 rounded-xl font-semibold text-sm transition-all mt-4">
               <Link href="/products">Start Shopping</Link>
             </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Search Protocol */}
            <div className="relative max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
               <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by order ID or product name..."
                className="w-full pl-12 pr-6 h-12 bg-white border border-black/10 rounded-xl text-sm focus:ring-1 focus:ring-black shadow-sm"
               />
            </div>

            {/* Manifest List */}
            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                       <div className="flex flex-wrap items-center gap-4">
                          <span className="text-sm font-semibold text-black uppercase tracking-tight">#{order.id?.slice(-8).toUpperCase()}</span>
                          {getStatusNode(order.status)}
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="flex -space-x-3">
                             {order.items?.slice(0, 3).map((item, i) => (
                               <div key={i} className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border-2 border-white shadow-sm relative group/item">
                                 <img src={item.image} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-300" alt="" />
                               </div>
                             ))}
                             {order.items && order.items.length > 3 && (
                               <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                                  +{order.items.length - 3}
                               </div>
                             )}
                          </div>
                          <div className="space-y-1 pt-1">
                             <p className="text-xs font-medium text-black/50">{new Date(order.createdAt as any).toLocaleDateString()}</p>
                             <p className="text-base font-semibold text-black">{order.items?.[0]?.name} {order.items && order.items.length > 1 && `+ ${order.items.length - 1} more`}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-6 border-t md:border-t-0 md:border-l border-black/5 pt-6 md:pt-0 md:pl-8">
                       <div className="text-right">
                          <p className="text-xs font-semibold text-black/50">Total Amount</p>
                          <p className="text-2xl font-bold text-black">${order.total?.toFixed(2)}</p>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          <Link href={`/order-tracking/${order.id}`}>
                            <Button variant="outline" className="h-10 px-4 rounded-xl border-black/10 font-semibold text-xs transition-all hover:bg-black hover:text-white">
                               Track Order
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => handleDownloadReceipt(order)}
                            className="h-10 px-4 rounded-xl bg-black text-white font-semibold text-xs shadow-sm hover:opacity-90 transition-all"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Receipt
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
