"use client"

import React, { useState, useEffect } from "react";
import { DollarSign, User, CheckCircle, ShoppingCart } from "lucide-react";
import { getOrders, Order } from "@/lib/firestore";

export default function CustomersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  // Compute per-customer data
  const customerMap: Record<string, { name: string; email: string; orders: number; totalSpent: number; lastOrder: string }> = {};
  orders.forEach(o => {
    const key = o.customerEmail;
    if (!customerMap[key]) {
      customerMap[key] = { name: o.customerName, email: key, orders: 0, totalSpent: 0, lastOrder: '' };
    }
    customerMap[key].orders += 1;
    customerMap[key].totalSpent += o.total;
    const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '';
    if (!customerMap[key].lastOrder || date > customerMap[key].lastOrder) customerMap[key].lastOrder = date;
  });
  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const completedRevenue = completedOrders.reduce((s, o) => s + o.total, 0);

  if (loading) return <div className="py-20 text-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Revenue</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Completed Revenue</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">${completedRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Orders</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
            <User className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Customers</p>
          <p className="text-xl font-bold text-neutral-900 mt-1">{customers.length}</p>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-6 py-4 border-b border-neutral-50">
          <h3 className="text-sm font-bold text-neutral-900">Completed Orders (Delivered)</h3>
        </div>
        <div className="divide-y divide-neutral-50 max-h-72 overflow-y-auto">
          {completedOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">No completed orders yet.</p>
          ) : completedOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs">{o.customerName?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">{o.customerName}</p>
                  <p className="text-[10px] text-neutral-400">{o.customerEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-neutral-900">${o.total.toFixed(2)}</p>
                <p className="text-[9px] text-neutral-400">{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Customers */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-6 py-4 border-b border-neutral-50">
          <h3 className="text-sm font-bold text-neutral-900">All Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Customer</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Orders</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Spent</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {customers.map(c => (
                <tr key={c.email} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-3">
                    <p className="text-xs font-semibold text-neutral-900">{c.name}</p>
                    <p className="text-[10px] text-neutral-400">{c.email}</p>
                  </td>
                  <td className="px-6 py-3 text-xs font-semibold text-neutral-700">{c.orders}</td>
                  <td className="px-6 py-3 text-xs font-bold text-neutral-900">${c.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-3 text-[10px] text-neutral-400">{c.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
