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
import { getBestDiscount, getReferralBonus, applyReferralCode, clearReferralBonus, shouldShowInvitePrompt, dismissInvitePrompt } from "@/lib/bonus";
import { validateReferralCode } from "@/lib/referral";
import { getCurrentUser } from "@/lib/customer-auth";
import { openAuthModal } from "@/components/ui/global-auth-modal";
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
    loadCartItems();
    refreshBonusInfo();
    window.addEventListener('cart-updated', loadCartItems);
    return () => window.removeEventListener('cart-updated', loadCartItems);
  }, []);

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
    refreshBonusInfo();
  };

  const removeItem = (id: string, size: string, color: string) => {
    const updatedCart = cartItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
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
        <ShoppingBag className="text-zinc-200 mb-8" size={64} strokeWidth={1} />
        <h2 className="text-2xl font-bold mb-3 italic">Your bag is empty</h2>
        <p className="text-zinc-400 mb-10 max-w-sm text-center">Discover our latest collection and find the perfect bag for your style.</p>
        <Link href="/products" className="btn btn-primary px-12">Start Shopping</Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
  const discount = bonusInfo || getBestDiscount(subtotal);
  const total = subtotal - discount.amount;

  return (
    <div className="min-h-screen bg-white">
      <WhatsAppButton />
      
      <div className="section-container py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                 <Link href="/products" className="hover:text-black">Shop</Link>
                 <span>/</span>
                 <span className="text-black italic">Shopping Bag</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your Bag <span className="text-zinc-300 font-light font-outfit uppercase text-lg ml-3">({cartItems.length})</span></h1>
           </div>
           <Link href="/products" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-all">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* List */}
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-10">
            {showInviteBanner && (
               <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-100 animate-fade-up">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center shrink-0">
                        <Users className="text-black" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold mb-1 italic">The SheDoo Collective</h4>
                        <p className="text-zinc-500 text-sm">Invite friends and unlock 15% off for both of you.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={() => { if (!getCurrentUser()) openAuthModal(); else window.location.href = '/#offers'; }}
                        className="btn btn-primary px-8 h-12 text-xs"
                     >
                        Invite Friends
                     </button>
                     <button onClick={() => { dismissInvitePrompt(); setShowInviteBanner(false); }} className="text-zinc-300 hover:text-black transition-colors">
                        <X size={18} />
                     </button>
                  </div>
               </div>
            )}

            <div className="flex flex-col gap-8">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-zinc-100 group animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                   <Link href={`/products/${item.id}`} className="w-full sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-50 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-0 group-hover:grayscale-[0.2] transition-all" />
                   </Link>
                   <div className="flex-1 flex flex-col gap-4 w-full">
                      <div className="flex justify-between items-start gap-4">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{item.category}</p>
                            <h3 className="text-xl font-bold tracking-tight">{item.name}</h3>
                         </div>
                         <button onClick={() => removeItem(item.id, item.size, item.color)} className="text-zinc-300 hover:text-black transition-colors">
                            <X size={20} />
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-4 py-1.5 rounded-full bg-zinc-100 text-[10px] font-bold uppercase tracking-widest">{item.color}</span>
                         <span className="px-4 py-1.5 rounded-full bg-zinc-100 text-[10px] font-bold uppercase tracking-widest">{item.size}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <div className="flex items-center gap-4 bg-zinc-50 rounded-full w-fit p-1">
                            <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-all">
                               <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-outfit">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-all">
                               <Plus size={12} />
                            </button>
                         </div>
                         <span className="text-lg font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-12 xl:col-span-4 self-start md:sticky md:top-32 h-fit flex flex-col gap-6">
             <div className="bg-zinc-50 rounded-3xl p-10 flex flex-col gap-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Order Summary</h2>
                
                <div className="flex flex-col gap-4 border-b border-zinc-200 pb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Shipping</span>
                      <span className="text-black font-bold uppercase tracking-widest text-[10px]">Free</span>
                   </div>
                   {discount.amount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                         <span className="flex items-center gap-2 italic">{discount.label}</span>
                         <span className="font-bold">-{formatPrice(discount.amount)}</span>
                      </div>
                   )}
                </div>

                <div className="flex justify-between items-end">
                   <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                   <div className="text-right">
                      <span className="text-3xl font-bold">{formatPrice(total)}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="ENTER PROMO CODE"
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                        className="w-full h-14 bg-white border-2 border-transparent px-6 rounded-full text-[10px] font-bold uppercase tracking-widest focus:border-black transition-all outline-none"
                      />
                      <button 
                        onClick={handleApplyReferral}
                        className="absolute right-2 top-2 h-10 px-6 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50"
                        disabled={!referralInput || referralStatus === 'checking'}
                      >
                        {referralStatus === 'checking' ? '...' : 'Apply'}
                      </button>
                   </div>
                   {referralStatus === 'invalid' && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-6">Invalid Code</p>}
                </div>

                <button 
                   onClick={() => setShowIdentityModal(true)}
                   className="btn btn-primary h-16 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                   Checkout Now <ArrowRight size={18} />
                </button>

                <div className="flex flex-col gap-4 pt-4">
                   <div className="flex items-center gap-3 text-zinc-400">
                      <Lock size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Encryption</span>
                   </div>
                   <div className="flex items-center gap-3 text-zinc-400">
                      <Shield size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Buyer Protection Guaranteed</span>
                   </div>
                </div>
             </div>

             <div className="p-8 border border-zinc-100 rounded-3xl flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-2">
                   <Sparkles className="text-zinc-300" size={18} />
                   <h4 className="text-xs font-bold uppercase tracking-widest italic">Member Benefits</h4>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                   SheDoo members get early access to new drops and faster worldwide logistics. Not a member? <button className="text-black font-bold underline">Join the Collective</button>.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Identity Modal */}
      {showIdentityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl animate-scale-in">
             <button onClick={() => setShowIdentityModal(false)} className="absolute top-8 right-8 text-zinc-300 hover:text-black">
                <X size={24} />
             </button>
             <h2 className="text-3xl font-bold italic mb-3">Almost there</h2>
             <p className="text-zinc-500 mb-10 text-sm">Secure your items by providing your shipping details.</p>
             
             <form className="flex flex-col gap-6" onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('cartCustomerInfo', JSON.stringify(identityData));
                syncCartState(cartItems, null, identityData as any);
                router.push('/checkout');
             }}>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                   <input 
                      required
                      placeholder="Jane Doe"
                      value={identityData.firstName}
                      onChange={e => setIdentityData({...identityData, firstName: e.target.value})}
                      className="h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm focus:ring-1 focus:ring-black"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                   <input 
                      required
                      type="email"
                      placeholder="jane@example.com"
                      value={identityData.email}
                      onChange={e => setIdentityData({...identityData, email: e.target.value})}
                      className="h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm focus:ring-1 focus:ring-black"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Phone (Optional)</label>
                   <input 
                      type="tel"
                      placeholder="+255..."
                      value={identityData.phone}
                      onChange={e => setIdentityData({...identityData, phone: e.target.value})}
                      className="h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm focus:ring-1 focus:ring-black"
                   />
                </div>
                <button type="submit" className="btn btn-primary h-16 rounded-full text-sm font-bold uppercase tracking-widest mt-4">
                   Continue to Checkout
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
