"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Edit, Trash2, Package, ShoppingCart, 
  Users, LogOut, X, Eye, Menu, BarChart3, 
  Settings, ChevronRight, LayoutDashboard, Truck,
  Box, ClipboardList, Activity, Sparkles, Diamond,
  User, Shield, Bell, Globe, CreditCard, Lock,
  Mail, Phone, MapPin, ExternalLink, RefreshCw, 
  Target, Zap, Save, Trash, DollarSign, TrendingUp as TrendingUpIcon,
  PlusCircle, CheckCircle, AlertCircle, ChevronLeft, Crown, ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { 
  getProducts, addProduct, updateProduct, deleteProduct, Product, 
  getOrders, Order, updateOrder, deleteOrder, 
  getNotifications, markNotificationRead, markAllNotificationsRead, Notification 
} from "@/lib/firestore";
import { 
  getDashboardAnalytics, 
  getActiveAbandonedCarts, 
  getRecentProductClicks 
} from "@/lib/analytics";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import { useSettings } from "@/lib/settings";
import Link from "next/link";
import AnalyticsTab from "./components/AnalyticsTab";
import ReviewsTab from "./components/ReviewsTab";
import CustomersTab from "./components/CustomersTab";
import InventoryTab from "./components/InventoryTab";
import PromosTab from "./components/PromosTab";
import MessagesTab from "./components/MessagesTab";
import { MessageCircle, Star as StarIcon, Percent, AlertTriangle } from "lucide-react";


const categories = ["Handbags"];

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'orders', label: 'Fulfillment', icon: ClipboardList },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'stock', label: 'Inventory', icon: AlertTriangle },
  { id: 'promos', label: 'Promos', icon: Percent },
  { id: 'reviews', label: 'Reviews', icon: StarIcon },
  { id: 'customers', label: 'Revenue', icon: DollarSign },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, accent }: any) => {
  const accentConfig: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    iconBg: 'bg-blue-100'   },
    green:   { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    iconBg: 'bg-teal-100'   },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    iconBg: 'bg-rose-100'    },
    teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    iconBg: 'bg-teal-100'    },
  };
  const cfg = accentConfig[accent] || { bg: 'bg-neutral-50', text: 'text-neutral-600', iconBg: 'bg-neutral-100' };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
      <div className={`absolute inset-0 ${cfg.bg} opacity-30 pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
            <Icon className={`h-4.5 w-4.5 ${cfg.text}`} strokeWidth={2} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}%
            </div>
          )}
        </div>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

interface AddProductModalProps {
  editingProduct: Product | null;
  setShowAddProduct: (show: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  categories: string[];
  handleAddProduct: (data: any) => Promise<void>;
  submitEditProduct: (id: string, data: any) => Promise<void>;
}

const AddProductModal = ({ 
  editingProduct, 
  setShowAddProduct, 
  setEditingProduct, 
  categories,
  handleAddProduct,
  submitEditProduct
}: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    price: editingProduct?.price || 0,
    category: editingProduct?.category || "Handbags",
    image: editingProduct?.image || "",
    images: editingProduct?.images?.length === 3 ? editingProduct.images : [...(editingProduct?.images || []), "", "", ""].slice(0, 3),
    video: editingProduct?.video || "",
    description: editingProduct?.description || "",
    stock: editingProduct?.stock || 100,
    sizes: editingProduct?.sizes || [],
    colors: editingProduct?.colors || [],
  });

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const isEdit = !!editingProduct;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Primary product image is required.");
      return;
    }
    
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image,
      images: formData.images.filter(img => img && img !== ""),
      video: formData.video,
      description: formData.description,
      sizes: formData.sizes,
      colors: formData.colors,
      stock: Number(formData.stock),
      status: editingProduct?.status || 'active' as const
    };

    if (isEdit && editingProduct?.id) {
      await submitEditProduct(editingProduct.id, payload);
    } else {
      await handleAddProduct(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Info Panel */}
          <div className="hidden md:block w-72 bg-black p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Diamond className="h-40 w-40 rotate-12" />
            </div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-bold tracking-tight leading-tight">{isEdit ? 'Edit Product' : 'New Product'}</h3>
              <p className="text-white/50 text-sm leading-relaxed">Fill in the product details on the right. Colors and sizes you add here will appear as choices for buyers on the store.</p>
              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                  <span className="text-sm text-white/70">Basic Info — name, price, stock</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                  <span className="text-sm text-white/70">Variants — sizes &amp; colors buyers can select</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                  <span className="text-sm text-white/70">Photos — main image + up to 3 extra styles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scrollable Form Panel */}
          <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-black">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-black/5" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">Product Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      required 
                      className="h-11 rounded-lg"
                      placeholder="e.g. Floral Tote Bag"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700">Price (TSh) *</Label>
                      <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required className="h-11 rounded-lg" placeholder="e.g. 25000" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700">Stock Quantity *</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required className="h-11 rounded-lg" placeholder="e.g. 50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">Category</Label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-11 border border-gray-200 rounded-lg font-medium px-3 focus:ring-1 focus:ring-black text-sm">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Size Management */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Available Sizes</Label>
                      <p className="text-[10px] text-gray-400 mt-0.5">Buyers will see these choices on the product page. Leave blank if not applicable.</p>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={newSize} 
                        onChange={e => setNewSize(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = newSize.trim();
                            if (val && !formData.sizes.includes(val)) {
                              setFormData({ ...formData, sizes: [...formData.sizes, val] });
                              setNewSize("");
                            }
                          }
                        }}
                        className="h-10 rounded-lg text-sm"
                        placeholder='e.g. Small, Medium, Large, 26cm...'
                      />
                      <Button 
                        type="button"
                        onClick={() => {
                          const val = newSize.trim();
                          if (val && !formData.sizes.includes(val)) {
                            setFormData({ ...formData, sizes: [...formData.sizes, val] });
                            setNewSize("");
                          }
                        }}
                        className="h-10 w-10 bg-black text-white rounded-lg flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.map((size, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-xs font-semibold">
                          {size}
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) })}
                            className="hover:text-red-300 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {formData.sizes.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No sizes added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Color Management */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Available Colors</Label>
                      <p className="text-[10px] text-gray-400 mt-0.5">Buyers will see these choices on the product page. Leave blank if not applicable.</p>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={newColor} 
                        onChange={e => setNewColor(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = newColor.trim();
                            if (val && !formData.colors.includes(val)) {
                              setFormData({ ...formData, colors: [...formData.colors, val] });
                              setNewColor("");
                            }
                          }
                        }}
                        className="h-10 rounded-lg text-sm"
                        placeholder="e.g. Black, Pink, Beige, Navy..."
                      />
                      <Button 
                        type="button"
                        onClick={() => {
                          const val = newColor.trim();
                          if (val && !formData.colors.includes(val)) {
                            setFormData({ ...formData, colors: [...formData.colors, val] });
                            setNewColor("");
                          }
                        }}
                        className="h-10 w-10 bg-black text-white rounded-lg flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-800 rounded-full text-xs font-semibold">
                          {color}
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== idx) })}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {formData.colors.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No colors added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">Product Description</Label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-28 p-4 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black resize-none" placeholder="Describe the bag — material, dimensions, style, best use..." />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Main Product Image *</Label>
                    <p className="text-[10px] text-gray-400 mt-0.5">This is the primary image shown on the product card and detail page.</p>
                  </div>
                  <ImageUpload 
                    currentImage={formData.image}
                    onImageUpload={(url) => setFormData({ ...formData, image: url })} 
                  />
                </div>

                {/* Extra Images (up to 3) */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Style Variant Photos (up to 3)</Label>
                    <p className="text-[10px] text-gray-400 mt-0.5">Add extra photos for different styles/variants. Buyers can click these to see different angles.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-black/10 bg-black/[0.01] relative flex flex-col items-center justify-center group">
                          <ImageUpload
                            compact
                            currentImage={formData.images[idx]}
                            onImageUpload={(url) => {
                              const updated = [...formData.images];
                              updated[idx] = url;
                              setFormData({ ...formData, images: updated });
                            }}
                          />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Product Video (optional)</Label>
                  <VideoUpload
                    currentVideo={formData.video}
                    onVideoUpload={(url) => setFormData({ ...formData, video: url })}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="p-6 md:px-10 border-t border-gray-100 bg-white flex justify-end gap-3">
          <Button 
              type="button" 
              variant="ghost" 
              className="font-medium text-sm h-10 px-6 rounded-lg text-gray-500" 
              onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
          >
            Cancel
          </Button>
          <Button 
              form="product-form"
              type="submit" 
              className="bg-black text-white px-8 font-semibold text-sm h-10 rounded-lg"
          >
            {isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>

      </div>
    </div>
  );
};


interface DashboardContentProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  analytics: {
    totalVisitors: number;
    totalProductViews: number;
    abandonedCarts: number;
    totalSignups: number;
  } | null;
  orders: Order[];
  abandonedCartsList?: any[];
  recentClicks?: any[];
}

const DashboardContent = ({ stats, orders, analytics, abandonedCartsList = [], recentClicks = [] }: DashboardContentProps) => (
  <div className="space-y-8">
    {/* KPI Metrics Row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="12.5" accent="blue" />
      <StatCard title="Orders" value={stats.totalOrders} icon={ShoppingCart} trend="up" trendValue="8.2" accent="green" />
      <StatCard title="Products" value={stats.totalProducts} icon={Package} accent="teal" />
      <StatCard title="Customers" value={stats.totalCustomers} icon={Users} trend="up" trendValue="24.8" accent="amber" />
    </div>

    {/* Live Metrics Row */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Live Metrics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={analytics?.totalVisitors || 0} icon={Eye} accent="teal" />
        <StatCard title="Product Clicks" value={analytics?.totalProductViews || 0} icon={Target} accent="blue" />
        <StatCard title="New Signups" value={analytics?.totalSignups || 0} icon={ShieldCheck} accent="green" />
        <StatCard title="Abandoned Carts" value={analytics?.abandonedCarts || 0} icon={AlertCircle} accent="rose" />
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left — Abandoned Carts + Recent Orders */}
      <div className="xl:col-span-2 space-y-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50">
            <h3 className="text-sm font-bold text-neutral-900">Recent Orders</h3>
            <span className="text-[10px] font-semibold text-neutral-400">{orders.slice(0,5).length} of {orders.length}</span>
          </div>
          <div className="divide-y divide-neutral-50">
            {orders.length === 0 && (
              <p className="text-center py-8 text-sm text-neutral-400">No orders yet.</p>
            )}
            {orders.slice(0, 5).map((order) => {
              const statusColors: Record<string, string> = {
                pending:    'bg-amber-50 text-amber-600',
                processing: 'bg-blue-50 text-blue-600',
                shipped:    'bg-teal-50 text-teal-600',
                delivered:  'bg-emerald-50 text-emerald-600',
                cancelled:  'bg-rose-50 text-rose-600',
              };
              return (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {order.customerName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${statusColors[order.status] || 'bg-neutral-100 text-neutral-500'}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-neutral-900 w-20 text-right">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50">
            <h3 className="text-sm font-bold text-neutral-900">Abandoned Carts</h3>
            {abandonedCartsList.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{abandonedCartsList.length} active</span>
            )}
          </div>
          <div className="divide-y divide-neutral-50 max-h-80 overflow-y-auto custom-scrollbar">
            {abandonedCartsList.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">No abandoned carts right now.</p>
            ) : (
              abandonedCartsList.map((cart, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{cart.userName || cart.userEmail}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{cart.items?.length || 0} items in cart</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-900">${cart.totalValue}</p>
                      <div className="flex gap-1">
                        {cart.phone && (
                          <a href={`tel:${cart.phone}`} className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100" title="Call">
                            <Phone className="h-3 w-3" />
                          </a>
                        )}
                        {cart.userEmail && cart.userEmail !== 'Anonymous' && (
                          <a href={`mailto:${cart.userEmail}`} className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100" title="Email">
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {cart.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 min-w-[120px] bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                        <img src={item.image} alt="" className="w-8 h-8 rounded-md object-cover" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-neutral-800 truncate">{item.name}</p>
                          <p className="text-[9px] text-neutral-400">{item.color}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Right — Quick Info Column */}
      <div className="space-y-6">
        {/* Recently Viewed Products */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-50">
            <h3 className="text-sm font-bold text-neutral-900">Browsing Activity</h3>
          </div>
          <div className="divide-y divide-neutral-50 max-h-72 overflow-y-auto custom-scrollbar">
            {recentClicks.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">No recent activity.</p>
            ) : (
              recentClicks.map((click, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/50 transition-colors">
                  <img src={click.productImage} alt="" className="w-10 h-10 rounded-xl object-cover bg-neutral-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-800 truncate">{click.productName}</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5 truncate">{click.userName || click.userEmail}</p>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-600 shrink-0">${click.price}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Link Card */}
        <div className="bg-neutral-950 text-white rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Diamond className="h-32 w-32" />
          </div>
          <div className="relative space-y-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Intelligence</p>
              <h4 className="text-lg font-bold leading-tight">"Luxury Bags" sector growing 14% MoM</h4>
            </div>
            <Button className="w-full bg-white text-black hover:bg-neutral-100 font-bold uppercase text-[10px] h-10 rounded-xl transition-all">
              Access Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface ProductsContentProps {
  products: Product[];
  filteredProducts: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (id: string) => Promise<void>;
  setShowAddProduct: (show: boolean) => void;
}

const ProductsContent = ({ 
  products, 
  filteredProducts, 
  searchTerm, 
  setSearchTerm, 
  handleEditProduct, 
  handleDeleteProduct,
  setShowAddProduct
}: ProductsContentProps) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400 group-focus-within:text-black transition-colors" />
        <Input 
          placeholder="Search inventory..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 pl-14 pr-6 bg-neutral-50/50 border-neutral-200 rounded-2xl font-medium text-[12px] tracking-wide focus:bg-white focus:border-black focus:ring-black transition-all"
        />
      </div>
      <div className="flex items-center space-x-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
        <span>Total Assets: {products.length}</span>
      </div>
    </div>
    
    <div className="bg-white border border-neutral-100 rounded-[2rem] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Asset Node</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Classification</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Value (USD)</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stock Protocol</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-neutral-100 shadow-sm">
                      <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    </div>
                    <div>
                      <p className="font-bold text-[13px] text-neutral-900 tracking-wide line-clamp-1">{product.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">ID: {product.id?.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="px-4 py-1.5 bg-neutral-100/80 text-neutral-600 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="font-bold text-[14px] text-neutral-900 tracking-wide">${product.price}</span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    <span className={`text-[11px] font-bold tracking-wide ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {product.stock > 0 ? `${product.stock} Units` : 'Depleted'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditProduct(product)} className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-black hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => product.id && handleDeleteProduct(product.id)} className="w-10 h-10 rounded-xl bg-white border border-neutral-200 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <Package className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-500 text-[13px] font-medium tracking-wide">
              No inventory assets found matching the query.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);


interface OrdersContentProps {
  orders: Order[];
  handleDeleteOrder: (id: string) => Promise<void>;
  handleProcessOrder: (order: Order) => void;
}

const OrdersContent = ({ orders, handleDeleteOrder, handleProcessOrder }: OrdersContentProps) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 capitalize" style={{ fontFamily: 'var(--font-playfair)' }}>
          Fulfillment Registry
        </h2>
        <p className="text-neutral-500 text-[11px] font-semibold uppercase tracking-wider mt-1">Active Logistics Threads: {orders.length}</p>
      </div>
    </div>

    <div className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 z-10">
            <tr className="bg-neutral-50/80 border-b border-neutral-100 backdrop-blur-md">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">Order ID</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">Client</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">Value</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">Signals</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-bold text-[13px] text-neutral-900 tracking-wide">#{order.id?.slice(0, 10).toUpperCase() || 'UNKNOWN'}</span>
                  <p className="text-[10px] font-medium text-neutral-400 mt-1">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="font-bold text-[12px] text-neutral-900 tracking-wide">{order.customerName}</p>
                    <p className="text-[11px] text-neutral-500 font-medium">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-[14px] text-neutral-900 tracking-wide">${order.total}</p>
                  <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">Paid via Protocol</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <span className={`text-[11px] font-bold tracking-wide uppercase ${order.status === 'delivered' ? 'text-emerald-700' : 'text-blue-700'}`}>{order.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    {order.isReceivedConfirmed && (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold tracking-wider uppercase w-max">
                         <CheckCircle className="h-3 w-3" /> Confirmed
                       </span>
                    )}
                    {order.disputeStatus && (
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${order.disputeStatus === 'open' ? 'bg-rose-50 text-rose-600' : 'bg-neutral-100 text-neutral-500'} rounded-lg text-[9px] font-bold tracking-wider uppercase w-max`}>
                         <AlertCircle className="h-3 w-3" /> Dispute {order.disputeStatus}
                       </span>
                    )}
                    {order.rating && (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-bold tracking-wider uppercase w-max">
                         <Sparkles className="h-3 w-3" /> {order.rating}/5 Rated
                       </span>
                    )}
                    {!order.isReceivedConfirmed && !order.disputeStatus && !order.rating && (
                       <span className="text-[10px] text-neutral-400 font-medium tracking-wide">None yet</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => handleProcessOrder(order)}
                        className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-black hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-sm"
                       >
                          <Eye className="h-4 w-4" />
                       </button>
                       <button onClick={() => order.id && handleDeleteOrder(order.id)} className="w-10 h-10 rounded-xl bg-white border border-neutral-200 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-24 text-center">
             <Package className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
             <p className="text-neutral-500 text-[13px] font-medium tracking-wide">Stream Inactive - No data detected.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

interface ProcessOrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Order>) => Promise<void>;
}

const ProcessOrderModal = ({ order, onClose, onUpdate }: ProcessOrderModalProps) => {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!order.id) return;
    setIsUpdating(true);
    await onUpdate(order.id, { status, trackingNumber });
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-neutral-50 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="bg-white border-b border-neutral-100 px-10 py-8 flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-bold text-neutral-900 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Manage Order</h3>
              <p className="text-neutral-500 text-[11px] font-medium uppercase tracking-wider mt-1">Order ID: #{order.id?.slice(0, 12).toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-neutral-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Logistics & Information */}
              <div className="space-y-8">
                <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                    <div className="bg-neutral-50 p-2 rounded-xl">
                      <User className="h-4 w-4 text-neutral-700" />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">Customer Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="font-bold text-neutral-900">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="font-bold text-neutral-900">{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="font-bold text-neutral-900">{order.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                    <div className="bg-neutral-50 p-2 rounded-xl">
                      <MapPin className="h-4 w-4 text-neutral-700" />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">Shipping Address</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Order Manifest & Status Control */}
              <div className="space-y-8">
                <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                    <div className="bg-neutral-50 p-2 rounded-xl">
                      <Package className="h-4 w-4 text-neutral-700" />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900">Order Items</h4>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors rounded-xl px-2">
                         <div className="w-14 h-14 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-neutral-900 truncate">{item.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                             <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-semibold uppercase tracking-wider rounded-md">Size: {item.size}</span>
                             <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-semibold uppercase tracking-wider rounded-md">Color: {item.color}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-neutral-500 mt-1.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-900">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Amount</span>
                      <span className="text-xl font-bold text-neutral-900">${order.total}</span>
                    </div>
                  </div>
                </section>

                <section className="bg-neutral-900 text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] space-y-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Order Status</Label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 font-semibold text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                      >
                        <option value="pending" className="text-black">Pending</option>
                        <option value="processing" className="text-black">Processing</option>
                        <option value="shipped" className="text-black">Shipped</option>
                        <option value="delivered" className="text-black">Delivered</option>
                        <option value="cancelled" className="text-black">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Tracking Number</Label>
                      <Input 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. TRK123456789"
                        className="h-12 bg-white/10 border border-white/10 rounded-xl text-white font-medium placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full h-12 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const SettingsContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            System Settings
          </h2>
          <p className="text-neutral-500 text-[11px] font-medium tracking-wide mt-2">Manage your e-commerce platform's core operational parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-8">
            <div className="flex items-center space-x-4 border-b border-neutral-100 pb-6">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                <Globe className="h-5 w-5 text-neutral-700" />
              </div>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-900">Global Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Organization Name</Label>
                <Input defaultValue="SheDoo Luxury" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Primary Contact Email</Label>
                <Input defaultValue="admin@shedoo.com" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Support Phone</Label>
                <Input defaultValue="+1 (555) 000-0000" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Operating Currency</Label>
                <Input defaultValue="USD ($)" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center space-x-4 border-b border-neutral-100 pb-6">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-neutral-700" />
              </div>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-900">Security Parameters</h3>
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Data Encryption', status: 'Active (AES-256)', color: 'text-emerald-600' },
                 { label: 'Login Authentication', status: 'Strictly Enforced', color: 'text-emerald-600' },
                 { label: 'Session Expiry', status: '24 Hours', color: 'text-blue-600' },
               ].map((item) => (
                 <div key={item.label} className="flex justify-between items-center border-b border-neutral-50 pb-4">
                   <span className="text-[11px] font-semibold text-neutral-600">{item.label}</span>
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.status}</span>
                 </div>
               ))}
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-black font-bold text-[11px] tracking-wide transition-colors">
                Run Diagnostic Audit
            </Button>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-neutral-900 text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] space-y-8 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 p-8 opacity-[0.05] group-hover:scale-110 transition-all duration-700">
               <Lock className="h-48 w-48 text-white" />
             </div>
             <div className="relative z-10 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
               <Lock className="h-5 w-5 text-white" />
             </div>
             <div className="relative z-10">
               <h3 className="text-xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Emergency Lockdown</h3>
               <p className="text-white/60 text-[11px] leading-relaxed font-medium">Instantly freeze all administrative actions and force session logouts across all devices in case of a suspected breach.</p>
             </div>
             <Button className="relative z-10 w-full bg-rose-600 hover:bg-rose-700 text-white h-12 rounded-xl font-bold text-[11px] tracking-wide shadow-lg transition-transform hover:-translate-y-0.5">
                Initiate Lockdown
             </Button>
          </section>
        </div>
      </div>
    </div>
  );

  const ProfileContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            User Authority
          </h2>
          <p className="text-neutral-500 text-[11px] font-medium tracking-wide mt-2">Manage your administrative identity and profile settings.</p>
        </div>
        <Button className="h-12 px-6 bg-black text-white hover:bg-neutral-800 rounded-xl font-bold text-[11px] tracking-wide shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-10">
           <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-neutral-900 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md relative overflow-hidden" style={{ fontFamily: 'var(--font-playfair)' }}>
                  A
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-neutral-200 rounded-lg shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-colors">
                  <Edit className="h-3.5 w-3.5 text-neutral-600" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900">Administrator</h3>
                  <div className="px-2.5 py-1 bg-black text-white rounded-md text-[9px] font-bold tracking-wider uppercase">Root Access</div>
                </div>
                <p className="text-neutral-500 font-medium text-[11px]">System Role: Owner / Developer</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-neutral-100">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Full Name</Label>
                <Input defaultValue="Admin" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Associated Email</Label>
                <Input defaultValue="admin@shedoo.com" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:bg-white focus:border-black transition-all" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Clearance Level</Label>
                <Input disabled defaultValue="Maximum Authority" className="h-12 bg-neutral-100 border-transparent rounded-xl font-medium text-neutral-500 pointer-events-none" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Password</Label>
                <div className="relative">
                  <Input type="password" defaultValue="••••••••" className="h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium pr-24 focus:bg-white focus:border-black transition-all" />
                  <Button variant="ghost" className="absolute right-2 top-1.5 h-9 text-[10px] font-bold uppercase tracking-wider text-black bg-white shadow-sm border border-neutral-100 hover:bg-neutral-50 rounded-lg">Update</Button>
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 text-center">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
               <ShieldCheck className="h-5 w-5 text-emerald-600" />
             </div>
             <div>
               <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-900 mb-1">Account Secure</h3>
               <p className="text-[11px] font-medium text-neutral-500">Your profile is fully verified and guarded by active measures.</p>
             </div>
             <div className="flex justify-center flex-wrap gap-2 pt-2 border-t border-neutral-100">
                {['2FA Enabled', 'Trusted Device', 'Recovery On'].map(s => (
                  <span key={s} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold tracking-wider">{s}</span>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );


export default function AdminPage() {
  const { t, currency, setCurrency, language, setLanguage } = useSettings();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [processingOrder, setProcessingOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [abandonedCartsList, setAbandonedCartsList] = useState<any[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);
  const router = useRouter();

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  const loadOrders = async () => {
    const ordersData = await getOrders();
    setOrders(ordersData);
  };

  const loadNotifications = async () => {
    const nData = await getNotifications();
    setNotifications(nData);
  };

  useEffect(() => {
    if (!isSellerAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadProducts();
    loadOrders();
    loadNotifications();

    const loadAnalytics = async () => {
      const data = await getDashboardAnalytics();
      setAnalytics(data);
      const carts = await getActiveAbandonedCarts();
      setAbandonedCartsList(carts);
      const clicks = await getRecentProductClicks();
      setRecentClicks(clicks);
    };
    loadAnalytics();

    const interval = setInterval(() => {
      loadNotifications();
      loadAnalytics(); 
    }, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await addProduct(productData);
    if (result.success) {
      setShowAddProduct(false);
      loadProducts();
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const submitEditProduct = async (productId: string, updatedData: Partial<Product>) => {
    const result = await updateProduct(productId, updatedData);
    if (result.success) {
      setShowAddProduct(false);
      setEditingProduct(null);
      loadProducts();
    }
  };

  const submitUpdateOrder = async (orderId: string, updatedData: Partial<Order>) => {
    const result = await updateOrder(orderId, updatedData);
    if (result.success) {
      loadOrders();
    }
  };

  const handleSignOut = () => {
    signOutSeller();
    router.push("/admin/login");
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) loadProducts();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const result = await deleteOrder(orderId);
      if (result.success) loadOrders();
    }
  };

  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: new Set(orders.map(order => order.customerEmail)).size
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTabTitle = tabs.find(t => t.id === activeTab)?.label || 'SheDoo';

  return (
    <div className="flex bg-[#F9F9F9] min-h-screen font-sans text-neutral-900 selection:bg-black selection:text-white relative">
      {/* Sidebar for Desktop */}
      <aside className="hidden xl:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-neutral-100 z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-100/80">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <Crown className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <span className="text-base font-extrabold text-black tracking-tight">Caara</span>
              <p className="text-[10px] text-neutral-400 font-medium leading-none mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 px-3 mb-3 mt-2">Navigation</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl transition-all text-left group ${
                activeTab === tab.id 
                ? 'bg-neutral-950 text-white' 
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <tab.icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span className="text-[12px] font-semibold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-100">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors">
            <LogOut className="h-4 w-4" />
            <span className="text-[12px] font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 xl:ml-64 flex flex-col min-h-screen">
         {/* Top Header */}
         <header className="h-16 bg-white border-b border-neutral-100 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="xl:hidden h-9 w-9 rounded-xl border border-neutral-200">
                 <Menu className="h-4 w-4 text-neutral-600" />
               </Button>
               <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                 <Input 
                   placeholder="Search..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-64 h-9 pl-9 bg-neutral-50 border-neutral-200 rounded-xl text-[12px] focus:border-neutral-400"
                 />
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowNotifications(true)}
                 className="h-9 w-9 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center relative hover:bg-neutral-100 transition-colors"
               >
                 <Bell className="h-4 w-4 text-neutral-600" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                     {unreadCount}
                   </span>
                 )}
               </button>
               
               <div className="w-px h-5 bg-neutral-200" />

               <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
                 <div className="text-right hidden sm:block">
                   <p className="text-[12px] font-semibold text-neutral-900">Admin</p>
                   <p className="text-[10px] text-neutral-400">Super Access</p>
                 </div>
                 <div className="h-9 w-9 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                   <User className="h-4 w-4" />
                 </div>
               </div>
            </div>
         </header>

         {/* Scrollable Content View */}
         <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                   Caara Admin / {currentTabTitle}
                 </p>
                 <h1 className="text-2xl font-bold text-neutral-900">
                   {currentTabTitle}
                 </h1>
               </div>
               
               {activeTab === 'products' && (
                 <Button 
                   onClick={() => setShowAddProduct(true)}
                   className="h-10 px-5 bg-neutral-950 text-white hover:bg-neutral-800 rounded-xl text-[12px] font-semibold"
                 >
                   <Plus className="h-4 w-4 mr-1.5" />
                   Add Product
                 </Button>
               )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === "dashboard" && <DashboardContent stats={stats} orders={orders} analytics={analytics} abandonedCartsList={abandonedCartsList} recentClicks={recentClicks} />}
              {activeTab === "products" && (
                <ProductsContent 
                  products={products}
                  filteredProducts={filteredProducts}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleEditProduct={handleEditProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  setShowAddProduct={setShowAddProduct}
                />
              )}
              {activeTab === "orders" && (
                <OrdersContent 
                  orders={orders} 
                  handleDeleteOrder={handleDeleteOrder} 
                  handleProcessOrder={setProcessingOrder}
                />
              )}
              {activeTab === "settings" && <SettingsContent />}
              {activeTab === "profile" && <ProfileContent />}
              {activeTab === "analytics" && <AnalyticsTab />}
              {activeTab === "reviews" && <ReviewsTab />}
              {activeTab === "customers" && <CustomersTab />}
              {activeTab === "stock" && <InventoryTab />}
              {activeTab === "promos" && <PromosTab />}
              {activeTab === "messages" && <MessagesTab />}
            </div>
         </div>
         
         {/* Mobile Add Product Button */}
         {activeTab === 'products' && (
           <div className="fixed bottom-8 right-8 z-[100] md:hidden">
             <Button 
               onClick={() => setShowAddProduct(true)}
               className="w-16 h-16 bg-black text-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
             >
               <Plus className="h-8 w-8" />
             </Button>
           </div>
         )}
      </main>

      {/* Notification Sidebar */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
             <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white z-10 sticky top-0">
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-neutral-900">System Alerts</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">Intelligence Stream</p>
                </div>
                <button onClick={() => setShowNotifications(false)} className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition-all">
                  <X className="h-5 w-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{notifications.length} Total Signals</p>
                   <button
                     onClick={async () => {
                       await markAllNotificationsRead();
                       loadNotifications();
                     }}
                     className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                   >
                     Clear Archives
                   </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-24 text-center space-y-4">
                     <Bell className="h-12 w-12 text-neutral-200 mx-auto" />
                     <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Stream Quiet - No Alerts Detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.isRead && n.id) {
                            await markNotificationRead(n.id);
                            loadNotifications();
                          }
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                          n.isRead ? 'bg-neutral-50/50 border-transparent opacity-70' : 'bg-white border-neutral-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ring-1 ring-black/5'
                        }`}
                      >
                        {!n.isRead && <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                        <div className="flex items-start gap-4">
                           <div className={`p-3 rounded-xl ${
                             n.type === 'dispute' ? 'bg-rose-50 text-rose-600' :
                             n.type === 'confirmation' ? 'bg-emerald-50 text-emerald-600' :
                             n.type === 'review' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                           }`}>
                              {n.type === 'dispute' ? <AlertCircle className="h-4 w-4" /> :
                               n.type === 'confirmation' ? <CheckCircle className="h-4 w-4" /> :
                               n.type === 'review' ? <Sparkles className="h-4 w-4" /> : <Box className="h-4 w-4" />
                              }
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[12px] uppercase tracking-wide text-neutral-900 truncate pr-4">{n.title}</h4>
                              <p className="text-[11px] font-medium text-neutral-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                                  {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                </span>
                                {n.relatedId && (
                                   <Link
                                    href={`/order-tracking/${n.relatedId}`}
                                    target="_blank"
                                    className="text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
                                   >
                                     Inspect Node
                                   </Link>
                                )}
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {processingOrder && (
        <ProcessOrderModal 
          order={processingOrder}
          onClose={() => setProcessingOrder(null)}
          onUpdate={submitUpdateOrder}
        />
      )}

      {showAddProduct && (
        <AddProductModal 
          editingProduct={editingProduct}
          setShowAddProduct={setShowAddProduct}
          setEditingProduct={setEditingProduct}
          categories={categories}
          handleAddProduct={handleAddProduct}
          submitEditProduct={submitEditProduct}
        />
      )}
    </div>
  );
}
