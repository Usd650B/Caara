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
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-black">{t("Your Bag")}</h1>
          <p className="text-black/50 text-sm mt-2">
            {getTotalItems()} {t("items in your cart")}
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
                           <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40">{t(item.category)}</p>
                           <h3 className="text-base font-semibold tracking-tight text-black">{item.name}</h3>
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
                           <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">Variant</span>
                           <span className="text-xs font-semibold text-black">{t(item.color)} / {item.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                      {/* Quantity Controller - Minimalist */}
                      <div className="flex items-center border border-black/10 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/5 transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/5 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                         <span className="text-lg font-bold text-black">{formatPrice(item.price)}</span>
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
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-black/5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-6">{t("Order Summary")}</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-black/60">
                    <span>{t("Subtotal")}</span>
                    <span className="text-black font-semibold">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-black/60">
                    <span>{t("Shipping")}</span>
                    <span className="text-green-600 font-semibold">{t("Free")}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-black/5">
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-sm font-bold text-black">{t("Estimated Total")}</span>
                      <span className="text-2xl font-bold text-black">{formatPrice(getTotalPrice())}</span>
                    </div>

                    <Link href="/checkout">
                      <Button className="w-full h-12 bg-black text-white hover:bg-black/80 rounded-xl text-sm font-semibold transition-all">
                        {t("Check Out Now")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center">
                 <button 
                  onClick={clearCart}
                  className="text-xs font-semibold text-black/40 hover:text-black transition-colors"
                >
                   {t("Clear Cart")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
