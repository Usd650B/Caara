"use client"

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  MapPin, Download, ShoppingBag, Activity, 
  ShieldCheck, Mail, Phone, Send,
  AlertTriangle, Star, Check, MessageCircle, X, ArrowRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { getOrder, updateOrder, addNotification, Order, OrderMessage } from "@/lib/firestore";
import { downloadReceipt, generateReceiptNumber, ReceiptData } from "@/lib/receipt";
import { useSettings } from "@/lib/settings";

export default function OrderTrackingPage() {
  const { formatPrice, t } = useSettings();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productImages, setProductImages] = useState<{ [productId: string]: string }>({});
  
  const [isMarkingReceived, setIsMarkingReceived] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Chat state
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const saveOrderToHistory = (order: Order) => {
    if (typeof window !== 'undefined') {
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const existingIndex = orderHistory.findIndex((o: Order) => o.id === order.id);
      if (existingIndex >= 0) orderHistory[existingIndex] = order;
      else orderHistory.unshift(order);
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
      const foundOrder = await getOrder(orderId);
      setOrder(foundOrder || null);
      if (foundOrder) saveOrderToHistory(foundOrder);
      
      if (foundOrder && foundOrder.items) {
        const { getProducts } = await import("@/lib/firestore");
        const products = await getProducts();
        const images: { [productId: string]: string } = {};
        foundOrder.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          images[item.productId] = prod?.image || item.image || "";
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

  // Auto-refresh order every 30 seconds for real-time messages
  useEffect(() => {
    if (!params.id) return;
    const interval = setInterval(() => {
      loadOrder(params.id as string);
    }, 30000);
    return () => clearInterval(interval);
  }, [params.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.messages]);

  const handleConfirmReceipt = async () => {
    if (!order?.id) return;
    setIsMarkingReceived(true);
    try {
      await updateOrder(order.id, { isReceivedConfirmed: true });
      await addNotification({
        type: 'confirmation', title: 'Order Delivered',
        message: `${order.customerName} has confirmed delivery of Order #${order.id?.slice(-8).toUpperCase()}`,
        relatedId: order.id, customerName: order.customerName
      });
      setOrder({ ...order, status: 'delivered', isReceivedConfirmed: true });
    } catch (err) {
      console.error(err);
      alert('Failed to update. Try again.');
    }
    setIsMarkingReceived(false);
  };

  const handleSubmitDispute = async () => {
    if (!order?.id || !disputeReason) return;
    setIsSubmittingDispute(true);
    try {
      await updateOrder(order.id, { disputeStatus: 'open', disputeReason });
      await addNotification({
        type: 'dispute', title: 'Dispute Opened',
        message: `${order.customerName} opened a dispute on Order #${order.id?.slice(-8).toUpperCase()}`,
        relatedId: order.id, customerName: order.customerName
      });
      setOrder({ ...order, disputeStatus: 'open', disputeReason });
      setShowDisputeModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit dispute.');
    }
    setIsSubmittingDispute(false);
  };

  const handleSubmitReview = async () => {
    if (!order?.id) return;
    setIsSubmittingReview(true);
    try {
      await updateOrder(order.id, { rating, review });
      await addNotification({
        type: 'review', title: 'Product Review',
        message: `${order.customerName} left a ${rating}-star review for Order #${order.id?.slice(-8).toUpperCase()}`,
        relatedId: order.id, customerName: order.customerName
      });
      setOrder({ ...order, rating, review });
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    }
    setIsSubmittingReview(false);
  };

  const handleSendMessage = async () => {
    if (!order?.id || !newMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      const msg: OrderMessage = {
        sender: 'buyer',
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      const existingMessages = order.messages || [];
      const updatedMessages = [...existingMessages, msg];
      await updateOrder(order.id, { messages: updatedMessages });
      await addNotification({
        type: 'order', title: 'New Message',
        message: `${order.customerName} sent a message on Order #${order.id?.slice(-8).toUpperCase()}`,
        relatedId: order.id, customerName: order.customerName
      });
      setOrder({ ...order, messages: updatedMessages });
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
    setIsSendingMessage(false);
  };

  const steps = [
    { key: 'pending', label: 'Placed', icon: Activity },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getActiveStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900" />
          <p className="text-xs text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-7 w-7 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold mb-1">Order Not Found</h1>
        <p className="text-sm text-gray-400 mb-6">This order doesn't exist or has been removed.</p>
        <Link href="/track">
          <Button className="bg-black text-white h-10 px-6 rounded-xl text-sm font-semibold">Return to Tracker</Button>
        </Link>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(order.status);
  const showReceiveButton = (order.status === 'shipped' || order.status === 'processing' || order.status === 'delivered') && !order.isReceivedConfirmed;
  const messages = order.messages || [];
  const orderDate = order.createdAt ? new Date((order.createdAt as any).seconds * 1000) : new Date();

  return (
    <div className="min-h-screen bg-brand-muted/30 pb-20">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/track" className="p-3 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent hover:border-zinc-100 group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 font-outfit mb-1">Acquisition Details</p>
              <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
                Order <span className="text-brand-accent">#{order.id?.slice(-8).toUpperCase()}</span>
              </h1>
            </div>
          </div>
          <button onClick={handleDownloadReceipt} className="btn btn-ghost h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-zinc-100 hover:border-black transition-all">
            <Download className="h-3.5 w-3.5" /> Export Receipt
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-fade-up">
        
        {/* Status Master Card */}
        <div className="bg-white rounded-[40px] border border-zinc-100 p-10 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 relative z-10">
            <div>
               <h2 className="text-3xl font-bold tracking-tight mb-2">Track your <span className="luxury-italic">Journey</span></h2>
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-brand-accent animate-pulse'}`} />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">{order.status}</span>
                 <span className="text-zinc-200">|</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Initialized {orderDate.toLocaleDateString()}</span>
               </div>
            </div>
            {order.status === 'cancelled' && (
              <div className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
                <AlertTriangle size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Order Cancelled</span>
              </div>
            )}
          </div>

          {/* Luxury Stepper */}
          <div className="flex items-center gap-0 relative z-10 px-4">
            {steps.map((step, i) => {
              const isCompleted = i <= activeIndex;
              const isActive = i === activeIndex;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center group/step">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-700 ${
                      isCompleted ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-200'
                    } ${isActive ? 'ring-4 ring-brand-accent/20 scale-110 shadow-lg' : ''}`}>
                      {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" strokeWidth={1.5} />}
                    </div>
                    <span className={`text-[9px] mt-4 font-bold uppercase tracking-[0.2em] transition-colors ${isCompleted ? 'text-black' : 'text-zinc-300'}`}>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 px-4">
                       <div className={`h-[2px] rounded-full transition-all duration-1000 ${i < activeIndex ? 'bg-black' : 'bg-zinc-100'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column — Detailed Intelligence */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Manifest */}
            <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Order Manifest</h2>
                <span className="px-4 py-1.5 rounded-full bg-white text-[9px] font-bold uppercase tracking-widest border border-zinc-100">{order.items.length} Units</span>
              </div>
              <div className="divide-y divide-zinc-50">
                {order.items.map((item, i) => (
                  <div key={i} className="px-8 py-5 flex items-center gap-6 group hover:bg-zinc-50/50 transition-colors">
                    <div className="w-16 h-20 bg-zinc-50 rounded-2xl overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-500">
                      <img src={productImages[item.productId] || item.image || ""} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{item.name}</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{item.color}</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-200" />
                         <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Size {item.size}</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-200" />
                         <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Qty {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="px-8 py-6 bg-zinc-900 text-white flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Total Valuation</span>
                <span className="text-xl font-bold tracking-tight">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Destination */}
            <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm group">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">Delivery Destination</h2>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 group-hover:bg-black group-hover:text-white transition-all duration-500">
                   <MapPin className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-black text-lg mb-2">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="text-zinc-500 font-medium leading-relaxed mb-4">{order.shippingAddress.address}, {order.shippingAddress.city}<br />{order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <div className="flex items-center gap-4">
                     <a href={`tel:${order.shippingAddress.phone}`} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:text-brand-accent transition-colors">
                        <Phone size={12} /> {order.shippingAddress.phone}
                     </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Acquisition Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.isReceivedConfirmed ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Delivered</p>
                     <p className="text-xs font-medium text-emerald-800">You've confirmed receipt of this order.</p>
                  </div>
                </div>
              ) : (
                <button onClick={handleConfirmReceipt} disabled={!showReceiveButton || isMarkingReceived}
                  className="bg-black text-white h-24 rounded-3xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 flex flex-col items-center justify-center gap-2">
                  {isMarkingReceived ? "Processing..." : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Receipt
                    </>
                  )}
                </button>
              )}

              {!order.rating ? (
                <button onClick={() => setShowReviewModal(true)} disabled={!order.isReceivedConfirmed}
                  className="bg-white border border-zinc-100 text-black h-24 rounded-3xl text-xs font-bold uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 flex flex-col items-center justify-center gap-2">
                   <Star size={20} className="text-brand-secondary" />
                   Leave Review
                </button>
              ) : (
                <div className="bg-brand-secondary/10 border border-brand-secondary/20 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary text-white flex items-center justify-center">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">{order.rating}/5 Experience</p>
                     <p className="text-xs font-medium text-brand-secondary/80">Thank you for your feedback.</p>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => setShowDisputeModal(true)} disabled={order.disputeStatus === 'open'}
              className="w-full h-16 border border-red-50 text-red-500 rounded-3xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3">
              <AlertTriangle size={14} /> 
              {order.disputeStatus === 'open' ? 'Dispute Under Review' : 'Report an Issue with this Order'}
            </button>
          </div>

          {/* Right Column — Concierge Chat */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-white rounded-[40px] border border-zinc-100 overflow-hidden flex flex-col shadow-soft h-[640px]">
              {/* Chat Header */}
              <div className="px-8 py-6 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/30">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                   <MessageCircle size={20} />
                </div>
                <div>
                   <h2 className="text-[11px] font-bold uppercase tracking-widest text-black">Order Concierge</h2>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Priority Line</span>
                   </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
                <div className="text-center">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-300 bg-zinc-50 px-4 py-1.5 rounded-full">
                    Established {orderDate.toLocaleDateString()}
                  </span>
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-12 px-8">
                    <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6">
                       <Sparkles className="text-zinc-200" size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Direct Channel</p>
                    <p className="text-[10px] text-zinc-300 leading-relaxed uppercase tracking-widest">Connect with our artisanal team regarding your selection.</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isBuyer = msg.sender === 'buyer';
                  const time = new Date(msg.timestamp);
                  return (
                    <div key={i} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                      <div className={`max-w-[85%] ${isBuyer ? 'order-2' : ''}`}>
                        <div className={`px-5 py-4 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm ${
                          isBuyer
                            ? 'bg-black text-white rounded-br-none'
                            : 'bg-zinc-50 text-zinc-900 rounded-bl-none border border-zinc-100'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-3 mt-3 ${isBuyer ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            {isBuyer ? 'Owner' : 'SheDoo'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-200" />
                          <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-zinc-50 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message concierge..."
                    className="w-full h-14 pl-6 pr-16 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-brand-accent transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed shrink-0 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="mt-4 flex items-center justify-center gap-6">
                   <a href={`https://wa.me/255749097220?text=Order%20Help%20%23${order.id?.slice(-8).toUpperCase()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors">
                      <MessageCircle size={12} /> WhatsApp
                   </a>
                   <span className="w-1 h-1 rounded-full bg-zinc-200" />
                   <a href={`tel:+255749097220`} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                      <Phone size={12} /> Call Direct
                   </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-1">Report an Issue</h2>
            <p className="text-xs text-gray-500 mb-4">Describe what went wrong with your order.</p>
            <textarea
              className="w-full h-28 p-3 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:outline-none resize-none mb-4"
              placeholder="E.g. Wrong item received, missing parts..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowDisputeModal(false)} variant="outline" className="flex-1 rounded-xl h-10 text-sm font-semibold">Cancel</Button>
              <Button onClick={handleSubmitDispute} disabled={!disputeReason || isSubmittingDispute}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 text-sm font-semibold">
                {isSubmittingDispute ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
            <h2 className="text-lg font-bold mb-1">Rate Your Experience</h2>
            <p className="text-xs text-gray-500 mb-5">How was the product and service?</p>
            <div className="flex justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-0.5">
                  <Star className={`h-8 w-8 transition-all hover:scale-110 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full h-20 p-3 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:outline-none resize-none mb-4 text-left"
              placeholder="Leave a comment (optional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowReviewModal(false)} variant="outline" className="flex-1 rounded-xl h-10 text-sm font-semibold">Later</Button>
              <Button onClick={handleSubmitReview} disabled={isSubmittingReview}
                className="flex-1 bg-black text-white hover:bg-gray-800 rounded-xl h-10 text-sm font-semibold">
                {isSubmittingReview ? "Saving..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
