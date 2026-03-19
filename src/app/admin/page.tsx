"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Package, ShoppingCart, Users, LogOut, X, Eye, Menu, Home, BarChart3, FileText, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { isSellerAuthenticated, signOutSeller } from "@/lib/auth";
import { getProducts, addProduct, updateProduct, deleteProduct, Product, getOrders, Order, deleteOrder } from "@/lib/firestore";
import { clearAllProducts } from "@/lib/clear-products";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiMediaUpload } from "@/components/ui/multi-media-upload";
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
    } else {
      alert("Failed to add product");
    }
  };

  const handleEditProduct = async (product: Product) => {
    // Replace with a real update in Firebase later, or just reuse a combined Add/Edit for now.
    // For simplicity, we just set editing product to render the same modal but in edit mode
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const submitEditProduct = async (productId: string, updatedData: Partial<Product>) => {
    const result = await updateProduct(productId, updatedData);
    if (result.success) {
      setShowAddProduct(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      alert("Failed to update product: " + (result.error || "Unknown error"));
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
        alert('All products cleared successfully!');
      } else {
        alert('Failed to clear products');
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        loadProducts();
      } else {
        alert('Failed to delete product');
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      const result = await deleteOrder(orderId);
      if (result.success) {
        loadOrders();
        alert('Order deleted successfully!');
      } else {
        alert('Failed to delete order: ' + (result.error || 'Unknown error'));
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage your products and orders</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t ? t("Revenue") : "Revenue"}</p>
              <p className="text-lg font-black text-foreground">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t ? t("Orders") : "Orders"}</p>
              <p className="text-lg font-black text-foreground">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t ? t("Products") : "Products"}</p>
              <p className="text-lg font-black text-foreground">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t ? t("Customers") : "Customers"}</p>
              <p className="text-lg font-black text-foreground">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowAddProduct(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Orders Today</span>
                <span className="font-medium">
                  {orders.filter(order => {
                    const orderDate = order.createdAt?.toDate();
                    return orderDate && orderDate.toDateString() === new Date().toDateString();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products</span>
                <span className="font-medium">{stats.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="font-medium">{stats.totalCustomers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ProductsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" onClick={handleClearProducts}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id as string)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Orders</h2>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 m-auto text-gray-400 mt-2.5" />
                            )}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            +{order.items!.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt?.toDate()?.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/${order.id}`}>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(order.id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const AddProductModal = () => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || "",
      price: editingProduct?.price || 0,
      category: editingProduct?.category || "Dresses",
      image: editingProduct?.image || "",
      description: editingProduct?.description || "",
    });

    const isEdit = !!editingProduct;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.image) {
        alert("Please upload an image first.");
        return;
      }
      
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        description: formData.description,
        sizes: editingProduct?.sizes || ["S", "M", "L"],
        colors: editingProduct?.colors || ["Black", "White"],
        stock: editingProduct?.stock || 100,
        status: editingProduct?.status || 'active' as const
      };

      if (isEdit && editingProduct?.id) {
        submitEditProduct(editingProduct.id, payload);
      } else {
        handleAddProduct(payload);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto m-4">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold">{isEdit ? "Edit Product" : "Add New Product"}</h3>
            <Button variant="ghost" size="icon" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input 
                    id="product-name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required 
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-price">Price ($)</Label>
                    <Input 
                      id="product-price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={formData.price} 
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} 
                      required 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-category">Category</Label>
                    <select 
                      id="product-category"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Dresses">Dresses</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Knitwear">Knitwear</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="product-desc">Description</Label>
                  <textarea 
                    id="product-desc" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-24 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Image</Label>
                {formData.image ? (
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, image: "" })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center h-64">
                    <ImageUpload
                      onImageUpload={(url) => setFormData({ ...formData, image: url })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                {isEdit ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold">CARA Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/admin"
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-black text-white"
          >
            <Home className="mr-3 h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Analytics
          </Link>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Package className="h-4 w-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FileText className="h-4 w-4" />
            Orders
          </button>
        </nav>
        
        <div className="border-t p-4">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div></div>
        </div>

        {/* Admin Content */}
        <div className="p-6">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "orders" && <OrdersContent />}
        </div>
        
        {showAddProduct && <AddProductModal />}
      </div>
    </div>
  );
}
