"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

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
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/products">
            <Button>
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your <span className="gradient-text">Shopping Bag</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-light">{getTotalItems()} extraordinary pieces selected</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="glass overflow-hidden rounded-[2rem] group hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col sm:flex-row gap-6 p-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-40 bg-muted rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full gradient-bg flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xl sm:text-2xl tracking-tight leading-tight">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="text-muted-foreground hover:text-primary p-2 glass rounded-xl transition-all hover:scale-110"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">{item.category}</p>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground pt-1">
                        <span className="glass-white px-3 py-1 rounded-lg">Size: {item.size}</span>
                        <span className="glass-white px-3 py-1 rounded-lg">Color: {item.color}</span>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-black gradient-text">${item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through font-medium">
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 glass-white p-1 rounded-2xl border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all font-bold text-primary"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-black text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all font-bold text-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Promotion Section */}
            <div className="gradient-bg p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Complementary Shipping</h3>
                  <p className="text-white/80 font-light max-w-sm">Enjoy premium worldwide delivery on all your selections, courtesy of our house.</p>
                </div>
                <div className="px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-xl uppercase tracking-[0.2em] text-sm animate-pulse">
                  Always Included
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="glass p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h2 className="text-2xl font-black mb-8 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-light">Subtotal</span>
                    <span className="font-bold text-foreground text-lg">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-light text-muted-foreground">Premium Shipping</span>
                    <span className="text-xs font-black px-3 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-widest border border-green-500/20">Complimentary</span>
                  </div>
                  
                  <div className="border-t border-white/10 mt-6 pt-6">
                    <div className="flex justify-between items-center group">
                      <span className="text-xl font-black tracking-tight">Total</span>
                      <span className="text-3xl font-black gradient-text group-hover:scale-110 transition-transform">${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <Link href="/checkout">
                    <Button className="w-full gradient-bg text-white hover:opacity-90 h-16 rounded-2xl text-lg font-black shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all group">
                      Checkout Now
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  
                  <Link href="/products">
                    <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                      Discover More
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Actions */}
              <button 
                onClick={clearCart}
                className="w-full flex items-center justify-center space-x-2 text-sm font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                <Trash2 className="h-4 w-4" />
                <span>Empty All Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
