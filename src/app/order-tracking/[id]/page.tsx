"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { getOrders, Order } from "@/lib/firestore";

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productImages, setProductImages] = useState<{ [productId: string]: string }>({});

  const loadOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orders = await getOrders();
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder || null);
      // Fetch product images for order items
      if (foundOrder && foundOrder.items) {
        const { getProducts } = await import("@/lib/firestore");
        const products = await getProducts();
        const images: { [productId: string]: string } = {};
        foundOrder.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          images[item.productId] = prod?.image || "https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=200&h=200&fit=crop";
        });
        setProductImages(images);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (params.id && typeof window !== 'undefined') {
      loadOrder(params.id as string);
    }
  }, [params.id]);

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
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' }
    ];

    if (status === 'cancelled') {
      return [
        { key: 'pending', label: 'Order Placed', completed: true },
        { key: 'cancelled', label: 'Cancelled', completed: true }
      ];
    }

    return steps;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <p className="text-gray-600">Order ID: {order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Status */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{order.status}</p>
                    <p className="text-sm text-gray-600">
                      {order.createdAt?.toDate()?.toLocaleDateString()} at {order.createdAt?.toDate()?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                  <div className="space-y-8">
                    {getTimelineSteps(order.status).map((step, index) => (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {step.completed && step.key === order.status && (
                            <p className="text-sm text-gray-600">
                              {order.createdAt?.toDate()?.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerEmail}</p>
                    <p className="text-gray-600">{order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <img
                          src={productImages[item.productId] || "https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=80&h=80&fit=crop"}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover mr-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Size: {item.size || 'N/A'}, Color: {item.color || 'N/A'}, Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(order.total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Contact Support
              </Button>
              <Button className="w-full" variant="outline">
                Print Receipt
              </Button>
              <Button className="w-full" asChild>
                <Link href="/products">
                  Shop Again
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-pink-600" />
                  <span>Track your package in real-time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-pink-600" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-pink-600" />
                  <span>Secure packaging guaranteed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
