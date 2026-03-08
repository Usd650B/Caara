"use client"

import Link from "next/link"
import { ShoppingCart, Search, Menu, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    }

    // Initial load
    updateCartCount();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateCartCount();
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
            <span className="text-2xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
              CARA
            </span>
          </Link>

          {/* Right - Search and Cart */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
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
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-gray-700 hover:text-black transition-colors">
                Shop
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-black transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-black transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-black transition-colors">
                Contact
              </Link>
              <div className="border-t pt-4 mt-4">
                <Link href="/contact" className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Contact Us</span>
                </Link>
                <Link href="tel:+1234567890" className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Call Us</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
