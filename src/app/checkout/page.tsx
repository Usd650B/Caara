"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Truck, Shield, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, createOrder } from "@/lib/firestore";
import { calculateShippingCost, getFreeShippingThreshold } from "@/lib/shipping";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    whatsapp: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setItems(cartItems);
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const baseShipping = calculateShippingCost(subtotal, formData.state, false);
  const expressShipping = calculateShippingCost(subtotal, formData.state, true);
  const shipping = shippingMethod === "express" ? expressShipping : baseShipping;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  const isEligibleForFreeShipping = subtotal >= getFreeShippingThreshold();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create order in Firestore
    const orderData = {
      customerEmail: formData.email,
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerPhone: formData.phone,
      customerWhatsapp: formData.whatsapp,
      customerLocation: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      items: items.map((item: CartItem, index: number) => ({
        productId: item.id || '',
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        index: index
      })),
      total: total,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      shippingMethod: shippingMethod,
      status: 'pending' as const,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        whatsapp: formData.whatsapp
      },
      notes: formData.notes
    };

    try {
      const result = await createOrder(orderData);
      
      if (result.success) {
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to order tracking
        router.push(`/order-tracking/${result.id}`);
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-gray-600">Complete your order as a guest</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We&apos;ll send order updates to this email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  For quick order updates and support
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEligibleForFreeShipping && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">✓ Free Shipping Eligible!</p>
                  <p className="text-xs text-green-700">Your order qualifies for free standard shipping</p>
                </div>
              )}
              
              <div className="space-y-3">
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${shippingMethod === 'standard' ? 'border-pink-500' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === "standard"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Standard Shipping</p>
                    <p className="text-sm text-gray-600">Delivery in 5-7 business days</p>
                    <p className="text-sm font-bold text-pink-600 mt-1">
                      {baseShipping === 0 ? 'FREE' : `$${baseShipping.toFixed(2)}`}
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${shippingMethod === 'express' ? 'border-pink-500' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold flex items-center">
                      Express Shipping
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2">Fast</span>
                    </p>
                    <p className="text-sm text-gray-600">Delivery in 2-3 business days</p>
                    <p className="text-sm font-bold text-pink-600 mt-1">${expressShipping.toFixed(2)}</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  This is a manual order collection system. Your order will be processed manually and you will be contacted for payment details.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any special requests or notes for your order..."
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm md:text-base"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item: CartItem, index: number) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500">
                          Size: {item.size || 'N/A'}, Color: {item.color || 'N/A'}, Qty: {item.quantity}
                        </p>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Place Order'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Security Info */}
            <div className="text-center text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Secure SSL Encryption</span>
              </div>
              <p>Your payment information is safe and secure</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
