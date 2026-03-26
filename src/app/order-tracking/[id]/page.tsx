"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  MapPin, Download, ShoppingBag, Activity, 
  ChevronRight, ShieldCheck, Mail, Phone, FileText, Target,
  AlertTriangle, Star, Check
} from "lucide-react";
import Link from "next/link";
import { getOrders, Order, updateOrder, addNotification } from "@/lib/firestore";
import { downloadReceipt, generateReceiptNumber, ReceiptData } from "@/lib/receipt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productImages, setProductImages] = useState<{ [productId: string]: string }>({});
  
  // UI states
  const [isMarkingReceived, setIsMarkingReceived] = useState(false);
  
  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const handleConfirmReceipt = async () => {
    if (!order?.id) return;
    setIsMarkingReceived(true);
    try {
      await updateOrder(order.id, {
        isReceivedConfirmed: true
      });
      
      // Notify admin
      await addNotification({
        type: 'confirmation',
        title: 'Order Delivered',
        message: `${order.customerName} has confirmed delivery of Order #${order.id?.slice(-8).toUpperCase()}`,
        relatedId: order.id,
        customerName: order.customerName
      });

      setOrder({ ...order, status: 'delivered', isReceivedConfirmed: true });
    } catch (err) {
      console.error(err);
      alert('Failed to update status. Try again later.');
    }
    setIsMarkingReceived(false);
  };

  const handleSubmitDispute = async () => {
    if (!order?.id || !disputeReason) return;
    setIsSubmittingDispute(true);
    try {
      await updateOrder(order.id, {
        disputeStatus: 'open',
        disputeReason
      });
      
      // Notify admin
      await addNotification({
         type: 'dispute',
         title: 'Dispute Opened',
         message: `${order.customerName} opened a dispute on Order #${order.id?.slice(-8).toUpperCase()}`,
         relatedId: order.id,
         customerName: order.customerName
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
      await updateOrder(order.id, {
        rating,
        review
      });

      // Notify admin
      await addNotification({
         type: 'review',
         title: 'Product Review',
         message: `${order.customerName} left a ${rating}-star review for Order #${order.id?.slice(-8).toUpperCase()}`,
         relatedId: order.id,
         customerName: order.customerName
      });

      setOrder({ ...order, rating, review });
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    }
    setIsSubmittingReview(false);
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Activity },
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-black/30">
          <Clock className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Order Not Found</h1>
        <Button asChild className="mt-8 bg-black text-white h-12 px-8 rounded-xl font-semibold text-sm">
           <Link href="/track">Return to Tracker</Link>
        </Button>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(order.status);
  const isDelivered = order.status === 'delivered';
  const showReceiveButton = (order.status === 'shipped' || order.status === 'processing' || order.status === 'delivered') && !order.isReceivedConfirmed;

  return (
    <div className="min-h-screen bg-[#fafafa] relative">
      {/* Header */}
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <Link href="/track" className="p-3 hover:bg-black/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-black/50 mb-1">
               <span>Order Tracking</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-black">{order.status}</span>
             </div>
             <h1 className="text-xl font-bold tracking-tight">Order #{order.id?.slice(-8).toUpperCase()}</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
           <Button onClick={handleDownloadReceipt} variant="outline" className="h-10 px-4 border-black/10 rounded-xl text-xs font-semibold bg-white transition-all hover:bg-black hover:text-white">
             <Download className="h-4 w-4 mr-2" />
             Download PDF Receipt
           </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-12 space-y-8">
        
        {/* Status Pipeline */}
        <div className="bg-white rounded-3xl border border-black/5 p-6 md:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-sm font-semibold uppercase tracking-widest text-black/60">Current Status</h2>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-black/80">
                   {order.status === 'cancelled' ? 'Cancelled' : 'Active'}
                </span>
             </div>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/5 -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
              {steps.map((step, i) => {
                const isCompleted = i <= activeIndex;
                const isActive = i === activeIndex;
                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-4 group bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-black/5 shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-black/20'
                    } ${isActive ? 'scale-105 shadow-md ring-2 ring-black/5' : ''}`}>
                       <step.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left md:text-center">
                       <p className={`text-xs font-semibold tracking-wider ${isCompleted ? 'text-black' : 'text-black/40'}`}>{step.label}</p>
                       {isActive && <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Right Now</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Panel for Buyers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: Confirm Receipt */}
          <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${order.isReceivedConfirmed ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
               <h3 className="font-bold tracking-tight text-lg">Confirm Delivery</h3>
               <p className="text-xs text-black/50 mt-1 font-medium">Let us know if you received your package safely.</p>
            </div>
            {order.isReceivedConfirmed ? (
              <div className="px-6 py-3 bg-green-500/10 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Check className="h-4 w-4" /> Delivered & Confirmed
              </div>
            ) : (
              <Button 
                onClick={handleConfirmReceipt}
                disabled={!showReceiveButton || isMarkingReceived}
                className="w-full mt-2 bg-black text-white rounded-xl h-12 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isMarkingReceived ? "Confirming..." : "I Received My Product"}
              </Button>
            )}
            {!showReceiveButton && !order.isReceivedConfirmed && (
               <p className="text-[9px] text-black/30 uppercase font-black uppercase mt-1">Available after shipping</p>
            )}
          </div>

          {/* Action 2: Rate & Review */}
          <div className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${order.rating ? 'bg-yellow-50 text-yellow-500' : 'bg-orange-50 text-orange-500'}`}>
              <Star className="h-8 w-8" />
            </div>
            <div>
               <h3 className="font-black uppercase tracking-tight text-lg">Rate Experience</h3>
               <p className="text-xs text-black/40 mt-1 font-medium">Share your thoughts on the product and service.</p>
            </div>
            {order.rating ? (
              <div className="px-6 py-3 bg-yellow-500/10 text-yellow-600 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Star className="h-4 w-4 fill-current" /> {order.rating}/5 Rated
              </div>
            ) : (
              <Button 
                onClick={() => setShowReviewModal(true)}
                disabled={!order.isReceivedConfirmed}
                variant="outline"
                className="w-full mt-2 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 border-black/10"
              >
                Leave a Review
              </Button>
            )}
            {!order.isReceivedConfirmed && !order.rating && (
               <p className="text-[9px] text-black/30 uppercase font-black uppercase mt-1">Confirm receipt first</p>
            )}
          </div>

          {/* Action 3: Dispute */}
          <div className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${order.disputeStatus ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
               <h3 className="font-black uppercase tracking-tight text-lg">Report Issue</h3>
               <p className="text-xs text-black/40 mt-1 font-medium">Wrong item or missing pieces? Open a dispute.</p>
            </div>
            {order.disputeStatus ? (
              <div className="px-6 py-3 bg-red-500/10 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Dispute: {order.disputeStatus}
              </div>
            ) : (
              <Button 
                onClick={() => setShowDisputeModal(true)}
                variant="outline"
                className="w-full mt-2 rounded-xl h-12 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 font-black uppercase tracking-widest"
              >
                Open Dispute
              </Button>
            )}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-black/5">
                    <h2 className="text-xs font-black uppercase tracking-widest">Order Items</h2>
                 </div>
                 <div className="divide-y divide-black/5">
                   {order.items.map((item, i) => (
                     <div key={i} className="p-6 flex items-center gap-6">
                        <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border border-black/5 shrink-0">
                          <img src={productImages[item.productId] || ""} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
                          <div className="flex gap-4 text-[10px] font-bold text-black/40 mt-2">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </section>

              <section className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm">
                 <h2 className="text-xs font-black uppercase tracking-widest mb-6">Delivery Address</h2>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-black/60" />
                    </div>
                    <div className="text-sm font-medium leading-relaxed">
                       <p className="font-bold text-base">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                       <p className="text-black/60 mt-1">{order.shippingAddress.address}</p>
                       <p className="text-black/60">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                       <p className="text-black/60 mt-2">📞 {order.shippingAddress.phone}</p>
                    </div>
                 </div>
              </section>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <section className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-widest mb-6">Payment Summary</h3>
                 <div className="space-y-4 text-sm font-medium">
                    <div className="flex justify-between text-black/60">
                       <span>Subtotal</span>
                       <span>${(order.subtotal || order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-black/60">
                       <span>Shipping</span>
                       <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-black/5 font-black text-lg">
                       <span>Total</span>
                       <span>${order.total.toFixed(2)}</span>
                    </div>
                 </div>
                 
                 <Button onClick={handleDownloadReceipt} className="w-full mt-8 bg-black hover:bg-black/90 text-white rounded-xl h-12 text-[10px] font-black uppercase tracking-widest lg:hidden">
                   <Download className="h-4 w-4 mr-2" /> Download PDF Receipt
                 </Button>
              </section>

              <section className="bg-black text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="h-32 w-32" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="font-black text-lg mb-2">Need Help?</h3>
                    <p className="text-white/60 text-xs mb-6 font-medium">Our customer support team is available 24/7.</p>
                    <div className="space-y-3">
                       <a href="tel:+255749097220" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-xs font-bold w-full">
                          <Phone className="h-4 w-4" /> Call Support
                       </a>
                       <a href="mailto:shabanimnango99@gmail.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-xs font-bold w-full">
                          <Mail className="h-4 w-4" /> Email Us
                       </a>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </main>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Open Dispute</h2>
            <p className="text-xs font-medium text-black/40 mb-6">Describe the issue with your order in detail. We will investigate immediately.</p>
            
            <textarea
              className="w-full h-32 p-4 border border-black/10 rounded-xl text-sm focus:ring-black/10 focus:border-black/30 resize-none font-medium mb-6"
              placeholder="E.g. The item arrived deformed, or missing parts..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            
            <div className="flex gap-4">
              <Button onClick={() => setShowDisputeModal(false)} variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-[10px]">
                Cancel
              </Button>
              <Button onClick={handleSubmitDispute} disabled={!disputeReason || isSubmittingDispute} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px]">
                {isSubmittingDispute ? "Submitting..." : "Submit Issue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative text-center">
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Rate Your Experience</h2>
            <p className="text-xs font-medium text-black/40 mb-6">How was the product and our service?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`h-10 w-10 transition-all hover:scale-110 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              className="w-full h-24 p-4 border border-black/10 rounded-xl text-sm focus:ring-black/10 focus:border-black/30 resize-none font-medium mb-6 text-left"
              placeholder="Leave a comment (optional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            
            <div className="flex gap-4">
              <Button onClick={() => setShowReviewModal(false)} variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-[10px]">
                Maybe Later
              </Button>
              <Button onClick={handleSubmitReview} disabled={isSubmittingReview} className="flex-1 bg-black text-white hover:bg-black/90 rounded-xl h-12 font-black uppercase tracking-widest text-[10px]">
                {isSubmittingReview ? "Saving..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
