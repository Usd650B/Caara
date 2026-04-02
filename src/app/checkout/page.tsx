"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Truck, Shield, ArrowLeft, ArrowRight, Gift, CheckCircle2, ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, createOrder } from "@/lib/firestore";
import { calculateShippingCost, getFreeShippingThreshold } from "@/lib/shipping";
import { getCurrentUser } from "@/lib/customer-auth";
import { trackOrderCompleted } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

export default function CheckoutPage() {
  const { formatPrice, t } = useSettings();
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
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
        localStorage.removeItem('cartCount');
        window.dispatchEvent(new CustomEvent('cart-updated'));
        
        // Show success state
        if (result.id) {
          setCreatedOrderId(result.id);
          setIsSuccess(true);
          trackOrderCompleted();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative mx-auto w-24 h-24">
             <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
             <div className="relative flex items-center justify-center w-24 h-24 bg-green-50 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
             </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-black italic">SheDoo</h1>
            <h2 className="text-2xl font-bold text-black">{t("Thank you for your order!")}</h2>
            <p className="text-black/50 text-sm">
              {t("Your order has been placed successfully and is being processed.")}
            </p>
          </div>

          <div className="bg-gray-50 border border-black/5 rounded-2xl p-6 space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-black/40 font-semibold uppercase tracking-wider text-[10px]">{t("Order Number")}</span>
                <span className="text-black font-bold font-mono">#{createdOrderId?.slice(-8).toUpperCase()}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-black/40 font-semibold uppercase tracking-wider text-[10px]">{t("Confirmation")}</span>
                <span className="text-black font-medium">{formData.email}</span>
             </div>
          </div>

          <div className="space-y-3">
             <Link href={`/order-tracking/${createdOrderId}`}>
                <Button className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all">
                   {t("Track Your Order")}
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
             <Link href="/">
                <Button variant="ghost" className="w-full h-12 text-black/50 hover:text-black font-semibold text-sm">
                   {t("Continue Shopping")}
                </Button>
             </Link>
          </div>

          <div className="pt-8 border-t border-black/5 flex items-center justify-center gap-6 opacity-30">
             <Shield className="w-5 h-5" />
             <Truck className="w-5 h-5" />
             <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 sm:py-20 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Simple Header */}
        <div className="mb-10">
          <Link href="/cart" className="text-sm font-semibold text-black/50 hover:text-black transition-colors flex items-center gap-2 mb-6 w-fit">
            <ArrowLeft className="h-4 w-4" /> {t("Return to Bag")}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-black">{t("Checkout")}</h1>
          <p className="text-black/50 text-sm mt-2">
            {t("Please fill in your shipping details")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Form Side - 7 Columns */}
          <div className="lg:col-span-7 space-y-20">
            {/* Delivery Details */}
            <div className="space-y-6">
              <div className="border-b border-black/5 pb-4">
                <h2 className="text-lg font-bold text-black">1. {t("Shipping Address")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("First Name")}</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("Last Name")}</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-black/60">{t("Address")}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("City")}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("State")}</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("Zip")}</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-6 pt-10">
              <div className="border-b border-black/5 pb-4">
                <h2 className="text-lg font-bold text-black">2. {t("Contact Information")}</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black/60">{t("Email Address")}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-black/60">{t("Phone")}</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-black/60">{t("WhatsApp Number")}</Label>
                    <Input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      className="h-12 bg-white border-gray-200 focus:border-black rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final Notes */}
            <div className="space-y-6 pt-10">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-black/60">{t("Additional Notes")}</Label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all h-24 text-sm"
                  placeholder={t("Special instructions for delivery...")}
                />
              </div>
            </div>
          </div>

          {/* Summary Side - 5 Columns */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-black/5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-6">{t("Order Summary")}</h2>
                
                {/* Compact Item List */}
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 scrollbar-hide mb-6 border-b border-black/5 pb-6">
                  {items.map((item: CartItem, index: number) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0 border border-black/5">
                        <img src={item.image || ""} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black truncate">{item.name}</p>
                        <p className="text-[10px] text-black/50 mt-1">
                          {t("QTY")}: {item.quantity} • {item.size}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-black">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-black/60">
                    <span>{t("Subtotal")}</span>
                    <span className="text-black font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-black/60">
                    <span>{t("Shipping")}</span>
                    <span className="text-green-600 font-semibold">{t("Free")}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-black/5">
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-sm font-bold text-black">{t("Total")}</span>
                      <span className="text-2xl font-bold text-black">{formatPrice(total)}</span>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 bg-black text-white hover:bg-black/80 rounded-xl text-sm font-semibold transition-all"
                    >
                      {isSubmitting ? t('Processing...') : t('Complete Order')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust Signal - Simple */}
              <div className="flex items-center justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-black/20">
                 <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <span>{t("SSL SECURE")}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3" />
                    <span>{t("TRACKED DELIVERY")}</span>
                 </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
