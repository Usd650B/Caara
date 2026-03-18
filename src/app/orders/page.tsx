"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, Eye, ShoppingBag, Home, X } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { downloadReceipt, generateReceiptNumber, ReceiptData } from "@/lib/receipt";

export default function OrderHistoryPage() {
  const { t } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderHistory = () => {
      if (typeof window !== 'undefined') {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        setOrders(orderHistory);
      }
      setIsLoading(false);
    };

    loadOrderHistory();
  }, []);

  const handleDownloadReceipt = (order: Order) => {
    const receiptData: ReceiptData = {
      order,
      receiptNumber: generateReceiptNumber(order.id || ''),
      issuedDate: new Date().toLocaleDateString(),
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      total: order.total || 0
    };
    
    downloadReceipt(receiptData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
          </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/products">
              <Button className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop More
              </Button>
            </Link>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 text-lg">View and manage your order history</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here!</p>
            <Link href="/products">
              <Button className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Orders Summary */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-border">
              <div className="text-center px-2">
                <div className="text-xl font-black text-foreground">{orders.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t("Total Orders")}</div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-black text-green-500">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t("Delivered")}</div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-black text-blue-500">
                  {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t("In Progress")}</div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-black text-foreground">
                  ${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t("Total Spent")}</div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-base tracking-tight">Order #{order.id?.slice(-8).toUpperCase()}</h3>
                        <Badge className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {order.createdAt?.toDate()?.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Package className="h-3 w-3" /> {order.items?.length || 0} {t("items")}</span>
                        <span className="font-bold text-foreground">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/order-tracking/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-lg">
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          {t("Track")}
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleDownloadReceipt(order)} 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-lg"
                      >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        {t("Receipt")}
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-border flex items-center gap-3 overflow-hidden">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 4).map((item, index) => (
                          <div key={index} className="w-8 h-10 rounded-sm border border-background overflow-hidden relative group">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/5"></div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {order.items[0].name} {order.items.length > 1 && `+${order.items.length - 1} more`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
