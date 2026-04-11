"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, X, Truck, Shield, CheckCircle, Lock, Gift, Users, Tag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings";
import { syncCartState } from "@/lib/analytics";
import { getBestDiscount, getSignupBonus, getReferralBonus, applyReferralCode, clearReferralBonus, shouldShowInvitePrompt, dismissInvitePrompt } from "@/lib/bonus";
import { validateReferralCode } from "@/lib/referral";
import { getCurrentUser } from "@/lib/customer-auth";
import { openAuthModal } from "@/components/ui/global-auth-modal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  quantity: number;
  size: string;
  color: string;
  rating?: number;
  reviews?: number;
}

export default function CartPage() {
  const { t, formatPrice } = useSettings();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [identityData, setIdentityData] = useState({
    firstName: "",
    email: "",
    phone: ""
  });

  // Bonus state
  const [referralInput, setReferralInput] = useState("");
  const [referralStatus, setReferralStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [referralError, setReferralError] = useState("");
  const [showInviteBanner, setShowInviteBanner] = useState(false);
  const [bonusInfo, setBonusInfo] = useState<ReturnType<typeof getBestDiscount> | null>(null);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    setIsLoading(false);
  };

  const refreshBonusInfo = () => {
    const subtotal = JSON.parse(localStorage.getItem('cart') || '[]')
      .reduce((t: number, i: any) => t + (i.price * i.quantity), 0);
    setBonusInfo(getBestDiscount(subtotal));
    setShowInviteBanner(shouldShowInvitePrompt() && !getReferralBonus());
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCartItems();
      refreshBonusInfo();
    
      const handleCartUpdate = () => { loadCartItems(); refreshBonusInfo(); };
      window.addEventListener('cart-updated', handleCartUpdate);
      window.addEventListener('storage', handleCartUpdate);
      
      return () => {
        window.removeEventListener('cart-updated', handleCartUpdate);
        window.removeEventListener('storage', handleCartUpdate);
      };
    }
  }, []);

  // Recalculate bonus when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
      setBonusInfo(getBestDiscount(subtotal));
    }
  }, [cartItems]);

  const updateQuantity = (id: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item => 
      item.id === id && item.size === size && item.color === color
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    syncCartState(updatedCart);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const removeItem = (id: string, size: string, color: string) => {
    const updatedCart = cartItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    syncCartState(updatedCart);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const getTotalPrice = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
    syncCartState([]);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  // Referral code handler
  const handleApplyReferral = async () => {
    const code = referralInput.trim().toUpperCase();
    if (!code) return;
    
    setReferralStatus("checking");
    setReferralError("");
    
    const result = await validateReferralCode(code);
    if (result.valid) {
      applyReferralCode(code, result.referrerName || "Friend");
      setReferralStatus("valid");
      refreshBonusInfo();
      setShowInviteBanner(false);
    } else {
      setReferralStatus("invalid");
      setReferralError("Invalid or expired referral code.");
    }
  };

  const handleRemoveReferral = () => {
    clearReferralBonus();
    setReferralInput("");
    setReferralStatus("idle");
    refreshBonusInfo();
  };

  const handleDismissInvite = () => {
    dismissInvitePrompt();
    setShowInviteBanner(false);
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityData.email || !identityData.firstName) return;
    const contactInfo = {
      email: identityData.email,
      firstName: identityData.firstName,
      lastName: '',
      phone: identityData.phone,
    };
    localStorage.setItem('cartCustomerInfo', JSON.stringify(contactInfo));
    await syncCartState(cartItems, null, contactInfo);
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="space-y-4">
              {[1,2].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Your bag is empty")}</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">{t("Looks like you haven't added anything to your cart yet. Browse our collection and find something you love.")}</p>
          <Link href="/products">
            <Button className="btn-primary h-14 px-10 text-base mt-2">
              {t("Explore Collection")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const savedRegion = typeof window !== 'undefined' ? localStorage.getItem('deliveryRegion') : "Dar es salaam";
  const shippingCost = savedRegion && savedRegion !== "Dar es salaam" ? 3.81 : 0;
  const subtotal = getTotalPrice();
  const discount = bonusInfo || getBestDiscount(subtotal);
  const finalTotal = subtotal + shippingCost - discount.amount;

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-14">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Bag</span>
        </div>

        {/* ═══ INVITE FRIENDS BANNER ═══ */}
        {showInviteBanner && (
          <div className="mb-6 relative bg-gradient-to-r from-[var(--brand-dark)] to-[var(--brand-dark-light)] text-white rounded-xl p-5 flex items-center justify-between gap-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--brand-accent)' }} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-accent)' }}>
                <Users className="h-5 w-5 text-[var(--brand-dark)]" />
              </div>
              <div>
                <p className="text-sm font-bold mb-0.5">Buy with friends, save 15%!</p>
                <p className="text-[11px] text-white/60">Invite up to 5 friends — you both get 15% off your purchase.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10 shrink-0">
              <button
                onClick={() => { const u = getCurrentUser(); if (!u) openAuthModal(); else window.location.href = '/#offers'; }}
                className="bg-[var(--brand-accent)] text-[var(--brand-dark)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
              >
                Invite Now
              </button>
              <button onClick={handleDismissInvite} className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{t("Shopping Bag")}</h1>
            <p className="text-sm text-gray-500 mt-1">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Items Column */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${item.color}-${index}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 group hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4 sm:gap-5">
                  {/* Image */}
                  <Link href={`/products/${item.id}`} className="w-20 sm:w-24 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-200" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{t(item.category)}</p>
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="p-1.5 -mr-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Variant */}
                      <div className="flex gap-3 mt-2">
                        {item.color && (
                          <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{t(item.color)}</span>
                        )}
                        {item.size && (
                          <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{item.size}</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: quantity + price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-xs text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear cart */}
            <div className="text-center pt-2">
              <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                {t("Clear all items")}
              </button>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">

              {/* ═══ REFERRAL CODE INPUT ═══ */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Promo / Referral Code
                </h3>
                
                {getReferralBonus() ? (
                  // Show applied referral
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">{getReferralBonus()?.code}</p>
                        <p className="text-[10px] text-emerald-600">15% off applied!</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveReferral} className="text-emerald-400 hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={referralInput}
                      onChange={(e) => { setReferralInput(e.target.value.toUpperCase()); setReferralStatus("idle"); }}
                      className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[var(--brand-primary)] transition-colors placeholder:text-gray-300 placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      onClick={handleApplyReferral}
                      disabled={referralStatus === "checking" || !referralInput.trim()}
                      className="h-10 px-4 bg-[var(--brand-dark)] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[var(--brand-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {referralStatus === "checking" ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {referralStatus === "invalid" && (
                  <p className="text-[10px] text-red-500 mt-2 font-medium">{referralError}</p>
                )}
              </div>

              {/* ═══ ORDER SUMMARY ═══ */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("Order Summary")}</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("Subtotal")}</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("Shipping")} {savedRegion && `(${savedRegion})`}</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-semibold" : "text-gray-900 font-semibold"}>
                      {shippingCost === 0 ? t("Free") : formatPrice(shippingCost)}
                    </span>
                  </div>

                  {/* Bonus Discount Line */}
                  {discount.amount > 0 && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <Gift className="h-3 w-3" />
                        {discount.label}
                      </span>
                      <span className="text-emerald-600 font-bold">-{formatPrice(discount.amount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-baseline mb-5">
                    <span className="text-sm font-bold text-gray-900">{t("Total")}</span>
                    <div className="text-right">
                      {discount.amount > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">{formatPrice(subtotal + shippingCost)}</span>
                      )}
                      <span className="text-xl font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Savings badge */}
                  {discount.amount > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[11px] font-bold text-emerald-700">
                        You're saving {formatPrice(discount.amount)} with your {discount.type === 'signup' ? 'signup' : 'referral'} bonus!
                      </span>
                    </div>
                  )}

                  {/* No bonus? Show hint */}
                  {discount.amount === 0 && !getReferralBonus() && (
                    <div className="flex items-center gap-2 bg-[var(--brand-accent-50)] border border-[var(--brand-accent)]/10 rounded-lg px-3 py-2 mb-4">
                      <Gift className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                      <span className="text-[11px] text-[var(--brand-dark-soft)]">
                        <strong>Tip:</strong> Sign up for 10% off or enter a referral code for 15% off!
                      </span>
                    </div>
                  )}

                  <Button 
                    onClick={() => setShowIdentityModal(true)}
                    className="btn-primary w-full h-14 text-base shadow-xl group"
                  >
                    {t("Proceed to Checkout")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                {[
                  { icon: Truck, text: "Free shipping to Dar es Salaam", color: "text-green-500" },
                  { icon: Shield, text: "Buyer protection guarantee", color: "text-blue-500" },
                  { icon: Lock, text: "Secure SSL checkout", color: "text-gray-500" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${color} shrink-0`} />
                    <span className="text-xs text-gray-500">{text}</span>
                  </div>
                ))}
              </div>

              {/* Estimated Delivery */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-800">Estimated Delivery</span>
                </div>
                <p className="text-[11px] text-green-700 ml-6">
                  {savedRegion === "Dar es salaam" || !savedRegion
                    ? "2-3 business days (Dar es Salaam)"
                    : `5-7 business days (${savedRegion})`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Capture Modal */}
      {showIdentityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIdentityModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowIdentityModal(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1.5" style={{ fontFamily: 'var(--font-playfair)' }}>Almost there!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Provide your details so we can secure your items.</p>
            </div>
            
            <form onSubmit={handleIdentitySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name *</Label>
                <Input 
                  required
                  placeholder="e.g. Jane Doe"
                  value={identityData.firstName}
                  onChange={e => setIdentityData({...identityData, firstName: e.target.value})}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address *</Label>
                <Input 
                  required
                  type="email"
                  placeholder="e.g. jane@example.com"
                  value={identityData.email}
                  onChange={e => setIdentityData({...identityData, email: e.target.value})}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone (Optional)</Label>
                <Input 
                  type="tel"
                  placeholder="+255 7XX XXX XXX"
                  value={identityData.phone}
                  onChange={e => setIdentityData({...identityData, phone: e.target.value})}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 text-sm"
                />
              </div>

              <div className="pt-3">
                <Button type="submit" className="btn-primary w-full h-14 text-base shadow-xl group">
                  Continue to Checkout <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-400 pt-1">Your data is secure and encrypted.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
