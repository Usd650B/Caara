"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/lib/settings";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    setIsLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadCartItems();
    
      // Listen for cart updates
      const handleCartUpdate = () => {
        loadCartItems();
      };
      
      window.addEventListener('cart-updated', handleCartUpdate);
      window.addEventListener('storage', handleCartUpdate);
      
      return () => {
        window.removeEventListener('cart-updated', handleCartUpdate);
        window.removeEventListener('storage', handleCartUpdate);
      };
    }
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
    
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const removeItem = (id: string, size: string, color: string) => {
    const updatedCart = cartItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("Your cart is empty")}</h2>
          <p className="text-gray-600 mb-6">{t("Looks like you haven't added anything to your cart yet.")}</p>
          <Link href="/products">
            <Button>
              {t("Continue Shopping")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Minimalist Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter text-black uppercase">{t("Your Bag")}</h1>
          <p className="text-black/30 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
            {getTotalItems()} Items Selected for Deployment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Cart Items - 8 Columns */}
          <div className="lg:col-span-8 space-y-12">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="group relative pb-12 border-b border-black/5">
                <div className="flex flex-col sm:flex-row gap-8">
                  {/* Product Image - Calibrated Size */}
                  <div className="w-full sm:w-40 aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-black/5 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-black/20" />
                      </div>
                    )}
                  </div>

                  {/* Product Details - Clean Layout */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase tracking-widest text-black/20">{t(item.category)}</p>
                           <h3 className="text-2xl font-black tracking-tight text-black uppercase">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="w-10 h-10 flex items-center justify-center text-black/20 hover:text-black transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-widest text-black/20 mb-1">Variant</span>
                           <span className="text-xs font-bold uppercase tracking-widest text-black">{t(item.color)} / {item.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                      {/* Quantity Controller - Minimalist */}
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                         <span className="text-2xl font-black text-black tracking-tighter">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Column - 4 Columns */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30 mb-10">Order Summary</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between text-black/40 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal Value</span>
                    <span className="text-black">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between items-center text-black/40 text-[10px] font-black uppercase tracking-widest">
                    <span>Logistics</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <div className="pt-10 border-t border-black/5">
                    <div className="flex justify-between items-baseline mb-10">
                      <span className="text-xs font-black uppercase tracking-widest">Estimated Total</span>
                      <span className="text-4xl font-black text-black tracking-tighter">{formatPrice(getTotalPrice())}</span>
                    </div>

                    <Link href="/checkout">
                      <Button className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1">
                        {t("Check Out Now")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center">
                 <button 
                  onClick={clearCart}
                  className="text-[9px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors"
                >
                   Wipe Bag Contents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
