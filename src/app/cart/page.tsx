"use client"

import { useState, useEffect } from "react";
import { 
  Minus, Plus, ShoppingBag, ArrowRight, X, Truck, Shield, 
  CheckCircle, Gift, Users, Tag, Sparkles, ArrowLeft, Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings";
import { syncCartState } from "@/lib/analytics";
import { 
  getBestDiscount, getReferralBonus, applyReferralCode, 
  clearReferralBonus, shouldShowInvitePrompt, dismissInvitePrompt,
  grantSignupBonus, syncReferralBonus
} from "@/lib/bonus";
import { validateReferralCode } from "@/lib/referral";
import { getCurrentUser } from "@/lib/customer-auth";
import { openAuthModal } from "@/components/ui/global-auth-modal";
import { ReferralInvite } from "@/components/ui/referral-invite";
import WhatsAppButton from "@/components/ui/whatsapp-button";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  size: string;
  color: string;
  category: string;
}

export default function CartPage() {
  const { t, formatPrice } = useSettings();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [identityData, setIdentityData] = useState({ firstName: "", email: "", phone: "" });
  const [referralInput, setReferralInput] = useState("");
  const [referralStatus, setReferralStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [showInviteBanner, setShowInviteBanner] = useState(false);
  const [bonusInfo, setBonusInfo] = useState<any>(null);

  const loadCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    } catch (e) {
      console.error("Failed to load cart", e);
      setCartItems([]);
    }
    setIsLoading(false);
  };

  const refreshBonusInfo = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = items.reduce((t: number, i: any) => t + (i.price * i.quantity), 0);
    setBonusInfo(getBestDiscount(subtotal));
    setShowInviteBanner(shouldShowInvitePrompt() && !getReferralBonus());
  };

  useEffect(() => {
    loadCartItems();
    refreshBonusInfo();
    
    // Ensure bonuses are applied for logged in users
    const user = getCurrentUser();
    if (user) {
      grantSignupBonus();
      syncReferralBonus(user.email, user.name || "").then(() => {
        refreshBonusInfo();
      });
    }

    window.addEventListener('cart-updated', loadCartItems);
    return () => window.removeEventListener('cart-updated', loadCartItems);
  }, []);

  const updateQuantity = (id: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item => 
      (item.id === id && item.size === size && item.color === color)
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updatedCart);
  };

  const removeItem = (id: string, size: string, color: string) => {
    // Robust filtering: compare all key properties
    const updatedCart = cartItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    );
    saveCart(updatedCart);
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.setItem('cartCount', updatedCart.reduce((t, i) => t + i.quantity, 0).toString());
    syncCartState(updatedCart);
    window.dispatchEvent(new CustomEvent('cart-updated'));
    refreshBonusInfo();
  };

  const handleApplyReferral = async () => {
    const code = referralInput.trim().toUpperCase();
    if (!code) return;
    setReferralStatus("checking");
    const result = await validateReferralCode(code);
    if (result.valid) {
      applyReferralCode(code, result.referrerName || "Friend");
      setReferralStatus("valid");
      refreshBonusInfo();
      setShowInviteBanner(false);
    } else {
      setReferralStatus("invalid");
    }
  };

  if (isLoading) return <div className="min-h-screen py-32 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-black animate-spin" /></div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
        <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-8 animate-bounce">
           <ShoppingBag className="text-zinc-200" size={40} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-bold mb-3 italic">Your bag is empty</h2>
        <p className="text-zinc-400 mb-10 max-w-sm text-center">Discover our latest collection and find the perfect bag for your style.</p>
        <Link href="/products" className="btn btn-accent px-12 h-14">Start Shopping</Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
  const discount = bonusInfo || getBestDiscount(subtotal);
  const total = subtotal - discount.amount;

  return (
    <div className="min-h-screen bg-white pb-32">
      <WhatsAppButton />
      
      {/* Progress Stepper */}
      <div className="bg-zinc-50/50 border-b border-zinc-100">
         <div className="section-container py-6">
            <div className="flex items-center justify-center max-w-md mx-auto">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">1</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black">Bag</span>
               </div>
               <div className="flex-1 h-[1px] bg-zinc-200 mx-4 mb-6" />
               <div className="flex flex-col items-center gap-2 opacity-30">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-[10px] font-bold">2</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Details</span>
               </div>
               <div className="flex-1 h-[1px] bg-zinc-200 mx-4 mb-6" />
               <div className="flex flex-col items-center gap-2 opacity-30">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-[10px] font-bold">3</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Payment</span>
               </div>
            </div>
         </div>
      </div>

      <div className="section-container py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
           <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Your <span className="luxury-italic">Shopping Bag</span></h1>
              <p className="text-zinc-400 mt-4 text-sm font-medium tracking-wide uppercase">You have {cartItems.length} items in your selection</p>
           </div>
           <Link href="/products" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-brand-accent transition-all">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* List */}
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-10">
            {showInviteBanner && (
               <div className="bg-black rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-125" />
                  <div className="flex items-center gap-8 relative z-10">
                     <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/5">
                        <Users className="text-brand-accent" size={32} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-bold mb-1 text-white italic">The SheDoo Collective</h4>
                        <p className="text-zinc-400 text-sm">Invite friends and unlock 15% off for both of you.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                     <button 
                        onClick={() => { 
                           if (!getCurrentUser()) openAuthModal(undefined, 'open-referral-modal'); 
                           else window.dispatchEvent(new CustomEvent('open-referral-modal')); 
                        }}
                        className="btn btn-accent px-10 h-14 text-xs shadow-2xl"
                     >
                        Invite Now
                     </button>
                     <button onClick={() => { dismissInvitePrompt(); setShowInviteBanner(false); }} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                     </button>
                  </div>
               </div>
            )}

            <div className="flex flex-col gap-12">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row gap-10 items-start pb-12 border-b border-zinc-100 group animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                   <Link href={`/products/${item.id}`} className="w-full sm:w-44 aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-50 shrink-0 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   </Link>
                   <div className="flex-1 flex flex-col gap-6 w-full py-2">
                      <div className="flex justify-between items-start gap-4">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 font-outfit">{item.category || "Premium Handbag"}</p>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{item.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-4">
                               <span className="px-5 py-2 rounded-full bg-zinc-50 border border-zinc-100 text-[9px] font-bold uppercase tracking-widest">{item.color}</span>
                               <span className="px-5 py-2 rounded-full bg-zinc-50 border border-zinc-100 text-[9px] font-bold uppercase tracking-widest">{item.size}</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => removeItem(item.id, item.size, item.color)} 
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-300 hover:bg-brand-accent hover:text-white transition-all shadow-sm"
                            title="Remove from Bag"
                         >
                            <X size={18} />
                         </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                         <div className="flex items-center gap-6 bg-zinc-50 rounded-full w-fit p-1.5 border border-zinc-100">
                            <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm">
                               <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-outfit">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm">
                               <Plus size={12} />
                            </button>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] block font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</span>
                            <span className="text-2xl font-bold">{formatPrice(item.price * item.quantity)}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-12 xl:col-span-4 self-start md:sticky md:top-32 h-fit flex flex-col gap-6">
             <div className="bg-zinc-50 rounded-[40px] p-10 border border-zinc-100 shadow-soft animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8">Summary Details</h2>
                
                <div className="flex flex-col gap-6 border-b border-zinc-200 pb-10">
                   <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">Selection Subtotal</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">Concierge Shipping</span>
                      <span className="text-brand-accent font-bold uppercase tracking-widest text-[10px] bg-brand-accent/10 px-3 py-1 rounded-full">Complimentary</span>
                   </div>
                   {discount.amount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100">
                         <div className="flex items-center gap-2 italic">
                            <Tag size={14} />
                            <span className="font-bold">{discount.label}</span>
                         </div>
                         <span className="font-bold">-{formatPrice(discount.amount)}</span>
                      </div>
                   )}
                </div>

                <div className="flex justify-between items-end py-10">
                   <span className="text-xs font-bold uppercase tracking-widest">Total Payable</span>
                   <div className="text-right">
                      <span className="text-4xl font-bold tracking-tighter">{formatPrice(total)}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="OFFER CODE"
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                        className="w-full h-16 bg-white border border-zinc-200 px-8 rounded-2xl text-xs font-bold uppercase tracking-widest focus:border-brand-accent transition-all outline-none shadow-sm"
                      />
                      <button 
                        onClick={handleApplyReferral}
                        className="absolute right-2 top-2 h-12 px-6 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50"
                        disabled={!referralInput || referralStatus === 'checking'}
                      >
                        {referralStatus === 'checking' ? '...' : 'Apply'}
                      </button>
                   </div>
                   {referralStatus === 'invalid' && <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider ml-6">Invalid Selection Code</p>}
                </div>

                <button 
                   onClick={() => setShowIdentityModal(true)}
                   className="btn btn-accent h-20 rounded-[20px] text-sm font-bold uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 w-full"
                >
                   Proceed to Details <ArrowRight size={18} />
                </button>

                <div className="flex flex-col gap-4 pt-8">
                   <div className="flex items-center gap-4 text-zinc-400 p-4 bg-white/50 rounded-2xl border border-zinc-100/50">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                         <Lock size={14} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest">Secured by SSL 256-bit encryption</span>
                   </div>
                   <div className="flex items-center gap-4 text-zinc-400 p-4 bg-white/50 rounded-2xl border border-zinc-100/50">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                         <Shield size={14} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest">Comprehensive Buyer Guarantee</span>
                   </div>
                </div>
             </div>

             <div className="p-10 border border-zinc-100 rounded-[40px] flex flex-col gap-6 animate-fade-up bg-zinc-50/30" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                      <Sparkles size={20} />
                   </div>
                   <h4 className="text-sm font-bold uppercase tracking-widest italic">Member Privilege</h4>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                   SheDoo members enjoy prioritized logistics and early access to artisanal drops. Not a member? <button className="text-brand-accent font-bold underline hover:opacity-70 transition-opacity">Join the Collective</button>.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Identity Modal */}
      {showIdentityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-12 relative shadow-2xl animate-scale-in">
             <button onClick={() => setShowIdentityModal(false)} className="absolute top-10 right-10 p-2 hover:bg-zinc-50 rounded-full transition-all text-zinc-300 hover:text-black">
                <X size={24} />
             </button>
             <div className="flex flex-col gap-4 mb-12">
                <h2 className="text-4xl font-bold italic">Secure Checkout</h2>
                <p className="text-zinc-400 text-sm font-medium">Provide your contact details to finalize your acquisition.</p>
             </div>
             
             <form className="flex flex-col gap-8" onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('cartCustomerInfo', JSON.stringify(identityData));
                syncCartState(cartItems, null, identityData as any);
                router.push('/checkout');
             }}>
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Acquirer Name</label>
                   <input 
                      required
                      placeholder="Jane Doe"
                      value={identityData.firstName}
                      onChange={e => setIdentityData({...identityData, firstName: e.target.value})}
                      className="h-16 bg-zinc-50 border-none rounded-2xl px-8 text-sm focus:ring-2 focus:ring-brand-accent transition-all shadow-inner"
                   />
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Digital Address</label>
                   <input 
                      required
                      type="email"
                      placeholder="jane@example.com"
                      value={identityData.email}
                      onChange={e => setIdentityData({...identityData, email: e.target.value})}
                      className="h-16 bg-zinc-50 border-none rounded-2xl px-8 text-sm focus:ring-2 focus:ring-brand-accent transition-all shadow-inner"
                   />
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Direct Line (Optional)</label>
                   <input 
                      type="tel"
                      placeholder="+255..."
                      value={identityData.phone}
                      onChange={e => setIdentityData({...identityData, phone: e.target.value})}
                      className="h-16 bg-zinc-50 border-none rounded-2xl px-8 text-sm focus:ring-2 focus:ring-brand-accent transition-all shadow-inner"
                   />
                </div>
                <button type="submit" className="btn btn-accent h-20 rounded-[20px] text-sm font-bold uppercase tracking-widest mt-4 shadow-xl transition-all hover:scale-[1.01]">
                   Continue to Fulfillment
                </button>
             </form>
          </div>
        </div>
      )}
      <ReferralInvite hideSection />
    </div>
  );
}
