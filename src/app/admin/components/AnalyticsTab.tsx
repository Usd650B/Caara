"use client"

import React, { useState, useEffect } from "react";
import { Eye, Target, ShoppingCart, Users, TrendingUp, MousePointerClick } from "lucide-react";
import { getAnalyticsRange, getProductClickCounts, DailyAnalytics } from "@/lib/analytics";

type Range = 'today' | 'week' | 'month' | 'year';

export default function AnalyticsTab() {
  const [range, setRange] = useState<Range>('week');
  const [data, setData] = useState<DailyAnalytics[]>([]);
  const [clickCounts, setClickCounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const totals = data.reduce((acc, d) => ({
    visitors: acc.visitors + (d.visitors || 0),
    productViews: acc.productViews + (d.productViews || 0),
    addedToCart: acc.addedToCart + (d.addedToCart || 0),
    completedOrders: acc.completedOrders + (d.completedOrders || 0),
    signups: acc.signups + (d.signups || 0),
  }), { visitors: 0, productViews: 0, addedToCart: 0, completedOrders: 0, signups: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [rangeData, clicks] = await Promise.all([
        getAnalyticsRange(range),
        getProductClickCounts()
      ]);
      setData(rangeData);
      setClickCounts(clicks);
      setLoading(false);
    };
    load();
  }, [range]);

  const maxVisitors = Math.max(...data.map(d => d.visitors || 0), 1);

  return (
    <div className="space-y-6">
      {/* Range Selector */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 flex flex-wrap items-center gap-2">
        {(['today', 'week', 'month', 'year'] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              range === r ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
            }`}
          >{r === 'today' ? 'Today' : r === 'week' ? 'Last 7 Days' : r === 'month' ? 'Last 30 Days' : 'This Year'}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400 text-sm">Loading analytics...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Visitors', value: totals.visitors, icon: Eye, color: 'bg-blue-50 text-blue-600' },
              { label: 'Product Views', value: totals.productViews, icon: Target, color: 'bg-teal-50 text-teal-600' },
              { label: 'Added to Cart', value: totals.addedToCart, icon: ShoppingCart, color: 'bg-amber-50 text-amber-600' },
              { label: 'Orders', value: totals.completedOrders, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Signups', value: totals.signups, icon: Users, color: 'bg-rose-50 text-rose-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-neutral-100 p-4">
                <div className={`w-8 h-8 rounded-lg ${kpi.color.split(' ')[0]} flex items-center justify-center mb-3`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color.split(' ')[1]}`} />
                </div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{kpi.label}</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Visitor Chart */}
          {data.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">Visitor Traffic</h3>
              <div className="flex items-end gap-1 h-40">
                {data.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-neutral-500">{d.visitors}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-md min-h-[2px] transition-all"
                      style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                    />
                    <span className="text-[8px] text-neutral-400 truncate w-full text-center">
                      {range === 'today' ? 'Today' : d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Click Counts */}
          <div className="bg-white rounded-2xl border border-neutral-100">
            <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-neutral-400" />
              <h3 className="text-sm font-bold text-neutral-900">Most Clicked Products</h3>
            </div>
            <div className="divide-y divide-neutral-50 max-h-96 overflow-y-auto">
              {clickCounts.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">No product clicks recorded yet.</p>
              ) : (
                clickCounts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50/50">
                    <span className="text-xs font-bold text-neutral-300 w-5">{i + 1}</span>
                    <img src={p.productImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{p.productName}</p>
                      <p className="text-[10px] text-neutral-400">${p.price}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold shrink-0">
                      {p.clicks} clicks
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {data.length === 0 && (
            <div className="text-center py-16 text-neutral-400 text-sm">No data for this time range.</div>
          )}
        </>
      )}
    </div>
  );
}
