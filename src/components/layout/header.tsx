"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ShoppingBag, User, LogOut, Package, Mail, Phone } from "lucide-react";
import { getCurrentUser, signOutCustomer, isCustomerAuthenticated } from "@/lib/customer-auth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    }

    // Check user authentication
    const checkAuth = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    // Initial load
    updateCartCount();
    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateCartCount();
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left - Menu Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
              CARA
            </span>
          </Link>

          {/* Right - User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">My Orders</span>
                  </Button>
                </Link>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs sm:text-sm">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-gray-500 border-b">
                        {user.email}
                      </div>
                      <Link href="/orders">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-red-600"
                        onClick={() => signOutCustomer()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/auth/sign-in">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
            
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white">
            <nav className="flex flex-col space-y-3">
              <Link href="/products" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                Shop
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                Categories
              </Link>
              
              {user ? (
                <>
                  <Link href="/orders" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                    My Orders
                  </Link>
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      {user.email}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600"
                      onClick={() => signOutCustomer()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/orders" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                    My Orders
                  </Link>
                  <Link href="/auth/sign-in" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                    Sign In
                  </Link>
                </>
              )}
              
              <Link href="/contact" className="text-gray-700 hover:text-black transition-colors py-2 text-sm font-medium">
                Contact
              </Link>
              <div className="border-t pt-3 mt-3 space-y-2">
                <Link href="/contact" className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors py-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>Contact Us</span>
                </Link>
                <Link href="tel:+1234567890" className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors py-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Call Us</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
