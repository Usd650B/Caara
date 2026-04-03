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



const categories = ["Handbags"];

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'products', label: 'Inventory', icon: Box },
  { id: 'orders', label: 'Fulfillment', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => {
  // Translate vibrant colors to luxury subtle variants
  const colorMap: Record<string, string> = {
    'bg-blue-600': 'bg-neutral-100 text-neutral-800',
    'bg-emerald-600': 'bg-neutral-100 text-neutral-800',
    'bg-purple-600': 'bg-neutral-100 text-neutral-800',
    'bg-orange-600': 'bg-neutral-100 text-neutral-800',
    'bg-pink-500': 'bg-neutral-100 text-neutral-800',
    'bg-indigo-500': 'bg-neutral-100 text-neutral-800',
    'bg-teal-500': 'bg-neutral-100 text-neutral-800',
    'bg-rose-500': 'bg-neutral-100 text-neutral-800',
  };
  const theme = colorMap[color] || 'bg-neutral-100 text-neutral-800';

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-full ${theme.split(' ')[0]} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${theme.split(' ')[1]}`} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-50 text-neutral-600'}`}>
            {trend === 'up' ? <TrendingUpIcon className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-neutral-900" style={{ fontFamily: 'var(--font-playfair)' }}>{value}</h3>
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
  <div className="space-y-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
      <StatCard title="Gross Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="12.5" color="bg-blue-600" />
      <StatCard title="Active Orders" value={stats.totalOrders} icon={ShoppingCart} trend="up" trendValue="8.2" color="bg-emerald-600" />
      <StatCard title="Inventory Count" value={stats.totalProducts} icon={Package} trend="down" trendValue="3.1" color="bg-purple-600" />
      <StatCard title="Elite Customers" value={stats.totalCustomers} icon={Users} trend="up" trendValue="24.8" color="bg-orange-600" />
    </div>

    <div className="flex items-center space-x-3 mt-10 mb-6 px-2">
      <Activity className="h-5 w-5 text-neutral-400" />
      <h3 className="text-[14px] font-bold uppercase tracking-widest text-neutral-900">Real-Time Pulse</h3>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
      <StatCard 
        title="Daily Visitors" 
        value={analytics?.totalVisitors || 0} 
        icon={Eye} 
        color="bg-pink-500" 
      />
      <StatCard 
        title="Product Clicks" 
        value={analytics?.totalProductViews || 0} 
        icon={Target} 
        color="bg-indigo-500" 
      />
      <StatCard 
        title="Verified Signups" 
        value={analytics?.totalSignups || 0} 
        icon={ShieldCheck} 
        color="bg-teal-500" 
      />
      <StatCard 
        title="Abandoned Carts" 
        value={analytics?.abandonedCarts || 0} 
        icon={AlertCircle} 
        color="bg-rose-500" 
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-neutral-900">Abandoned Carts</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {abandonedCartsList.length === 0 ? (
              <p className="text-[11px] tracking-wide font-medium text-neutral-400">No current abandoned sessions.</p>
            ) : (
              abandonedCartsList.map((cart, idx) => (
                <div key={idx} className="flex flex-col p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100/50 space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">{cart.userName || cart.userEmail}</p>
                      <p className="text-[10px] font-semibold text-neutral-500 mt-1">
                        {cart.phone ? `${cart.phone} • ` : ''}{cart.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 text-sm">${cart.totalValue}</p>
                      <p className="text-[9px] font-medium text-neutral-400 mt-1">
                        {cart.updatedAt?.toDate ? cart.updatedAt.toDate().toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {cart.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 min-w-[140px] bg-white p-2.5 rounded-xl border border-neutral-100 shadow-sm">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-neutral-900 truncate">{item.name}</p>
                          <p className="text-[9px] font-medium text-neutral-500 capitalize">{item.color} / {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
              <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-neutral-900">Recent Orders</h3>
            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All Orders <ChevronRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100/50">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {order.customerName?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-[13px] tracking-wide">{order.customerName}</h4>
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-1">{order.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900 text-sm tracking-wide">${order.total}</p>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="bg-[#0f0f0f] text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
             <Globe className="h-64 w-64 text-white" />
          </div>
          <div className="relative z-10 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Global Logistics</h3>
              <h4 className="text-3xl font-bold tracking-tight text-white capitalize space-y-1" style={{ fontFamily: 'var(--font-playfair)' }}>SheDoo <span className="block text-white/80 italic font-light">Global</span></h4>
              <p className="text-white/40 text-[11px] leading-relaxed max-w-xs font-medium tracking-wide">Managing luxury fashion logistics and supply chain for the worldwide SheDoo network.</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-neutral-900 to-black text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
             <Diamond className="h-48 w-48 text-white" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight leading-none mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Elite Intelligence</h3>
              <p className="text-white/50 text-[11px] leading-relaxed font-medium">System node detected growth in the "Luxury Bags" sector. Acquisition costs reduced by 14%.</p>
            </div>
            <Button className="w-full bg-white text-black hover:bg-neutral-100 font-bold tracking-wider uppercase text-[10px] h-12 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
              Access Strategic Data
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-neutral-900 mb-6">Recently Viewed Products</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {recentClicks.length === 0 ? (
              <p className="text-[11px] font-medium text-neutral-400 text-center py-4">No recent views.</p>
            ) : (
              recentClicks.map((click, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200/50">
                  <div className="flex items-center gap-3">
                    <img src={click.productImage} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                    <div>
                      <p className="font-bold text-neutral-900 text-[11px] tracking-wide">{click.productName}</p>
                      <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider mt-1">By {click.userName || click.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900 text-[12px] tracking-wide">${click.price}</p>
                    <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                      {click.timestamp?.toDate ? click.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
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
      <aside className="hidden xl:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-neutral-200/60 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="h-24 flex items-center px-10 border-b border-neutral-100/50">
           <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl tracking-tighter leading-none">
                  <span className="font-extrabold text-black">She</span>
                  <span className="font-light italic text-neutral-500 ml-0.5">Doo</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mt-1">Admin Portal</span>
              </div>
           </div>
        </div>

        <nav className="flex-1 py-8 px-6 space-y-1.5 overflow-y-auto">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center space-x-4 px-4 h-12 rounded-xl transition-all duration-300 group ${
                  activeTab === tab.id 
                  ? 'bg-black text-white shadow-md hover:-translate-y-0.5' 
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
               }`}
             >
               <tab.icon className={`h-4.5 w-4.5 ${activeTab === tab.id ? 'text-white' : 'text-neutral-400 group-hover:text-black transition-colors'}`} />
               <span className="text-[11px] font-semibold tracking-wide capitalize">{tab.label}</span>
             </button>
           ))}
        </nav>

        <div className="p-6 border-t border-neutral-100/50">
           <button onClick={handleSignOut} className="w-full flex items-center justify-between px-4 h-12 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors group">
             <span className="text-[11px] font-semibold tracking-wide capitalize group-hover:text-rose-600">Secure Logout</span>
             <LogOut className="h-4.5 w-4.5 opacity-60 group-hover:opacity-100" />
           </button>
           <div className="mt-4 text-center">
             <span className="text-[9px] font-medium text-neutral-300 uppercase tracking-widest">© 2026 SheDoo Global</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 xl:ml-72 flex flex-col min-h-screen">
         {/* Top Header */}
         <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 px-8 lg:px-12 flex items-center justify-between sticky top-0 z-40 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <div className="flex items-center">
               <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="xl:hidden h-12 w-12 rounded-xl mr-4 bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm">
                 <Menu className="h-5 w-5 text-neutral-600" />
               </Button>
               {/* Search */}
               <div className="hidden md:flex relative items-center group">
                 <Search className="absolute left-4 h-4.5 w-4.5 text-neutral-400 group-focus-within:text-black transition-colors" />
                 <Input 
                   placeholder="Search the registry..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-80 h-12 pl-12 bg-white border border-neutral-200 focus:border-black focus:ring-black rounded-2xl text-[12px] font-medium tracking-wide shadow-sm transition-all"
                 />
               </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-8">
               <Button 
                 variant="ghost"
                 onClick={() => setShowNotifications(true)}
                 className="h-12 w-12 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-2xl shadow-sm relative transition-all group"
               >
                 <Bell className="h-5 w-5 text-neutral-600 group-hover:text-black" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ring-2 ring-white">
                     {unreadCount}
                   </span>
                 )}
               </Button>
               
               <div className="h-8 w-px bg-neutral-200 hidden md:block" />

               <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActiveTab('profile')}>
                 <div className="text-right hidden sm:block">
                   <p className="text-[12px] font-bold text-neutral-900 tracking-wide">Administrator</p>
                   <p className="text-[10px] font-medium text-neutral-400 mt-0.5">Root Access</p>
                 </div>
                 <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all">
                   <User className="h-5 w-5 opacity-90" />
                 </div>
               </div>
            </div>
         </header>

         {/* Scrollable Content View */}
         <div className="flex-1 overflow-y-auto w-full max-w-[1700px] mx-auto p-6 md:p-10 lg:p-14">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                 <div className="flex items-center space-x-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-3">
                   <span>SheDoo Manage /</span>
                   <span className="text-black">{currentTabTitle}</span>
                 </div>
                 <h1 className="text-4xl md:text-[2.75rem] font-bold tracking-tight text-neutral-900 capitalize" style={{ fontFamily: 'var(--font-playfair)' }}>
                   {currentTabTitle}
                 </h1>
               </div>
               
               {activeTab === 'products' && (
                 <Button 
                   onClick={() => setShowAddProduct(true)}
                   className="h-14 px-8 bg-black text-white hover:bg-neutral-800 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 transition-all font-semibold text-[12px] tracking-wide"
                 >
                   <Plus className="h-4.5 w-4.5 mr-2" />
                   New Asset
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
              {activeTab === "analytics" && (
                <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-[2rem] border border-neutral-100 p-12 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                  <div className="w-24 h-24 bg-neutral-50 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <BarChart3 className="h-10 w-10 text-neutral-400" />
                  </div>
                  <div className="text-center max-w-md">
                    <h3 className="text-3xl font-bold text-neutral-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Analytics Suite</h3>
                    <p className="text-neutral-500 text-[13px] leading-relaxed">The advanced analytics and predictive performance modules are currently syncing with external intelligence streams.</p>
                  </div>
                  <Link href="/admin/analytics">
                    <Button className="bg-black hover:bg-neutral-800 text-white h-14 px-10 rounded-2xl font-semibold text-[12px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      Access Data Room
                    </Button>
                  </Link>
                </div>
              )}
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
