"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Edit, Trash2, Package, ShoppingCart, 
  Users, LogOut, X, Eye, Menu, Home, BarChart3, 
  FileText, DollarSign, TrendingUp, TrendingDown, 
  Bell, Settings, ChevronRight, LayoutDashboard,
  Box, ClipboardList, Activity, Sparkles, Diamond
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, addProduct, updateProduct, deleteProduct, Product, getOrders, Order, deleteOrder } from "@/lib/firestore";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";
import { useSettings } from "@/lib/settings";

export default function AdminPage() {
  const { t } = useSettings();
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

  const handleClearProducts = async () => {
    if (confirm('Are you sure you want to delete all products? This cannot be undone.')) {
      const result = await clearAllProducts();
      if (result.success) {
        loadProducts();
      }
    }
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

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/40 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-black tracking-tight">{value}</h3>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            System Intelligence
          </h2>
          <p className="text-black/40 text-sm font-medium">Real-time performance metrics and business overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-11 px-4 border-black/5 rounded-xl hover:bg-black hover:text-white transition-all">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="h-11 px-6 bg-black text-white rounded-xl shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Launch Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Gross Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="up" 
          trendValue="12.5" 
          color="bg-blue-600"
        />
        <StatCard 
          title="Active Orders" 
          value={stats.totalOrders} 
          icon={ShoppingCart} 
          trend="up" 
          trendValue="8.2" 
          color="bg-green-600"
        />
        <StatCard 
          title="Inventory Count" 
          value={stats.totalProducts} 
          icon={Package} 
          trend="down" 
          trendValue="3.1" 
          color="bg-purple-600"
        />
        <StatCard 
          title="Elite Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend="up" 
          trendValue="24.8" 
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight text-black">Revenue Analytics</h3>
              <select className="bg-black/5 border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                  <div className="absolute -top-8 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(h * 150).toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-black/5 rounded-t-lg group-hover:bg-black transition-all duration-500 overflow-hidden" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-bold text-black/20">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight text-black">Recent Orders</h3>
              <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black/[0.03] rounded-xl flex items-center justify-center font-black text-xs">
                      #{order.id?.slice(-4)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-black">{order.customerName}</p>
                      <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{order.items?.length || 0} items • {order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-black">${order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Diamond className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Executive Insights</h3>
                <p className="text-white/60 text-sm leading-relaxed">Your sales volume is up 12% this week. Customer retention is at an all-time high.</p>
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-black tracking-widest uppercase text-xs h-12 rounded-xl">
                Advanced Report
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-black tracking-tight text-black mb-6">Business Velocity</h3>
            <div className="space-y-6">
              {[
                { label: 'Conversion Rate', value: '4.2%', progress: 75, color: 'bg-blue-600' },
                { label: 'Customer Satisfaction', value: '98%', progress: 98, color: 'bg-green-600' },
                { label: 'Repeat Purchase', value: '32%', progress: 45, color: 'bg-purple-600' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-black/40 uppercase tracking-widest">{item.label}</span>
                    <span className="text-black">{item.value}</span>
                  </div>
                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }} />
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Inventory Management
          </h2>
          <p className="text-black/40 text-sm font-medium">Curate and refine your product ecosystem.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-white border border-black/5 rounded-2xl text-sm focus:ring-1 focus:ring-black/10 shadow-sm"
            />
          </div>
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="h-12 px-6 bg-black text-white rounded-2xl font-bold hover:scale-[1.02] shadow-xl shadow-black/10 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-3xl border border-black/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
            <div className="aspect-[3/4] relative overflow-hidden bg-black/[0.02]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <Button 
                  size="icon" 
                  className="bg-white text-black hover:bg-white/90 rounded-xl"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="bg-white text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => handleDeleteProduct(product.id as string)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[90%] font-black uppercase tracking-widest text-[10px] rounded-lg">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-black text-black line-clamp-1 mb-1">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black">${product.price}</span>
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">STOCK: {product.stock || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Fulfillment Center
          </h2>
          <p className="text-black/40 text-sm font-medium">Manage order lifecycles and customer relations.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Reference</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-black">#{order.id?.slice(-8).toUpperCase()}</span>
                    <p className="text-[10px] text-black/30 font-bold mt-1">{order.createdAt?.toDate()?.toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-xs font-black">
                        {order.customerName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-black">{order.customerName}</p>
                        <p className="text-xs text-black/40">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-500' :
                        order.status === 'shipped' ? 'bg-blue-500' :
                        order.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-black">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-black/5 font-bold text-xs uppercase tracking-widest">
                          Audit
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-xl"
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
        submitEditProduct(editingProduct.id, payload);
      } else {
        handleAddProduct(payload);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }} />
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
          <div className="flex h-full">
            <div className="hidden md:block w-72 bg-black p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Diamond className="h-40 w-40 rotate-12" />
              </div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-black tracking-tight leading-tight">
                  Asset <br/> Creation
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">Ensure all technical specifications meet our brand standards for digital representation.</p>
                <div className="space-y-4 pt-10">
                  <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">1</div>
                    <span>Basic Details</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest opacity-30">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">2</div>
                    <span>Specifications</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-black">{isEdit ? "Refine Product" : "Launch Asset"}</h2>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Product Identity</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        required 
                        className="h-12 border-black/5 rounded-xl font-bold bg-black/[0.02]"
                        placeholder="Executive Slim Fit Suit"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Unit Price</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={formData.price} 
                          onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} 
                          required 
                          className="h-12 border-black/5 rounded-xl font-bold bg-black/[0.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Stock Units</Label>
                        <Input 
                          type="number" 
                          value={formData.stock} 
                          onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} 
                          required 
                          className="h-12 border-black/5 rounded-xl font-bold bg-black/[0.02]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Classification</Label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-12 px-4 bg-black/[0.02] border-black/5 rounded-xl font-bold text-sm focus:ring-0"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Narrative</Label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        className="w-full h-32 px-4 py-3 bg-black/[0.02] border-black/5 rounded-xl font-medium text-sm focus:ring-0 resize-none"
                        placeholder="Describe the product's unique value proposition..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Visual Representation</Label>
                    {formData.image ? (
                      <div className="relative aspect-[3/4] bg-black/5 rounded-[2rem] overflow-hidden group shadow-xl">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            type="button"
                            variant="destructive" 
                            className="rounded-2xl font-bold"
                            onClick={() => setFormData({ ...formData, image: "" })}
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] border-4 border-dashed border-black/5 rounded-[2.5rem] bg-black/[0.01] flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-black/[0.03] hover:border-black/10">
                        <ImageUpload onImageUpload={(url) => setFormData({ ...formData, image: url })} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
                    onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
                  >
                    Discard
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-black text-white px-10 font-black uppercase tracking-widest text-xs h-12 rounded-xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all"
                  >
                    {isEdit ? "Apply Changes" : "Commit to Vault"}
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
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-black/5 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tighter">OS CARA</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-4 px-4">Core Intelligence</p>
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
              ].map((item) => (
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-black/40 hover:text-black hover:bg-black/[0.03]"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all ${
                      activeTab === item.id
                        ? "bg-black text-white shadow-xl shadow-black/10"
                        : "text-black/40 hover:text-black hover:bg-black/[0.03]"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                )
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-4 px-4">Management</p>
              {[
                { id: 'products', label: 'Inventory', icon: Box },
                { id: 'orders', label: 'Fulfillment', icon: ClipboardList },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all ${
                    activeTab === item.id
                      ? "bg-black text-white shadow-xl shadow-black/10"
                      : "text-black/40 hover:text-black hover:bg-black/[0.03]"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-4 px-4">System</p>
              <button className="w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-black/40 hover:text-black hover:bg-black/[0.03]">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </div>
          </nav>
          
          <div className="pt-8 border-t border-black/5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-black text-lg">CARA</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black/20">
            <span>Root</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black">Administrative Access</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-black">Administrator</span>
              <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xs">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "orders" && <OrdersContent />}
        </main>
        
        {showAddProduct && <AddProductModal />}
      </div>
    </div>
  );
}
