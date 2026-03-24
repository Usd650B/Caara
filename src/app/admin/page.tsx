"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Edit, Trash2, Package, ShoppingCart, 
  Users, LogOut, X, Eye, Menu, BarChart3, 
  Settings, ChevronRight, LayoutDashboard,
  Box, ClipboardList, Activity, Sparkles, Diamond,
  User, Shield, Bell, Globe, CreditCard, Lock,
  Mail, Phone, MapPin, ExternalLink, RefreshCw, 
  Target, Zap, Save, Trash, DollarSign, TrendingUp as TrendingUpIcon,
  PlusCircle, CheckCircle, AlertCircle, ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, addProduct, updateProduct, deleteProduct, Product, getOrders, Order, deleteOrder } from "@/lib/firestore";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";
import { useSettings } from "@/lib/settings";
import Link from "next/link";

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

  useEffect(() => {
    if (!isSellerAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadProducts();
    loadOrders();
  }, []);

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

  const categories = ["Dresses", "Tops", "Bottoms", "Accessories", "Shoes", "Outerwear"];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <div className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? <TrendingUpIcon className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">{title}</p>
        <h3 className="text-3xl font-black text-black tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Inventory', icon: Box },
    { id: 'orders', label: 'Fulfillment', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentTabTitle = tabs.find(t => t.id === activeTab)?.label || 'SheDoo';

  const DashboardContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            System Intelligence
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Real-time performance metrics and business overview for SheDoo OS.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-14 px-6 border-black/5 rounded-2xl hover:bg-black hover:text-white transition-all font-black text-[10px] uppercase tracking-widest hidden sm:flex">
            <Bell className="h-4 w-4 mr-3" />
            Alert Notification
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Gross Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="12.5" color="bg-blue-600" />
        <StatCard title="Active Orders" value={stats.totalOrders} icon={ShoppingCart} trend="up" trendValue="8.2" color="bg-green-600" />
        <StatCard title="Inventory Count" value={stats.totalProducts} icon={Package} trend="down" trendValue="3.1" color="bg-purple-600" />
        <StatCard title="Elite Customers" value={stats.totalCustomers} icon={Users} trend="up" trendValue="24.8" color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-xs font-black uppercase tracking-widest text-black/30">Revenue Analytics Matrix</h3>
              <select className="bg-black/5 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-72 flex items-end justify-between gap-4 px-2">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center gap-3">
                  <div className="absolute -top-10 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    ${(h * 150).toLocaleString()}
                  </div>
                  <div className="w-full bg-black/[0.03] rounded-t-2xl group-hover:bg-black transition-all duration-500 overflow-hidden relative" style={{ height: `${h}%` }}>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-black text-black/20 uppercase tracking-tighter">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-black/30">Active Fulfilment Stream</h3>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black">
                View All Stream <ChevronRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-6 rounded-2xl bg-black/[0.01] hover:bg-black/[0.03] transition-all border border-black/[0.03]">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-black text-xs italic">S</div>
                    <div>
                      <h4 className="font-black text-black text-xs uppercase tracking-tight">{order.customerName}</h4>
                      <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">{order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-black text-sm tracking-tight">${order.total}</p>
                    <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="bg-[#0a0a0a] text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
               <Globe className="h-64 w-64" />
            </div>
            <div className="relative z-10 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Global Logistics</h3>
                <h4 className="text-4xl font-black tracking-tighter uppercase">SheDoo Global</h4>
                <p className="text-white/30 text-[10px] font-medium max-w-sm tracking-wide">Managing fashion logistics and supply chain for the worldwide SheDoo network.</p>
            </div>
          </div>
          
          <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="h-40 w-40" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center">
                <Diamond className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter leading-none mb-4">Elite <br/> Intelligence</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">System node detected growth in the "Outerwear" sector. Acquisition costs reduced by 14%.</p>
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-black tracking-widest uppercase text-[10px] h-14 rounded-2xl">
                Strategic Expansion Data
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-8">Asset Velocity Node</h3>
            <div className="space-y-8">
              {[
                { label: 'Conversion Rate', value: '4.2%', progress: 75, color: 'bg-blue-600' },
                { label: 'Client Satisfaction', value: '98%', progress: 98, color: 'bg-green-600' },
                { label: 'Asset Retention', value: '32%', progress: 45, color: 'bg-purple-600' },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{item.label}</span>
                    <span className="text-xs font-black text-black">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-black/5">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-black uppercase italic" style={{ fontFamily: 'var(--font-playfair)' }}>
            Inventory Hub
          </h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
            <Target className="h-3 w-3" /> Total Assets Deployed: {products.length}
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20 group-hover:text-black transition-colors" />
          <Input 
            placeholder="Scout assets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-16 pl-14 pr-6 bg-black/[0.01] border-black/5 rounded-[1.5rem] font-bold text-xs tracking-tight placeholder:text-black/20 focus:bg-white focus:shadow-xl transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgb(0,0,0,0.08)] transition-all duration-700 group">
            <div className="aspect-[4/5] relative overflow-hidden bg-black/[0.01]">
              <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
              <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                 <button onClick={() => handleEditProduct(product)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-black hover:text-white transition-all">
                    <Edit className="h-4 w-4" />
                 </button>
                 <button onClick={() => product.id && handleDeleteProduct(product.id)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
              <div className="absolute bottom-6 left-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                 <div className="px-4 py-2 bg-black/90 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
                    ID: {product.id?.slice(0, 8)}
                 </div>
              </div>
            </div>
            <div className="p-8 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/20 mb-1">{product.category}</p>
                    <h3 className="text-sm font-black text-black uppercase tracking-tight line-clamp-1">{product.name}</h3>
                  </div>
                  <p className="text-xl font-black text-black tracking-tighter">${product.price}</p>
               </div>
               <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                  <div className={`h-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`} style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }} />
               </div>
               <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-black/30">
                  <span>Asset Availability</span>
                  <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>{product.stock > 0 ? `${product.stock} Units` : 'Depleted'}</span>
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowAddProduct(true)}
          className="aspect-square md:aspect-auto h-full min-h-[400px] border-4 border-dashed border-black/5 rounded-[3rem] bg-black/[0.01] flex flex-col items-center justify-center gap-6 group hover:bg-black/[0.03] hover:border-black/20 transition-all duration-500"
        >
          <div className="w-20 h-20 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
             <Plus className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h4 className="text-xl font-black uppercase tracking-tight">Deploy Asset</h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-2">Initialize new inventory unit</p>
          </div>
        </button>
      </div>
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-black/5">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-black uppercase italic" style={{ fontFamily: 'var(--font-playfair)' }}>
            Fulfillment Stream
          </h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Active Logistics Threads: {orders.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Global Order ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Agent / Client</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Asset Value</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Fulfillment Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-black/[0.01] transition-all">
                  <td className="px-8 py-8">
                    <span className="font-black text-xs text-black tracking-widest">#{order.id?.slice(0, 10).toUpperCase() || 'UNKNOWN'}</span>
                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-1">
                      <p className="font-black text-black text-xs uppercase tracking-tight">{order.customerName}</p>
                      <p className="text-[10px] text-black/40 font-medium">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="font-black text-black text-sm tracking-tighter">${order.total}</p>
                    <p className="text-[9px] text-black/20 font-black uppercase tracking-widest mt-1">Paid via Protocol</p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button onClick={() => order.id && handleDeleteOrder(order.id)} className="w-10 h-10 border border-black/5 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-black/20">
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
               <Package className="h-10 w-10 text-black/10 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Stream Inactive - No data detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
          Environment Config
        </h2>
        <p className="text-black/40 text-sm font-medium mt-2">Adjust core system variables and global operational parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="flex items-center space-x-4 border-b border-black/5 pb-6">
              <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">Global Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Organization Identity</Label>
                <Input defaultValue="SheDoo OS" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Official Intelligence Email</Label>
                <Input defaultValue="shabanimnango99@gmail.com" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Communication Node</Label>
                <Input defaultValue="+255749097220" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Physical Jurisdiction</Label>
                <Input defaultValue="Dar es Salaam, TZ" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="flex items-center space-x-4 border-b border-black/5 pb-6">
              <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">Regional Nodes</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Primary Currency</Label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold px-4 focus:ring-0"
                >
                  <option value="TZS">Tanzanian Shilling (TZS)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">System Language</Label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold px-4 focus:ring-0"
                >
                  <option value="EN">English (EN)</option>
                  <option value="SW">Swahili (SW)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
             <div className="flex items-center space-x-4">
               <Shield className="h-5 w-5 text-black" />
               <h3 className="text-xs font-black uppercase tracking-widest">Protection Matrix</h3>
             </div>
             <div className="space-y-6">
               {[
                 { label: 'Encryption Protocol', status: 'Optimal', color: 'text-green-500' },
                 { label: 'Access Control', status: 'High', color: 'text-blue-500' },
                 { label: 'Auto-Audit Log', status: 'Active', color: 'text-green-500' },
               ].map((item) => (
                 <div key={item.label} className="flex justify-between items-center border-b border-black/5 pb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{item.label}</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                 </div>
               ))}
             </div>
             <Button variant="outline" className="w-full h-12 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest">
                Security Audit
             </Button>
          </section>

          <section className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 space-y-8">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <Lock className="h-6 w-6" />
             </div>
             <div>
               <h3 className="text-2xl font-black tracking-tight mb-2">Platform Lock</h3>
               <p className="text-white/40 text-xs leading-relaxed font-medium">Activate specialized encryption across all system branches if a threat is detected.</p>
             </div>
             <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                System Lockdown
             </Button>
          </section>
        </div>
      </div>
    </div>
  );

  const ProfileContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            User Authority
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Manage your administrative identity and system access levels.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 border-black/5 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          Update Credentials
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-black/5 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12">
           <div className="flex items-center gap-10">
              <div className="relative group">
                <div className="w-32 h-32 bg-black rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden">
                  AD
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-black/5 rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                  <Edit className="h-4 w-4 text-black" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black tracking-tight uppercase">Administrator</h3>
                  <div className="px-3 py-1 bg-black text-white rounded-lg text-[10px] font-black tracking-widest uppercase">Root</div>
                </div>
                <p className="text-black/40 font-bold uppercase tracking-[0.2em] text-[10px]">Access Level: 1.0 (Unlimited)</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-black/5">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Display Identification</Label>
                <Input defaultValue="Shabani Mnango" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Credential Email</Label>
                <Input defaultValue="shabanimnango99@gmail.com" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Authority Rank</Label>
                <Input disabled defaultValue="System Architect" className="h-14 bg-black/[0.05] border-transparent rounded-2xl font-bold opacity-50" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Session Timeout</Label>
                <Input defaultValue="4 hours" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
              </div>
           </div>
        </div>

        <div className="space-y-12">
          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Security Clearance</p>
             <div className="flex justify-center flex-wrap gap-2">
                {['BIOMETRIC', '2FA', 'HARD-KEY'].map(s => (
                  <span key={s} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black tracking-widest uppercase">{s}</span>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );

  const AddProductModal = () => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || "",
      price: editingProduct?.price || 0,
      category: editingProduct?.category || "Dresses",
      image: editingProduct?.image || "",
      description: editingProduct?.description || "",
      stock: editingProduct?.stock || 100,
    });

    const isEdit = !!editingProduct;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.image) return;
      
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        description: formData.description,
        sizes: editingProduct?.sizes || ["S", "M", "L"],
        colors: editingProduct?.colors || ["Black", "White"],
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
                <h3 className="text-3xl font-black tracking-tight leading-tight">Asset <br/> Creation</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">Synchronize digital assets with our central inventory vault.</p>
                <div className="space-y-6 pt-10">
                  <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">1</div>
                    <span>Basic Matrix</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">2</div>
                    <span>Data Deck</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Scrollable Form Panel */}
            <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">{isEdit ? "Refine Protocol" : "Authorize Asset"}</h2>
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-black/5" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <form id="product-form" onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Legal Asset Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        required 
                        className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold"
                        placeholder="e.g. Executive Silhouette Dress"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Asset Value (USD)</Label>
                        <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Supply Count</Label>
                        <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Classification Node</Label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold px-4 focus:ring-0">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Intelligence Background</Label>
                      <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-36 p-5 bg-black/[0.01] border-black/5 rounded-2xl font-medium text-sm focus:ring-0 resize-none" placeholder="Enter product narrative specifications..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Visual Capture</Label>
                    {formData.image ? (
                      <div className="relative aspect-[3/4] bg-black/5 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="destructive" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6" onClick={() => setFormData({ ...formData, image: "" })}>Delete Frame</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] border-4 border-dashed border-black/10 rounded-[3rem] bg-black/[0.01] flex flex-col items-center justify-center p-12 text-center transition-all hover:bg-black/[0.03] hover:border-black/20 group">
                        <div className="w-16 h-16 bg-black/[0.03] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
                           <Box className="h-6 w-6" />
                        </div>
                        <ImageUpload onImageUpload={(url) => setFormData({ ...formData, image: url })} />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="p-8 md:px-12 md:py-8 border-t border-black/5 bg-white flex justify-end gap-4 z-50">
            <Button 
                type="button" 
                variant="ghost" 
                className="font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl" 
                onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
            >
                Abort
            </Button>
            <Button 
                form="product-form"
                type="submit" 
                className="bg-black text-white px-12 font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all"
            >
              {isEdit ? "Apply Refinement" : "Confirm Authorization"}
            </Button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0F0F0] overflow-hidden font-sans">
      {/* Sidebar - Mobile Toggle Placeholder */}
      <div className="lg:hidden p-4 border-b bg-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <span className="font-black italic">S</span>
          </div>
          <span className="font-black text-xl tracking-tighter">SheDoo OS</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-xl h-12 w-12"><Menu className="h-6 w-6" /></Button>
      </div>

      {/* Sidebar - Consistent with Intelligence Aesthetic */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-[60] w-80 bg-white border-r border-black/5 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 group-hover:scale-110 transition-transform">
                <span className="font-black text-xl italic">S</span>
              </div>
              <span className="text-2xl font-black tracking-tighter">SheDoo OS</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden rounded-xl h-10 w-10"><X className="h-5 w-5" /></Button>
          </div>

          <nav className="flex-1 space-y-6">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-6 h-14 rounded-2xl transition-all duration-300 group ${
                    activeTab === tab.id 
                    ? 'bg-black text-white shadow-xl shadow-black/10' 
                    : 'text-black/40 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="pt-10 border-t border-black/5 space-y-4">
             <div className="flex items-center space-x-4 px-6 text-black/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Operational</span>
             </div>
             <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start space-x-4 px-6 h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
               <LogOut className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Terminate Account</span>
             </Button>
          </div>
        </div>
      </aside>

      {/* Main Stream */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="h-24 bg-[#fafafa]/80 backdrop-blur-md border-b border-black/5 px-8 md:px-12 flex items-center justify-between sticky top-0 z-40">
           <div>
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black/20 mb-1">
               <span>SheDoo OS</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-black">{currentTabTitle}</span>
             </div>
             <h1 className="text-xl font-black tracking-tighter uppercase">{currentTabTitle}</h1>
           </div>
           
           <div className="flex items-center space-x-4">
             <Button 
               onClick={() => setShowAddProduct(true)}
               className="h-12 px-6 bg-black text-white rounded-xl shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all font-black text-[10px] uppercase tracking-widest hidden md:flex"
             >
               <Plus className="h-4 w-4 mr-2" />
               New Asset
             </Button>
             <div className="hidden sm:flex items-center bg-black/5 rounded-full px-4 py-2 border border-black/5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">v4.0.2</span>
             </div>
             <div className="w-10 h-10 bg-black rounded-xl shadow-xl shadow-black/20 flex items-center justify-center text-white text-xs font-black">
                SM
             </div>
           </div>
        </header>

        <div className="max-w-7xl mx-auto p-8 md:p-12">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "orders" && <OrdersContent />}
          {activeTab === "settings" && <SettingsContent />}
          {activeTab === "profile" && <ProfileContent />}
          {activeTab === "analytics" && (
            <div className="text-center py-32 space-y-6 bg-white rounded-[3rem] border border-black/5 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto text-black/10">
                <BarChart3 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black">Advanced Analytics Hub</h3>
                <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-2 px-10">Access high-level strategic data and predictive performance projection modules.</p>
              </div>
              <Link href="/admin/analytics">
                <Button className="bg-black text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  Connect to Intelligence Stream
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-8 right-8 z-[100] md:hidden">
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="w-16 h-16 bg-black text-white rounded-2xl shadow-2xl shadow-black/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        {/* Global Footer Identifier */}
        <div className="px-8 md:px-12 pb-12">
           <div className="flex items-center justify-between pt-8 border-t border-black/5">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Operational Status</span>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-black/20">© 2026 SheDoo Global</div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                 <Lock className="h-3 w-3 text-black/10" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-black/10">End-to-End Encryption Active</span>
              </div>
           </div>
        </div>
      </main>

      {showAddProduct && <AddProductModal />}
    </div>
  );
}
