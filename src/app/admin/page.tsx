"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Package, ShoppingCart, Users, TrendingUp, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, addProduct, Product, getOrders, Order } from "@/lib/firestore";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  }, [router]);

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt?.toDate()?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total.toFixed(2)}</p>
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p>Loading products...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
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
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
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
      sizes: [] as string[],
      colors: [] as string[],
      badge: undefined as "New" | "Sale" | "Premium" | undefined
    });

    const handleImageUpload = (imageUrl: string): void => {
      setFormData(prev => ({ ...prev, image: imageUrl }));
    };

    const handleSizeToggle = (size: string) => {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.includes(size)
          ? prev.sizes.filter(s => s !== size)
          : [...prev.sizes, size]
      }));
    };

    const handleColorToggle = (color: string) => {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.includes(color)
          ? prev.colors.filter(c => c !== color)
          : [...prev.colors, color]
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        stock: parseInt(formData.stock),
        status: formData.status,
        description: formData.description,
        image: formData.image,
        sizes: formData.sizes,
        colors: formData.colors,
        rating: 0,
        reviews: 0,
        badge: formData.badge
      };

      handleAddProduct(productData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="text-2xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Product Image</Label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                />
              </div>

              {/* Product Name & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName" className="font-semibold">Product Name *</Label>
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
                  <Label htmlFor="category" className="font-semibold">Category *</Label>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="font-semibold">Sale Price ($) *</Label>
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
                  <Label htmlFor="originalPrice" className="font-semibold">Original Price ($)</Label>
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
                  <Label htmlFor="stock" className="font-semibold">Stock Quantity *</Label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold block mb-2">Badge</Label>
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
                  <Label className="font-semibold block mb-2">Status</Label>
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
                <Label htmlFor="description" className="font-semibold block mb-2">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <Label className="font-semibold block mb-3">Available Sizes</Label>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`py-2.5 px-3 border rounded-lg font-semibold transition-all ${
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
                <Label className="font-semibold block mb-3">Available Colors</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {["Black", "White", "Pink", "Blue", "Red", "Green", "Yellow", "Purple", "Gray", "Brown"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`py-2.5 px-2 border rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
              <div className="flex gap-3 pt-6 border-t">
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

  const OrdersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button variant="outline" onClick={loadOrders}>
          Refresh Orders
        </Button>
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
                    Customer
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p>Loading orders...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-600">No orders yet</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt?.toDate()?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/order-tracking/${order.id}`)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Update Status
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r flex flex-col py-8 px-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-pink-600">Caara Admin</h1>
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
          {activeTab === "orders" && <OrdersContent />}
        </div>
        {showAddProduct && <AddProductModal />}
      </main>
    </div>
  );
}
