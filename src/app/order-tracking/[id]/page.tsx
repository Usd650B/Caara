"use client"

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  MapPin, Download, ShoppingBag, Activity, 
  ShieldCheck, Mail, Phone, Send,
  AlertTriangle, Star, Check, MessageCircle, X
} from "lucide-react";
import Link from "next/link";
import { getOrders, Order, OrderMessage, updateOrder, addNotification } from "@/lib/firestore";
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
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/track" className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order</p>
              <h1 className="text-sm font-bold text-gray-900">#{order.id?.slice(-8).toUpperCase()}</h1>
            </div>
          </div>
          <button onClick={handleDownloadReceipt} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
            <Download className="h-3.5 w-3.5" /> Receipt
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
              <span className="text-xs font-semibold text-gray-900 capitalize">{order.status}</span>
            </div>
            <span className="text-[10px] text-gray-400">{orderDate.toLocaleDateString()}</span>
          </div>

          {/* Horizontal stepper */}
          <div className="flex items-center gap-0">
            {steps.map((step, i) => {
              const isCompleted = i <= activeIndex;
              const isActive = i === activeIndex;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-xs font-bold ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                    } ${isActive ? 'ring-4 ring-green-100' : ''}`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < activeIndex ? 'bg-green-500' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column — Order info */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Items ({order.items.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-12 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <img src={productImages[item.productId] || item.image || ""} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.size && `${item.size}`}{item.color && ` · ${item.color}`} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {/* Summary row */}
              <div className="px-5 py-3 bg-gray-50 flex justify-between">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Delivery To</h2>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{order.shippingAddress.address}</p>
                  <p className="text-gray-500 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p className="text-gray-500 text-xs mt-1">📞 {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Confirm Receipt */}
              {order.isReceivedConfirmed ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-[11px] font-semibold text-green-700">Delivered</span>
                </div>
              ) : (
                <Button onClick={handleConfirmReceipt} disabled={!showReceiveButton || isMarkingReceived}
                  className="bg-black text-white h-10 rounded-xl text-[11px] font-semibold disabled:opacity-40">
                  {isMarkingReceived ? "Confirming..." : "✓ Confirm Receipt"}
                </Button>
              )}

              {/* Rate */}
              {order.rating ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                  <span className="text-[11px] font-semibold text-yellow-700">{order.rating}/5 Rated</span>
                </div>
              ) : (
                <Button onClick={() => setShowReviewModal(true)} disabled={!order.isReceivedConfirmed}
                  variant="outline" className="h-10 rounded-xl text-[11px] font-semibold border-gray-200 disabled:opacity-40">
                  ★ Leave Review
                </Button>
              )}

              {/* Dispute */}
              {order.disputeStatus ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-[11px] font-semibold text-red-700 capitalize">Dispute {order.disputeStatus}</span>
                </div>
              ) : (
                <Button onClick={() => setShowDisputeModal(true)} variant="outline"
                  className="h-10 rounded-xl text-[11px] font-semibold border-red-100 text-red-500 hover:bg-red-50">
                  ⚠ Report Issue
                </Button>
              )}
            </div>
          </div>

          {/* Right Column — Chat */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: '520px' }}>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Chat</h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400">Live</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
                {/* System message */}
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    Order placed on {orderDate.toLocaleDateString()}
                  </span>
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No messages yet.</p>
                    <p className="text-[10px] text-gray-300 mt-1">Send a message to communicate with the seller.</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isBuyer = msg.sender === 'buyer';
                  const time = new Date(msg.timestamp);
                  return (
                    <div key={i} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isBuyer ? 'order-2' : ''}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isBuyer
                            ? 'bg-black text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[9px] text-gray-400">
                            {isBuyer ? 'You' : 'SheDoo'}
                          </span>
                          <span className="text-[9px] text-gray-300">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message input */}
              <div className="px-3 py-3 border-t border-gray-100 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-10 px-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:border-gray-300 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Need Help */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-900 mb-2">Need help?</p>
              <div className="flex gap-3">
                <a href="tel:+255749097220" className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                  <Phone className="h-3 w-3" /> Call
                </a>
                <a href="mailto:shabanimnango99@gmail.com" className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                  <Mail className="h-3 w-3" /> Email
                </a>
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
