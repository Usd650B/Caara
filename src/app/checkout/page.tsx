"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Truck, Shield, ArrowLeft, ArrowRight, Gift } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, createOrder } from "@/lib/firestore";
import { calculateShippingCost, getFreeShippingThreshold } from "@/lib/shipping";
import { getCurrentUser } from "@/lib/customer-auth";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
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

    // Pre-fill user data if logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || prev.email,
        firstName: currentUser.name?.split(' ')[0] || prev.firstName,
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || prev.lastName,
        phone: currentUser.phone || prev.phone,
      }));
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Always free shipping
  const total = subtotal;

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
        image: item.image,
        index: index
      })),
      total: total,
      subtotal: subtotal,
      shipping: 0,
      shippingMethod: 'free',
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
        // Save order to localStorage for history tracking
        if (typeof window !== 'undefined') {
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          const newOrder = {
            ...orderData,
            id: result.id,
            createdAt: new Date()
          };
          
          // Add new order to the beginning
          orderHistory.unshift(newOrder);
          
          // Keep only last 10 orders
          if (orderHistory.length > 10) {
            orderHistory.splice(10);
          }
          
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        }
        
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
    <div className="min-h-screen bg-background py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <Link href="/cart" className="inline-flex items-center text-primary hover:opacity-80 transition-opacity mb-4 font-semibold group">
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Complete <span className="gradient-text">Your Order</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-light">
            {user ? `Secure checkout for ${user.name || user.email}` : "Secure checkout as a guest"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="glass p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center tracking-tight">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send order updates and tracking details to this email
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center tracking-tight">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp Number (Optional)</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    className="bg-background/50 border-border focus:ring-primary h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info - Simplified since it's free */}
            <div className="gradient-bg p-6 sm:p-8 rounded-3xl text-white shadow-2xl flex items-center justify-between overflow-hidden relative group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Free Premium Shipping</h3>
                  <p className="text-white/80 font-light">Your order qualifies for complimentary express delivery</p>
                </div>
              </div>
              <div className="hidden sm:block relative z-10">
                <span className="px-4 py-2 bg-white text-primary font-bold rounded-full text-sm uppercase tracking-widest shadow-xl">FREE</span>
              </div>
            </div>

            {/* Order Notes */}
            <div className="glass p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Order Information</h2>
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-primary text-sm sm:text-base leading-relaxed">
                This is a manual order collection system. Your order will be processed manually and our concierge will contact you for payment arrangements.
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Notes (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any special requests or styling notes for your order..."
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base transition-all h-32"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-8">
              <div className="glass p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <h2 className="text-2xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item: CartItem, index: number) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center space-x-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-light">
                          {item.size} / {item.color} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-black gradient-text mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-6 pt-6 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-light">Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-light text-muted-foreground">Shipping</span>
                    <span className="text-xs font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-widest">Free</span>
                  </div>
                </div>

                <div className="border-t border-border mt-6 pt-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-lg font-bold tracking-tight">Total</span>
                    <span className="text-2xl font-black gradient-text group-hover:scale-110 transition-transform">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full gradient-bg text-white hover:opacity-90 h-14 rounded-2xl text-lg font-bold shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                {isSubmitting ? 'Processing...' : (
                  <span className="flex items-center justify-center">
                    Place Your Order
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              {/* Security Info */}
              <div className="glass p-4 rounded-2xl flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure SSL</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] items-center text-muted-foreground uppercase tracking-tighter">Global Payments Safe</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
