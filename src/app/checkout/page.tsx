"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Truck, Shield, ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag, Lock, Gift, Package, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, createOrder } from "@/lib/firestore";
import { calculateShippingCost, getFreeShippingThreshold } from "@/lib/shipping";
import { getCurrentUser } from "@/lib/customer-auth";
import { trackOrderCompleted, syncCartState, markCartConverted } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

const steps = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Confirm" },
];

export default function CheckoutPage() {
  const { formatPrice, t } = useSettings();
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "",
    address: "", city: "", state: "", zipCode: "",
    phone: "", whatsapp: "", notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setItems(cartItems);
      syncCartState(cartItems, null, formData);
    }

    const currentUser = getCurrentUser();
    const cartInfoString = localStorage.getItem('cartCustomerInfo');
    const cartInfo = cartInfoString ? JSON.parse(cartInfoString) : null;
    
    if (currentUser || cartInfo) {
      if (currentUser) setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        email: currentUser?.email || cartInfo?.email || prev.email,
        firstName: currentUser?.name?.split(' ')[0] || cartInfo?.firstName || prev.firstName,
        lastName: currentUser?.name?.split(' ').slice(1).join(' ') || cartInfo?.lastName || prev.lastName,
        phone: currentUser?.phone || cartInfo?.phone || prev.phone,
      }));
    }
  }, []);

  useEffect(() => {
    if (items.length > 0 && formData.email) {
      const timeoutId = setTimeout(() => {
        syncCartState(items, user, formData);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [items, user, formData.email, formData.firstName]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savedRegion = typeof window !== 'undefined' ? localStorage.getItem('deliveryRegion') : "Dar es salaam";
  const shipping = savedRegion && savedRegion !== "Dar es salaam" ? 3.81 : 0;
  const total = subtotal + shipping;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canAdvance = () => {
    if (activeStep === 1) return formData.firstName && formData.lastName && formData.address && formData.city;
    if (activeStep === 2) return formData.email && formData.phone;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderData = {
      customerEmail: formData.email,
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerPhone: formData.phone,
      customerWhatsapp: formData.whatsapp,
      customerLocation: {
        address: formData.address, city: formData.city,
        state: formData.state, zipCode: formData.zipCode
      },
      items: items.map((item: CartItem, index: number) => ({
        productId: item.id || '', name: item.name, price: item.price,
        quantity: item.quantity, size: item.size, color: item.color,
        image: item.image, index
      })),
      total, subtotal, shipping,
      shippingMethod: savedRegion || 'standard',
      status: 'pending' as const,
      shippingAddress: {
        firstName: formData.firstName, lastName: formData.lastName,
        address: formData.address, city: formData.city,
        state: formData.state, zipCode: formData.zipCode,
        phone: formData.phone, whatsapp: formData.whatsapp
      },
      notes: formData.notes
    };

    try {
      const result = await createOrder(orderData);
      if (result.success) {
        if (typeof window !== 'undefined') {
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          orderHistory.unshift({ ...orderData, id: result.id, createdAt: new Date() });
          if (orderHistory.length > 10) orderHistory.splice(10);
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        }
        localStorage.removeItem('cart');
        localStorage.removeItem('cartCount');
        window.dispatchEvent(new CustomEvent('cart-updated'));
        if (result.id) {
          setCreatedOrderId(result.id);
          setIsSuccess(true);
          markCartConverted();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success Screen ── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-green-50 rounded-full border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>Order Confirmed!</h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Thank you, <span className="font-semibold text-gray-800">{formData.firstName}</span>. Your order has been placed and is being processed.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("Order Number")}</span>
              <span className="text-gray-900 font-bold font-mono">#{createdOrderId?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Confirmation sent to</span>
              <span className="text-gray-700 font-medium text-xs">{formData.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Paid</span>
              <span className="text-gray-900 font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Delivery</span>
              <span className="text-gray-700 text-xs">
                {savedRegion === "Dar es salaam" || !savedRegion ? "2-3 days" : `5-7 days (${savedRegion})`}
              </span>
            </div>
          </div>

          {/* Items ordered */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{totalItems} items ordered</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {items.map((item, i) => (
                <div key={i} className="w-12 h-16 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                  <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link href={`/order-tracking/${createdOrderId}`}>
              <Button className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-semibold flex items-center justify-center gap-2 group">
                Track Your Order <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full h-10 text-gray-500 hover:text-gray-900 font-semibold text-sm">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-gray-300">
            <Shield className="w-4 h-4" />
            <Truck className="w-4 h-4" />
            <Package className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Checkout ── */
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-14">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Nav */}
        <Link href="/cart" className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5 mb-6 w-fit">
          <ArrowLeft className="h-3 w-3" /> Return to Bag
        </Link>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => step.id < activeStep ? setActiveStep(step.id) : null}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeStep === step.id
                    ? 'bg-black text-white shadow-md'
                    : activeStep > step.id
                    ? 'bg-green-50 text-green-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {activeStep > step.id ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{step.id}</span>
                )}
                {step.label}
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1 rounded-full ${activeStep > step.id ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            {/* Step 1: Shipping */}
            {activeStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-400" /> {t("Shipping Address")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("First Name")} *</Label>
                    <Input value={formData.firstName} onChange={e => handleInputChange("firstName", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("Last Name")} *</Label>
                    <Input value={formData.lastName} onChange={e => handleInputChange("lastName", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500">{t("Address")} *</Label>
                  <Input value={formData.address} onChange={e => handleInputChange("address", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("City")} *</Label>
                    <Input value={formData.city} onChange={e => handleInputChange("city", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("State")}</Label>
                    <Input value={formData.state} onChange={e => handleInputChange("state", e.target.value)} className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("Zip")}</Label>
                    <Input value={formData.zipCode} onChange={e => handleInputChange("zipCode", e.target.value)} className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="button" onClick={() => setActiveStep(2)} disabled={!canAdvance()}
                    className="h-11 px-8 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-semibold">
                    Continue to Contact <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {activeStep === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-400" /> {t("Contact Information")}
                </h2>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500">{t("Email Address")} *</Label>
                  <Input type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("Phone")} *</Label>
                    <Input type="tel" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} required className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">{t("WhatsApp")} (optional)</Label>
                    <Input type="tel" value={formData.whatsapp} onChange={e => handleInputChange("whatsapp", e.target.value)} className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500">{t("Delivery Notes")} (optional)</Label>
                  <textarea value={formData.notes || ''} onChange={e => handleInputChange("notes", e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none text-sm h-20 resize-none"
                    placeholder="Special instructions for delivery..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setActiveStep(1)} className="h-11 px-6 text-gray-500 hover:text-gray-900 rounded-xl text-sm font-semibold">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={() => setActiveStep(3)} disabled={!canAdvance()}
                    className="h-11 px-8 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-semibold">
                    Review Order <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {activeStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Shipping To</h3>
                  <p className="text-sm text-gray-900 font-medium">{formData.firstName} {formData.lastName}</p>
                  <p className="text-xs text-gray-500">{formData.address}, {formData.city} {formData.state} {formData.zipCode}</p>
                  <p className="text-xs text-gray-500 mt-1">{formData.email} • {formData.phone}</p>
                  <button type="button" onClick={() => setActiveStep(1)} className="text-[10px] font-semibold text-blue-500 mt-2">Edit address</button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Items ({totalItems})</h3>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity} • {item.size}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setActiveStep(2)} className="h-11 px-6 text-gray-500 hover:text-gray-900 rounded-xl text-sm font-semibold">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}
                    className="h-12 px-8 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-bold flex-1 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><Lock className="h-4 w-4" /> Place Order — {formatPrice(total)}</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t("Order Summary")}</h2>
                
                {/* Compact Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-hide mb-4 pb-4 border-b border-gray-100">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img src={item.image || ""} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.size}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("Subtotal")}</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("Shipping")} {savedRegion && `(${savedRegion})`}</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : "text-gray-900 font-semibold"}>
                      {shipping === 0 ? t("Free") : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-gray-900">{t("Total")}</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-6 text-[9px] font-bold uppercase tracking-widest text-gray-300 py-2">
                <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /><span>SSL Secure</span></div>
                <div className="flex items-center gap-1.5"><Truck className="h-3 w-3" /><span>Tracked</span></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
