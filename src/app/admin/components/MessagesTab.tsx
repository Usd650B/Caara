"use client"

import React, { useState, useEffect, useRef } from "react";
import { getOrders, Order, OrderMessage, updateOrder } from "@/lib/firestore";
import { MessageCircle, Send, Search, User, Package, ChevronRight, Clock } from "lucide-react";
import { useSettings } from "@/lib/settings";

export default function MessagesTab() {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await getOrders();
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedOrderId, orders]);

  const ordersWithMessages = orders.filter(o => o.messages && o.messages.length > 0);
  const filteredOrders = searchTerm
    ? ordersWithMessages.filter(o =>
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ordersWithMessages;

  // Sort by last message time (most recent first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aLast = a.messages?.[a.messages.length - 1]?.timestamp || '';
    const bLast = b.messages?.[b.messages.length - 1]?.timestamp || '';
    return bLast.localeCompare(aLast);
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const messages = selectedOrder?.messages || [];

  const unreadCount = (order: Order) => {
    if (!order.messages) return 0;
    return order.messages.filter(m => m.sender === 'buyer').length;
  };

  const lastMessage = (order: Order) => {
    if (!order.messages || order.messages.length === 0) return '';
    const last = order.messages[order.messages.length - 1];
    return last.text.length > 50 ? last.text.slice(0, 50) + '...' : last.text;
  };

  const lastMessageTime = (order: Order) => {
    if (!order.messages || order.messages.length === 0) return '';
    const last = order.messages[order.messages.length - 1];
    const d = new Date(last.timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSendReply = async () => {
    if (!selectedOrder?.id || !newReply.trim()) return;
    setIsSending(true);
    try {
      const msg: OrderMessage = {
        sender: 'admin',
        text: newReply.trim(),
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...(selectedOrder.messages || []), msg];
      await updateOrder(selectedOrder.id, { messages: updatedMessages });
      // Update local state
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? { ...o, messages: updatedMessages } : o
      ));
      setNewReply("");
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl border border-neutral-100 overflow-hidden bg-white">
      {/* Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-100 flex flex-col shrink-0 ${selectedOrderId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-neutral-50 border border-neutral-100 rounded-lg text-xs focus:outline-none focus:border-neutral-300 transition"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto">
          {sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <MessageCircle className="h-10 w-10 text-neutral-200 mb-3" />
              <p className="text-xs text-neutral-400 font-medium">No conversations yet</p>
              <p className="text-[10px] text-neutral-300 mt-1">Messages from buyers will appear here.</p>
            </div>
          ) : (
            sortedOrders.map(order => {
              const isSelected = order.id === selectedOrderId;
              const lastMsg = order.messages?.[order.messages.length - 1];
              const isLastFromBuyer = lastMsg?.sender === 'buyer';
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id || null)}
                  className={`w-full text-left p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${
                    isSelected ? 'bg-neutral-50 border-l-2 border-l-black' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-neutral-900 truncate">{order.customerName}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0 ml-2">{lastMessageTime(order)}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mb-1">Order #{order.id?.slice(-6).toUpperCase()}</p>
                      <p className={`text-[11px] truncate ${isLastFromBuyer ? 'text-neutral-700 font-medium' : 'text-neutral-400'}`}>
                        {isLastFromBuyer ? '' : 'You: '}{lastMessage(order)}
                      </p>
                    </div>
                    {isLastFromBuyer && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 flex flex-col ${!selectedOrderId ? 'hidden md:flex' : 'flex'}`}>
        {selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="md:hidden p-1.5 hover:bg-neutral-50 rounded-lg"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-900">{selectedOrder.customerName}</p>
                <p className="text-[10px] text-neutral-400">Order #{selectedOrder.id?.slice(-8).toUpperCase()} · {selectedOrder.customerEmail}</p>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-600' :
                selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                selectedOrder.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                'bg-neutral-100 text-neutral-500'
              }`}>
                {selectedOrder.status}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50/50">
              {/* Order info header */}
              <div className="text-center mb-4">
                <span className="text-[10px] text-neutral-400 bg-white px-3 py-1 rounded-full border border-neutral-100">
                  {selectedOrder.items.length} item{selectedOrder.items.length > 1 ? 's' : ''} · {formatPrice(selectedOrder.total)}
                </span>
              </div>

              {messages.map((msg, i) => {
                const isAdmin = msg.sender === 'admin';
                const time = new Date(msg.timestamp);
                return (
                  <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-black text-white rounded-br-md'
                          : 'bg-white text-neutral-900 rounded-bl-md border border-neutral-100'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] text-neutral-400">
                          {isAdmin ? 'You' : selectedOrder.customerName.split(' ')[0]}
                        </span>
                        <span className="text-[9px] text-neutral-300">
                          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Reply input */}
            <div className="px-4 py-3 border-t border-neutral-100 bg-white">
              <form onSubmit={(e) => { e.preventDefault(); handleSendReply(); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newReply}
                  onChange={e => setNewReply(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 h-10 px-4 bg-neutral-50 border border-neutral-100 rounded-full text-sm focus:outline-none focus:border-neutral-300 transition"
                />
                <button
                  type="submit"
                  disabled={!newReply.trim() || isSending}
                  className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition disabled:opacity-30 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-12 w-12 text-neutral-200 mb-3" />
            <p className="text-sm font-medium text-neutral-400">Select a conversation</p>
            <p className="text-xs text-neutral-300 mt-1">Pick a buyer to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
