"use client"

import React, { useState, useEffect } from "react";
import { Percent, Tag, Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { getPromos, addPromo, updatePromo, deletePromo, getProducts, Promo, Product } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PromosTab() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'percent' as 'percent' | 'fixed',
    value: 0, productIds: [] as string[],
    active: true, startDate: '', endDate: ''
  });

  const load = async () => {
    setLoading(true);
    const [p, pr] = await Promise.all([getPromos(), getProducts()]);
    setPromos(p);
    setProducts(pr);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.value <= 0) return alert('Please fill name and discount value.');
    await addPromo(form);
    setShowForm(false);
    setForm({ name: '', type: 'percent', value: 0, productIds: [], active: true, startDate: '', endDate: '' });
    load();
  };

  const toggleActive = async (promo: Promo) => {
    await updatePromo(promo.id!, { active: !promo.active });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo?')) return;
    await deletePromo(id);
    load();
  };

  const toggleProduct = (pid: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(pid) ? f.productIds.filter(id => id !== pid) : [...f.productIds, pid]
    }));
  };

  if (loading) return <div className="py-20 text-center text-neutral-400 text-sm">Loading promos...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-100 p-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Promo & Discount Manager</h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">{promos.length} total promotions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="h-9 px-4 bg-neutral-950 text-white text-xs font-semibold rounded-xl">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New Promo
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900">Create Promotion</h4>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Promo Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" required className="h-9 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Type</Label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full h-9 border border-neutral-200 rounded-lg px-2 text-sm">
                  <option value="percent">% Off</option>
                  <option value="fixed">$ Off</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Value</Label>
                <Input type="number" min={1} value={form.value || ''} onChange={e => setForm({ ...form, value: Number(e.target.value) })} placeholder="e.g. 20" required className="h-9 rounded-lg text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Start Date (optional)</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="h-9 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">End Date (optional)</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="h-9 rounded-lg text-sm" />
            </div>
          </div>

          {/* Product Selector */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Apply to Products {form.productIds.length === 0 && <span className="text-neutral-400 normal-case">(None selected = applies to ALL)</span>}
            </Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 rounded-xl border border-neutral-100">
              {products.map(p => (
                <button key={p.id} type="button" onClick={() => toggleProduct(p.id!)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.productIds.includes(p.id!) ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  <img src={p.image} alt="" className="w-5 h-5 rounded-md object-cover" />
                  <span className="truncate max-w-[120px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="h-9 px-6 bg-neutral-950 text-white text-xs font-semibold rounded-xl">
            Create Promo
          </Button>
        </form>
      )}

      {/* Active Promos */}
      <div className="bg-white rounded-2xl border border-neutral-100">
        <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900">All Promotions</h3>
        </div>
        <div className="divide-y divide-neutral-50">
          {promos.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-12">No promotions yet. Create one above!</p>
          ) : promos.map(promo => {
            const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
            const appliesTo = promo.productIds.length === 0 ? 'All Products' : `${promo.productIds.length} products`;
            return (
              <div key={promo.id} className={`px-6 py-4 flex items-center justify-between ${!promo.active || isExpired ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${promo.type === 'percent' ? 'bg-teal-50' : 'bg-blue-50'}`}>
                    <Percent className={`h-4 w-4 ${promo.type === 'percent' ? 'text-teal-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{promo.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                        {promo.type === 'percent' ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                      </span>
                      <span className="text-[10px] text-neutral-400">{appliesTo}</span>
                      {promo.endDate && (
                        <span className={`text-[10px] font-medium ${isExpired ? 'text-rose-500' : 'text-neutral-400'}`}>
                          {isExpired ? 'Expired' : `Until ${promo.endDate}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(promo)} className="p-1.5" title={promo.active ? 'Deactivate' : 'Activate'}>
                    {promo.active ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-neutral-300" />}
                  </button>
                  <button onClick={() => handleDelete(promo.id!)} className="p-1.5 text-neutral-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
