"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Package, ShoppingCart, Users, TrendingUp, LogOut, X, Eye, XCircle, MousePointer, DollarSign, Activity, BarChart3, PieChart, TrendingDown, Clock, Filter, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, addProduct, Product, getOrders, Order } from "@/lib/firestore";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiMediaUpload } from "@/components/ui/multi-media-upload";

// Analytics data types
interface AnalyticsData {
  totalVisitors: number;
  activeVisitors: number;
  cartAbandonmentRate: number;
  conversionRate: number;
  topProducts: ProductAnalytics[];
  revenueData: RevenueData[];
  visitorTrends: VisitorTrend[];
  cartActivity: CartActivity[];
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

interface CartActivity {
  id: string;
  timestamp: string;
  items: number;
  value: number;
  status: 'active' | 'abandoned' | 'converted';
  sessionId: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
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

  // Mock analytics data generation
  const generateAnalyticsData = (): AnalyticsData => {
    const mockTopProducts: ProductAnalytics[] = products.slice(0, 5).map((product, index) => ({
      product,
      views: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 500) + 50,
      addToCart: Math.floor(Math.random() * 200) + 20,
      purchases: Math.floor(Math.random() * 100) + 10,
      conversionRate: parseFloat(((Math.random() * 20) + 5).toFixed(2))
    }));

    const mockRevenueData: RevenueData[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10
    }));

    const mockVisitorTrends: VisitorTrend[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      visitors: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 2000) + 500,
      uniqueVisitors: Math.floor(Math.random() * 300) + 50
    }));

    const mockCartActivity: CartActivity[] = Array.from({ length: 50 }, (_, i) => ({
      id: `cart_${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: Math.floor(Math.random() * 5) + 1,
      value: Math.floor(Math.random() * 500) + 50,
      status: Math.random() > 0.7 ? 'abandoned' : Math.random() > 0.3 ? 'converted' : 'active',
      sessionId: `session_${Math.floor(Math.random() * 1000)}`
    }));

    return {
      totalVisitors: Math.floor(Math.random() * 10000) + 5000,
      activeVisitors: Math.floor(Math.random() * 200) + 50,
      cartAbandonmentRate: parseFloat((Math.random() * 30 + 60).toFixed(2)),
      conversionRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
      topProducts: mockTopProducts,
      revenueData: mockRevenueData,
      visitorTrends: mockVisitorTrends,
      cartActivity: mockCartActivity
    };
  };

  useEffect(() => {
    if (!isSellerAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadProducts();
    loadOrders();
    if (products.length > 0) {
      setAnalyticsData(generateAnalyticsData());
    }
  }, [router, products.length]);

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await addProduct(productData);
    if (result.success) {
      setShowAddProduct(false);
      loadProducts(); // Reload products
    } else {
      alert("Failed to add product");
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
        loadProducts(); // Reload products
        alert('All products cleared successfully!');
      } else {
        alert('Failed to clear products');
      }
    }
  };

  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0).toFixed(2),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: new Set(orders.map(order => order.customerEmail)).size
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your business performance and customer behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData?.totalVisitors.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData?.activeVisitors || '0'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <Activity className="inline h-3 w-3 mr-1" />
                  Live visitors
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Abandonment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData?.cartAbandonmentRate || '0'}%
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <TrendingDown className="inline h-3 w-3 mr-1" />
                  +5.2% from last period
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData?.conversionRate || '0'}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2.1% from last period
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue & Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Revenue chart visualization</p>
                <p className="text-sm">Last 7 days performance</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">$12,450</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-lg font-bold text-blue-600">245</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Visitor Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Visitor trends visualization</p>
                <p className="text-sm">30-day overview</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Page Views</p>
                <p className="text-lg font-bold">45.2K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Unique</p>
                <p className="text-lg font-bold">8.7K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Bounce Rate</p>
                <p className="text-lg font-bold">32%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Products Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-center py-3 px-4">Views</th>
                  <th className="text-center py-3 px-4">Clicks</th>
                  <th className="text-center py-3 px-4">Add to Cart</th>
                  <th className="text-center py-3 px-4">Purchases</th>
                  <th className="text-center py-3 px-4">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.topProducts.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">${item.product.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{item.views}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <MousePointer className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{item.clicks}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item.addToCart}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{item.purchases}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.conversionRate > 10 ? 'bg-green-100 text-green-800' :
                        item.conversionRate > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cart Activity & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cart Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData?.cartActivity.slice(0, 5).map((cart) => (
                <div key={cart.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      cart.status === 'converted' ? 'bg-green-500' :
                      cart.status === 'abandoned' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{cart.items} items</p>
                      <p className="text-xs text-gray-500">
                        {new Date(cart.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${cart.value}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cart.status === 'converted' ? 'bg-green-100 text-green-800' :
                      cart.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cart.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt?.toDate()?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ProductsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex space-x-2">
          <Button variant="destructive" onClick={handleClearProducts}>
            Clear All Products
          </Button>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p>Loading products...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p>No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status === 'active' ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={async () => {
                            if (!confirm('Delete this product?')) return;
                            const { deleteProduct } = await import('@/lib/firestore');
                            const res = await deleteProduct(product.id!);
                            if (res.success) loadProducts(); else alert('Failed to delete product');
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const AddProductModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      stock: "",
      status: "active" as "active" | "out-of-stock",
      description: "",
      image: "",
      images: [] as string[],
      video: "",
      sizes: [] as string[],
      colors: [] as string[],
      badge: undefined as "New" | "Sale" | "Premium" | undefined,
    });
    const handleImagesChange = (urls: string[]): void => {
      setFormData(prev => ({ ...prev, images: urls }));
    };
    
    const handleVideoChange = (url: string | null): void => {
      setFormData(prev => ({ ...prev, video: url || "" }));
    };
    
    const handleImageUpload = (imageUrl: string): void => {
      setFormData(prev => ({ ...prev, image: imageUrl }));
    };
    const handleSizeToggle = (size: string) => {
      setFormData(prev => {
        const prevSizes = prev.sizes || [];
        return ({
          ...prev,
          sizes: prevSizes.includes(size) ? prevSizes.filter(s => s !== size) : [...prevSizes, size]
        });
      });
    };
    const handleColorToggle = (color: string) => {
      setFormData(prev => {
        const prevColors = prev.colors || [];
        return ({
          ...prev,
          colors: prevColors.includes(color) ? prevColors.filter(c => c !== color) : [...prevColors, color]
        });
      });
    };
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        stock: parseInt(formData.stock),
        status: formData.status,
        description: formData.description,
        image: formData.images[0] || formData.image, // Use first image as primary
        images: formData.images,
        video: formData.video,
        sizes: formData.sizes,
        colors: formData.colors,
        badge: formData.badge
      };
      
      await handleAddProduct(productData);
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
        <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50 sticky top-0 z-10">
            <CardTitle className="text-xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Multi-Media Upload */}
              <div>
                <MultiMediaUpload 
                  onImagesChange={handleImagesChange}
                  onVideoChange={handleVideoChange}
                  initialImages={formData.images}
                  initialVideo={formData.video}
                />
              </div>

              {/* Product Name & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="productName" className="font-semibold text-sm">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Trendy Summer Dress"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="font-semibold text-sm">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Dresses, Tops, Bottoms"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="price" className="font-semibold text-sm">Sale Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice" className="font-semibold text-sm">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="font-semibold text-sm">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Badge & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="font-semibold text-sm block mb-2">Badge</Label>
                  <select
                    aria-label="Product Badge Selection"
                    value={formData.badge || "none"}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value === "none" ? undefined : e.target.value as "New" | "Sale" | "Premium" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="none">No Badge</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <Label className="font-semibold text-sm block mb-2">Status</Label>
                  <select
                    aria-label="Product Status Selection"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "out-of-stock" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="active">Active</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="font-semibold text-sm block mb-2">Description</Label>
                <textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <Label className="font-semibold text-sm block mb-2">Available Sizes</Label>
                <div className="grid grid-cols-6 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`py-2 px-2 border rounded-lg text-sm font-semibold transition-all ${
                        formData.sizes.includes(size)
                          ? "border-pink-500 bg-pink-100 text-pink-700 shadow-md"
                          : "border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Selection */}
              <div>
                <Label className="font-semibold text-sm block mb-2">Available Colors</Label>
                <div className="grid grid-cols-5 gap-2">
                  {["Black", "White", "Pink", "Blue", "Red", "Green", "Yellow", "Purple", "Gray", "Brown"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`py-2 px-1 border rounded-lg text-xs font-semibold transition-all ${
                        formData.colors.includes(color)
                          ? "border-pink-500 bg-pink-100 text-pink-700 shadow-md"
                          : "border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  Add Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const EditProductModal = () => {
    if (!editProduct) return null;
    const [formData, setFormData] = useState({
      id: editProduct.id,
      name: editProduct.name || "",
      price: editProduct.price?.toString() ?? "",
      originalPrice: editProduct.originalPrice?.toString() ?? "",
      category: editProduct.category || "",
      stock: editProduct.stock?.toString() ?? "0",
      status: editProduct.status || "active",
      description: editProduct.description || "",
      image: editProduct.image || "",
      images: editProduct.images || [],
      video: editProduct.video || "",
      sizes: editProduct.sizes || [],
      colors: editProduct.colors || [],
      badge: editProduct.badge
    });

    const handleImagesChange = (urls: string[]): void => {
      setFormData(prev => ({ ...prev, images: urls }));
    };
    
    const handleVideoChange = (url: string | null): void => {
      setFormData(prev => ({ ...prev, video: url || "" }));
    };
    
    const handleImageUpload = (imageUrl: string): void => {
      setFormData(prev => ({ ...prev, image: imageUrl }));
    };

    const handleSizeToggle = (size: string) => {
      setFormData(prev => {
        const prevSizes = prev.sizes || [];
        return ({
          ...prev,
          sizes: prevSizes.includes(size) ? prevSizes.filter(s => s !== size) : [...prevSizes, size]
        });
      });
    };

    const handleColorToggle = (color: string) => {
      setFormData(prev => {
        const prevColors = prev.colors || [];
        return ({
          ...prev,
          colors: prevColors.includes(color) ? prevColors.filter(c => c !== color) : [...prevColors, color]
        });
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Edit form submitted');
      console.log('Form data:', formData);
      console.log('Edit product ID:', editProduct?.id);
      
      // Basic validation
      if (!formData.name || !formData.price || !formData.category) {
        alert('Please fill in all required fields (name, price, category)');
        return;
      }
      
      const updatedProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        stock: parseInt(formData.stock),
        status: formData.status as Product['status'],
        description: formData.description,
        image: formData.images[0] || formData.image, // Use first image as primary
        images: formData.images,
        video: formData.video,
        sizes: formData.sizes,
        colors: formData.colors,
        badge: formData.badge
      };
      
      console.log('Updating product with data:', updatedProduct);
      
      const { updateProduct } = await import("@/lib/firestore");
      const result = await updateProduct(editProduct.id!, updatedProduct);
      console.log('Update result:', result);
      
      if (result.success) {
        setEditProduct(null);
        loadProducts();
        alert('Product updated successfully!');
      } else {
        console.error('Update failed:', result.error);
        alert("Failed to update product: " + (result.error || 'Unknown error'));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50 sticky top-0 z-10">
            <CardTitle className="text-xl">Edit Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-2 block">Product Media</Label>
                <MultiMediaUpload 
                  onImagesChange={handleImagesChange}
                  onVideoChange={handleVideoChange}
                  initialImages={formData.images}
                  initialVideo={formData.video}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="font-semibold text-sm">Product Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="mt-1" />
                </div>
                <div>
                  <Label className="font-semibold text-sm">Category *</Label>
                  <Input value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="font-semibold">Sale Price ($) *</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required className="mt-1" />
                </div>
                <div>
                  <Label className="font-semibold">Original Price ($)</Label>
                  <Input type="number" step="0.01" value={formData.originalPrice} onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="font-semibold">Stock Quantity *</Label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))} required className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold block mb-2">Badge</Label>
                  <select aria-label="Product Badge Selection" value={formData.badge || "none"} onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value === "none" ? undefined : e.target.value as "New" | "Sale" | "Premium" }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="none">No Badge</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <Label className="font-semibold block mb-2">Status</Label>
                  <select aria-label="Product Status Selection" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "out-of-stock" }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="active">Active</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="font-semibold block mb-2">Description</Label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description..." className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <Label className="font-semibold block mb-3">Available Sizes</Label>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {["XS","S","M","L","XL","XXL"].map(size => (
                    <button key={size} type="button" onClick={() => handleSizeToggle(size)} className={`py-2.5 px-3 border rounded-lg font-semibold ${formData.sizes.includes(size) ? 'border-pink-500 bg-pink-100' : 'border-gray-300'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold block mb-3">Available Colors</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {["Black","White","Pink","Blue","Red","Green","Yellow","Purple","Gray","Brown"].map(color => (
                    <button key={color} type="button" onClick={() => handleColorToggle(color)} className={`py-2.5 px-2 border rounded-lg text-xs ${formData.colors.includes(color) ? 'border-pink-500 bg-pink-100' : 'border-gray-300'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setEditProduct(null)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const OrdersContent = ({ orders, isLoading }: { orders: Order[], isLoading: boolean }) => {
    const [orderSearchTerm, setOrderSearchTerm] = useState<string>("");
    const [orderFilterStatus, setOrderFilterStatus] = useState<string>("");
    const [trackingNumbers, setTrackingNumbers] = useState<{[key: string]: string}>({});
    const filteredOrders: Order[] = orders.filter((order: Order) => {
      const matchesSearch = order.customerName?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(orderSearchTerm.toLowerCase());
      const matchesStatus = !orderFilterStatus || order.status === orderFilterStatus;
      return matchesSearch && matchesStatus;
    });
    function handleExportCSV(): void {
      const csvRows = [
        ["Order ID","Customer Name","Customer Email","Date","Total","Status"],
        ...filteredOrders.map((order: Order) => [
          order.id,
          order.customerName,
          order.customerEmail,
          order.createdAt?.toDate()?.toLocaleDateString() || "",
          order.total,
          order.status
        ])
      ];
      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Orders</h2>
          <Button variant="outline" onClick={loadOrders}>Refresh Orders</Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search orders by customer, email, or ID"
            value={orderSearchTerm}
            onChange={e => setOrderSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <select value={orderFilterStatus} onChange={e => setOrderFilterStatus(e.target.value)} className="border rounded px-2" title="Order Status Filter">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">In Progress</option>
            <option value="shipped">Delivered</option>
            <option value="delivered">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p>Loading orders...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-gray-600">No orders yet</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={item.image || '/placeholder-product.png'}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-lg border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.name}
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg border flex items-center justify-center text-xs font-medium text-gray-600">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {order.customerPhone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="h-3 w-3 mr-1">📞</span>
                              {order.customerPhone}
                            </div>
                          )}
                          {order.customerWhatsapp && (
                            <div className="flex items-center text-sm text-green-600">
                              <span className="h-3 w-3 mr-1">💬</span>
                              {order.customerWhatsapp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          <div>{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                          <div className="text-xs text-gray-500">{order.shippingAddress?.zipCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt?.toDate()?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          title="Order Status"
                          onChange={async (e) => {
                            const status = e.target.value as Order['status'];
                            const { updateOrder } = await import("@/lib/firestore");
                            const result = await updateOrder(order.id!, { status });
                            if (result.success) loadOrders();
                            else alert("Failed to update order status");
                          }}
                          className={`px-2 py-1 text-xs rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">In Progress</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                          >
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };
  // End of OrdersContent

  const OrderDetailsModal = () => {
    if (!selectedOrder || !showOrderDetails) return null;

    const [trackingNumber, setTrackingNumber] = useState("");
    const [notes, setNotes] = useState("");

    const handleUpdateStatus = async (newStatus: Order['status']) => {
      const { updateOrder } = await import("@/lib/firestore");
      const result = await updateOrder(selectedOrder.id!, { status: newStatus });
      if (result.success) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        loadOrders();
      } else {
        alert("Failed to update order status");
      }
    };

    const handleAddTracking = async () => {
      if (!trackingNumber.trim()) return;
      
      const { updateOrder } = await import("@/lib/firestore");
      const result = await updateOrder(selectedOrder.id!, { 
        trackingNumber: trackingNumber.trim(),
        status: 'shipped'
      });
      if (result.success) {
        setSelectedOrder(prev => prev ? { ...prev, trackingNumber: trackingNumber.trim(), status: 'shipped' } : null);
        setTrackingNumber("");
        loadOrders();
      } else {
        alert("Failed to add tracking number");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Order Details: {selectedOrder.id}</CardTitle>
              <Button variant="ghost" onClick={() => setShowOrderDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Order Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Order Status</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Placed on {selectedOrder.createdAt?.toDate()?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button onClick={() => handleUpdateStatus('processing')}>
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button onClick={() => handleUpdateStatus('shipped')}>
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button onClick={() => handleUpdateStatus('delivered')}>
                      Mark as Delivered
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => handleUpdateStatus('cancelled')}>
                    Cancel Order
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.shippingAddress.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Products</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image || '/placeholder-product.png'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.png';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} | Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Information */}
            {selectedOrder.status !== 'pending' && selectedOrder.status !== 'cancelled' && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Tracking Information</h3>
                <div className="space-y-4">
                  {selectedOrder.trackingNumber ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        Tracking Number: <span className="font-mono font-bold">{selectedOrder.trackingNumber}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddTracking} disabled={!trackingNumber.trim()}>
                        Add Tracking
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-pink-600">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r flex flex-col py-8 px-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-pink-600">CARA Admin</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            <TrendingUp className="h-5 w-5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            <Package className="h-5 w-5" /> Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-pink-50"
            }`}
          >
            <ShoppingCart className="h-5 w-5" /> Orders
          </button>
        </nav>
        <div className="mt-auto">
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Content */}
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "orders" && <OrdersContent orders={orders} isLoading={isLoading} />}
        </div>
        {showAddProduct && <AddProductModal />}
        {editProduct && <EditProductModal />}
        {showOrderDetails && <OrderDetailsModal />}
      </main>
    </div>
  );
}
