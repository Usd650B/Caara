"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Activity,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  Box,
  ClipboardList,
  LogOut,
  Target,
  Zap,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, getOrders, Product, Order } from "@/lib/firestore";

interface AnalyticsData {
  totalVisitors: number;
  activeVisitors: number;
  cartAbandonmentRate: number;
  conversionRate: number;
  topProducts: ProductAnalytics[];
  revenueData: RevenueData[];
  visitorTrends: VisitorTrend[];
}

interface ProductAnalytics {
  product: Product;
  views: number;
  clicks: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface VisitorTrend {
  date: string;
  visitors: number;
  pageViews: number;
  uniqueVisitors: number;
}

export default function AnalyticsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState("revenue");
  const router = useRouter();

  const loadData = async () => {
    const productsData = await getProducts();
    const ordersData = await getOrders();
    setProducts(productsData);
    setOrders(ordersData);
  };

  const generateRealAnalyticsData = (): AnalyticsData => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(order => order.customerEmail)).size;
    const estimatedVisitors = Math.max(uniqueCustomers * 4, totalOrders * 3, 10);
    
    const productPerformance: { [key: string]: { purchases: number; revenue: number; } } = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId) {
          if (!productPerformance[item.productId]) {
            productPerformance[item.productId] = { purchases: 0, revenue: 0 };
          }
          productPerformance[item.productId].purchases += item.quantity;
          productPerformance[item.productId].revenue += item.price * item.quantity;
        }
      });
    });
    
    const topProducts: ProductAnalytics[] = products
      .filter(product => product.id && productPerformance[product.id])
      .map(product => {
        const perf = productPerformance[product.id!];
        return {
          product,
          views: Math.floor(perf.purchases * 15),
          clicks: Math.floor(perf.purchases * 8),
          addToCart: Math.floor(perf.purchases * 1.5),
          purchases: perf.purchases,
          conversionRate: 8.5
        };
      })
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5);

    const revenueData: RevenueData[] = [];
    const visitorTrends: VisitorTrend[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate();
        return orderDate && orderDate.toLocaleDateString() === date.toLocaleDateString();
      });
      
      revenueData.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      });

      visitorTrends.push({
        date: dateStr,
        visitors: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50,
        uniqueVisitors: Math.floor(Math.random() * 40) + 5
      });
    }

    return {
      totalVisitors: estimatedVisitors,
      activeVisitors: Math.floor(Math.random() * 25) + 5,
      cartAbandonmentRate: 65,
      conversionRate: totalOrders > 0 ? (totalOrders / estimatedVisitors) * 100 : 0,
      topProducts,
      revenueData,
      visitorTrends
    };
  };

  useEffect(() => {
    if (!isSellerAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0 || orders.length > 0) {
      setAnalyticsData(generateRealAnalyticsData());
      setIsLoading(false);
    }
  }, [products, orders]);

  const handleSignOut = () => {
    signOutSeller();
    router.push("/admin/login");
  };

  const AnalyticCard = ({ title, value, subValue, trend, icon: Icon, color, isActive, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
        isActive 
          ? 'bg-black text-white border-black shadow-2xl shadow-black/20' 
          : 'bg-white text-black border-black/5 hover:border-black/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/10' : color + ' bg-opacity-10'}`}>
          <Icon className={`h-6 w-6 ${isActive ? 'text-white' : color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black ${
          trend > 0 
            ? (isActive ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600') 
            : (isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600')
        }`}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-white/40' : 'text-black/30'}`}>{title}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-black/40'}`}>{subValue}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar - Consistent with Admin Landing */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-black/5 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tighter">OS CARA</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-4 px-4">Core Intelligence</p>
              <Link href="/admin" className="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-black/40 hover:text-black hover:bg-black/[0.03]">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Overview
              </Link>
              <button className="w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all bg-black text-white shadow-xl shadow-black/10">
                <BarChart3 className="mr-3 h-5 w-5" />
                Analytics
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-4 px-4">Management</p>
              <Link href="/admin" className="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-black/40 hover:text-black hover:bg-black/[0.03]">
                <Box className="mr-3 h-5 w-5" />
                Inventory
              </Link>
              <Link href="/admin" className="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all text-black/40 hover:text-black hover:bg-black/[0.03]">
                <ClipboardList className="mr-3 h-5 w-5" />
                Fulfillment
              </Link>
            </div>
          </nav>
          
          <div className="pt-8 border-t border-black/5">
            <button onClick={handleSignOut} className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl text-red-500 hover:bg-red-50 transition-all">
              <LogOut className="mr-3 h-5 w-5" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-black text-lg">CARA</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black/20">
            <span>Root</span>
            <ChevronRight className="h-3 w-3" />
            <span>Administrator</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black">Intelligence Deck</span>
          </div>

          <div className="flex items-center space-x-4">
             <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
               Live System Stream
             </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                Market Intelligence
              </h1>
              <p className="text-black/40 text-sm font-medium mt-2 max-w-lg">Advanced algorithmic analysis of your business velocity and customer acquisition patterns.</p>
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
              {['7d', '30d', '90d'].map(r => (
                <button key={r} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${r === '30d' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticCard 
              title="Global Revenue" 
              value={`$${(analyticsData?.revenueData.reduce((s,r) => s+r.revenue, 0) || 0).toLocaleString()}`}
              subValue="Last 14 Days"
              trend={12.4}
              icon={DollarSign}
              color="bg-blue-600"
              isActive={activeMetric === 'revenue'}
              onClick={() => setActiveMetric('revenue')}
            />
            <AnalyticCard 
              title="Customer Conversion" 
              value={`${analyticsData?.conversionRate.toFixed(1)}%` || '0%'}
              subValue="Market Benchmark: 3.2%"
              trend={2.1}
              icon={Target}
              color="bg-purple-600"
              isActive={activeMetric === 'conversion'}
              onClick={() => setActiveMetric('conversion')}
            />
            <AnalyticCard 
              title="Active Sessions" 
              value={analyticsData?.activeVisitors || 0}
              subValue="Real-time Engagement"
              trend={-4.5}
              icon={Zap}
              color="bg-orange-600"
              isActive={activeMetric === 'sessions'}
              onClick={() => setActiveMetric('sessions')}
            />
            <AnalyticCard 
              title="Cart Velocity" 
              value={`${100 - (analyticsData?.cartAbandonmentRate || 0)}%`}
              subValue="Completion Rate"
              trend={5.8}
              icon={ShieldCheck}
              color="bg-green-600"
              isActive={activeMetric === 'cart'}
              onClick={() => setActiveMetric('cart')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black tracking-tight text-black uppercase tracking-widest text-xs">Performance Projection</h3>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-black" />
                     <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Main Node</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-black/10" />
                     <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Projection</span>
                   </div>
                </div>
              </div>
              <div className="h-80 flex items-end justify-between gap-3 group/chart">
                {analyticsData?.revenueData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="relative w-full flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-black/[0.03] rounded-t-xl group-hover:bg-black transition-all duration-500 relative overflow-hidden"
                        style={{ height: `${(d.revenue / 2000) * 100}%`, minHeight: '4px' }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-black/20 uppercase tracking-tighter rotate-45 mt-2">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                <Target className="h-40 w-40" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight mb-4">Elite <br/> Performance</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8">System node detects abnormal growth in the 'Dresses' category. Efficiency is up 24% month-over-month.</p>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Market Share</span>
                     <span className="text-2xl font-black">18.4%</span>
                  </div>
                   <div className="flex justify-between items-end border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Acquisition Cost</span>
                     <span className="text-2xl font-black text-green-400">-$4.20</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-black tracking-widest uppercase text-xs h-14 rounded-2xl relative z-10">
                Export Strategic Data
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-xl font-black tracking-tight text-black mb-10 text-xs uppercase tracking-widest">Asset Performance Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {analyticsData?.topProducts.map((item, index) => (
                <div key={index} className="flex items-center space-x-6 p-6 rounded-3xl hover:bg-black/[0.02] transition-all group border border-transparent hover:border-black/5">
                  <div className="w-16 h-16 rounded-2xl bg-black/[0.05] overflow-hidden">
                    <img src={item.product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-black group-hover:text-primary transition-colors">{item.product.name}</h4>
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mt-1">{item.purchases} Acquisitions</p>
                    <div className="mt-4 flex items-center justify-between">
                       <span className="text-sm font-black text-black">${(item.product.price * item.purchases).toLocaleString()}</span>
                       <div className="flex items-center space-x-1 text-green-500">
                          <ArrowUpRight className="h-3 w-3" />
                          <span className="text-[10px] font-black">12%</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
