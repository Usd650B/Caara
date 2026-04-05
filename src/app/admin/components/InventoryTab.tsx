"use client"

import React, { useState, useEffect } from "react";
import { AlertTriangle, Package, CheckCircle, Minus, Plus, Save } from "lucide-react";
import { getProducts, updateProductStock, Product } from "@/lib/firestore";
import { Button } from "@/components/ui/button";

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (pid: string) => {
    setSaving(true);
    await updateProductStock(pid, editStock);
    setEditingId(null);
    setSaving(false);
    load();
  };

  const lowStock = products.filter(p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD && (p.stock ?? 0) > 0);
  const outOfStock = products.filter(p => (p.stock ?? 0) === 0);
  const healthy = products.filter(p => (p.stock ?? 0) > LOW_STOCK_THRESHOLD);

  if (loading) return <div className="py-20 text-center text-neutral-400 text-sm">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Products</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Healthy Stock</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{healthy.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-50 opacity-30" />
          <div className="relative">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{lowStock.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-50 opacity-30" />
          <div className="relative">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
              <Package className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{outOfStock.length}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Stock Alerts</p>
          </div>
          <div className="space-y-1.5">
            {outOfStock.map(p => (
              <p key={p.id} className="text-xs text-rose-700 font-medium">
                ⛔ <span className="font-bold">{p.name}</span> — Out of stock!
              </p>
            ))}
            {lowStock.map(p => (
              <p key={p.id} className="text-xs text-amber-700 font-medium">
                ⚠️ <span className="font-bold">{p.name}</span> — Only {p.stock} left
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Full Inventory Table */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-6 py-4 border-b border-neutral-50">
          <h3 className="text-sm font-bold text-neutral-900">All Products — Stock Levels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stock</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {products.map(p => {
                const stock = p.stock ?? 0;
                const isEditing = editingId === p.id;
                const statusCfg = stock === 0
                  ? { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600' }
                  : stock <= LOW_STOCK_THRESHOLD
                  ? { label: 'Low Stock', cls: 'bg-amber-50 text-amber-600' }
                  : { label: 'In Stock', cls: 'bg-emerald-50 text-emerald-600' };

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-neutral-400">${p.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <div className="inline-flex items-center border border-neutral-300 rounded-lg overflow-hidden">
                          <button onClick={() => setEditStock(Math.max(0, editStock - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-50">
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={editStock}
                            onChange={e => setEditStock(Math.max(0, Number(e.target.value)))}
                            className="w-14 text-center text-xs font-bold border-x border-neutral-300 h-7 outline-none"
                          />
                          <button onClick={() => setEditStock(editStock + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-50">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-bold ${stock === 0 ? 'text-rose-600' : stock <= LOW_STOCK_THRESHOLD ? 'text-amber-600' : 'text-neutral-900'}`}>
                          {stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleSave(p.id!)}
                            disabled={saving}
                            className="h-7 px-3 bg-neutral-950 text-white text-[10px] font-semibold rounded-lg"
                          >
                            <Save className="h-3 w-3 mr-1" /> {saving ? '...' : 'Save'}
                          </Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)} className="h-7 px-2 text-[10px] text-neutral-400">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(p.id!); setEditStock(stock); }}
                          className="text-[10px] font-semibold text-blue-500 hover:text-blue-600"
                        >
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
