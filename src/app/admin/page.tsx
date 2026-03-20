"use client"

import { useState, useEffect } from "react";
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
  Target, Zap, Save, Trash, DollarSign
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
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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

  const TrendingUp = ({ className }: { className?: string }) => <Zap className={className} />;
  const TrendingDown = ({ className }: { className?: string }) => <Activity className={className} />;

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Inventory', icon: Box },
    { id: 'orders', label: 'Fulfillment', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentTabTitle = tabs.find(t => t.id === activeTab)?.label || 'CAARA';

  const DashboardContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            System Intelligence
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Real-time performance metrics and business overview for OS CAARA.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-14 px-6 border-black/5 rounded-2xl hover:bg-black hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
            <Bell className="h-4 w-4 mr-3" />
            Alert Notification
          </Button>
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="h-14 px-8 bg-black text-white rounded-2xl shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <Plus className="h-4 w-4 mr-3" />
            Launch Asset
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
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-6 rounded-3xl hover:bg-black/[0.01] transition-all border border-transparent hover:border-black/5 group">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-black/[0.03] rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-colors">
                      #{order.id?.slice(-4)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-black uppercase tracking-tight">{order.customerName}</p>
                      <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-1">{order.items?.length || 0} Assets • {order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-black">${order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1">Live Manifest</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="bg-black text-white p-12 rounded-[3.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
               <Globe className="h-64 w-64" />
            </div>
            <div className="relative z-10 space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Organization Identity</h3>
               <h4 className="text-4xl font-black tracking-tighter uppercase">Caara International</h4>
               <p className="text-white/30 text-[10px] font-medium max-w-sm tracking-wide">Strategic logistics and brand identity node for the worldwide CAARA fashion network.</p>
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
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-black/40">{item.label}</span>
                    <span className="text-black">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Inventory Vault
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Curate and refine your digital product ecosystem.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assets by identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 h-14 bg-white border border-black/5 rounded-[1.25rem] text-sm font-bold focus:ring-1 focus:ring-black/10 shadow-sm transition-all"
            />
          </div>
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="h-14 px-8 bg-black text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-black/10 transition-all"
          >
            <Plus className="h-4 w-4 mr-3" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgb(0,0,0,0.08)] transition-all duration-700">
            <div className="aspect-[3/4] relative overflow-hidden bg-black/[0.02]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-110 grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                <Button 
                  size="icon" 
                  className="bg-white text-black hover:bg-white/90 rounded-2xl h-12 w-12"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  className="bg-white text-red-600 hover:bg-red-50 rounded-2xl h-12 w-12"
                  onClick={() => handleDeleteProduct(product.id as string)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] rounded-[0.75rem] shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <h3 className="font-black text-black text-lg line-clamp-1 uppercase tracking-tight">{product.name}</h3>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-black">${product.price}</span>
                <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">UNIT COUNT: {product.stock || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Manifest Fulfillment
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Oversee order lifecycles and customer acquisitions.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02]">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Reference Bundle</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Client Entity</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Status protocol</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Manifest Value</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Audit Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-10 py-8">
                    <span className="text-sm font-black text-black uppercase tracking-tight">#{order.id?.slice(-8).toUpperCase()}</span>
                    <p className="text-[10px] text-black/20 font-black mt-2 uppercase tracking-widest">{order.createdAt?.toDate()?.toLocaleDateString()}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-xs font-black">
                        {order.customerName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-black uppercase tracking-tight">{order.customerName}</p>
                        <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-1">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-500' :
                        order.status === 'shipped' ? 'bg-blue-500' :
                        order.status === 'processing' ? 'bg-yellow-500' : 'bg-black/10'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-lg font-black text-black">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-11 px-6 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest">
                          Audit
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 text-red-600 hover:bg-red-50 rounded-xl"
                        onClick={() => handleDeleteOrder(order.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            System Protocol
          </h2>
          <p className="text-black/40 text-sm font-medium mt-2">Configuration of standard business nodes and platform security.</p>
        </div>
        <Button className="h-14 px-8 bg-black text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest">
          <Save className="h-4 w-4 mr-3" />
          Synchronize Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="flex items-center space-x-4 border-b border-black/5 pb-6">
              <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest">Store Manifest</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Organization Identity</Label>
                <Input defaultValue="OS CAARA Official" className="h-14 bg-black/[0.01] border-black/5 rounded-2xl font-bold" />
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
          <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/30">Recent Authorities</h3>
            <div className="space-y-6">
              {[
                { action: 'Product Manifest Upload', time: '2h ago', icon: Box },
                { action: 'System Backup Complete', time: '14h ago', icon: Shield },
                { action: 'Protocol Sync', time: '1d ago', icon: Activity },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <log.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{log.action}</p>
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

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
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
          <div className="flex h-full">
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

            <div className="flex-1 p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">{isEdit ? "Refine Protocol" : "Authorize Asset"}</h2>
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-black/5" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
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

                <div className="flex justify-end gap-4 pt-10 border-t border-black/5">
                  <Button type="button" variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>Abort</Button>
                  <Button type="submit" className="bg-black text-white px-12 font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                    {isEdit ? "Apply Refinement" : "Confirm Authorization"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      <div className="lg:hidden p-4 border-b bg-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <span className="font-black italic">C</span>
          </div>
          <span className="font-black text-xl tracking-tighter">OS CAARA</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-xl h-12 w-12"><Menu className="h-6 w-6" /></Button>
      </div>

      {/* Sidebar - Consistent with Intelligence Aesthetic */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-[60] w-80 bg-white border-r border-black/5 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 group-hover:scale-110 transition-transform">
                <span className="font-black text-xl italic">C</span>
              </div>
              <span className="text-2xl font-black tracking-tighter">OS CAARA</span>
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
               <span>OS CAARA</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-black">{currentTabTitle}</span>
             </div>
             <h1 className="text-xl font-black tracking-tighter uppercase">{currentTabTitle} Node</h1>
           </div>
           
           <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center bg-black/5 rounded-full px-4 py-2 border border-black/5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Protocol V4</span>
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

        {/* Global Footer Identifier */}
        <div className="px-8 md:px-12 pb-12">
           <div className="flex items-center justify-between pt-8 border-t border-black/5">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Operational</span>
                 </div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-black/20">© 2026 CAARA SYSTEMS ADM</div>
              </div>
              <div className="flex items-center gap-4">
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
