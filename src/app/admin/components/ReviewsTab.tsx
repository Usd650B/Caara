"use client"

import React, { useState, useEffect } from "react";
import { Star, MessageCircle, Send, CheckCircle } from "lucide-react";
import { getOrders, replyToReview, Order } from "@/lib/firestore";
import { Button } from "@/components/ui/button";

export default function ReviewsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const all = await getOrders();
    setOrders(all.filter(o => o.rating));
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const handleReply = async (orderId: string) => {
    if (!replyText.trim()) return;
    setSaving(true);
    await replyToReview(orderId, replyText.trim());
    setReplyingTo(null);
    setReplyText("");
    setSaving(false);
    loadReviews();
  };

  const avgRating = orders.length > 0
    ? (orders.reduce((s, o) => s + (o.rating || 0), 0) / orders.length).toFixed(1)
    : "0.0";

  if (loading) return <div className="py-20 text-center text-neutral-400 text-sm">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-neutral-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Avg Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-neutral-900">{avgRating}</p>
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Awaiting Reply</p>
          <p className="text-2xl font-bold text-neutral-900">{orders.filter(o => !o.adminReply).length}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900">Customer Reviews</h3>
        </div>
        <div className="divide-y divide-neutral-50 max-h-[70vh] overflow-y-auto">
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-12">No reviews yet.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="px-6 py-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {order.customerName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-400">{order.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= (order.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                {/* Products in this order */}
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-neutral-50 rounded-lg p-1.5 pr-3 shrink-0">
                      <img src={item.image} alt="" className="w-7 h-7 rounded-md object-cover" />
                      <span className="text-[10px] font-medium text-neutral-600 truncate max-w-[100px]">{item.name}</span>
                    </div>
                  ))}
                </div>

                {order.review && (
                  <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl px-4 py-3 italic mb-3">
                    &ldquo;{order.review}&rdquo;
                  </p>
                )}

                {/* Admin Reply */}
                {order.adminReply ? (
                  <div className="ml-6 border-l-2 border-emerald-200 pl-4 mb-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Your Reply
                    </p>
                    <p className="text-sm text-neutral-600">{order.adminReply}</p>
                  </div>
                ) : (
                  <>
                    {replyingTo === order.id ? (
                      <div className="ml-6 border-l-2 border-blue-200 pl-4 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:border-neutral-400 outline-none resize-none"
                          rows={2}
                          placeholder="Write your reply..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReply(order.id!)}
                            disabled={saving || !replyText.trim()}
                            className="h-8 px-4 bg-neutral-950 text-white text-[11px] font-semibold rounded-lg"
                          >
                            <Send className="h-3 w-3 mr-1.5" /> {saving ? 'Sending...' : 'Send Reply'}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="h-8 px-3 text-[11px] text-neutral-500"
                          >Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(order.id!)}
                        className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 ml-6"
                      >
                        <MessageCircle className="h-3 w-3" /> Reply to review
                      </button>
                    )}
                  </>
                )}

                <p className="text-[9px] text-neutral-300 mt-2 text-right">
                  Order #{order.id?.slice(0, 8).toUpperCase()} • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
