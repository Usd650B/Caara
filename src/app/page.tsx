"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, Star, ArrowRight, Heart } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 3); // Show first 3 products as featured

  return (
    <div className="space-y-20">
      {/* Hero Banner */}
      <section className="relative w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[linear-gradient(135deg,_rgba(0,0,0,0.3)_0%,_rgba(0,0,0,0.1)_100%),_url('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&h=800&fit=crop')]"></div>
        <div className="relative h-full flex items-center justify-center text-center z-10">
          <div className="px-4 space-y-4 sm:space-y-6 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-lg tracking-tight">
              New Drop 🔥
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-md">
              Exclusive collection of trendy pieces. Limited stock available.
            </p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg" asChild>
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Scrollable Categories */}
      <section className="bg-white py-8 sm:py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Shop Categories</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Trending now</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide snap-x snap-mandatory">
            {[
              { name: "👗 Dresses", href: "/products?category=dresses" },
              { name: "👕 Tops", href: "/products?category=tops" },
              { name: "💃 Sets", href: "/products?category=sets" },
              { name: "⭐ New In", href: "/products?category=new" },
              { name: "👖 Bottoms", href: "/products?category=bottoms" },
              { name: "🧥 Outerwear", href: "/products?category=outerwear" }
            ].map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="flex-shrink-0 snap-start px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border border-gray-200 hover:border-gray-300"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-14 px-4">
          <div className="inline-block px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">HOT PICKS</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Trending Collection</h2>
          <p className="text-sm sm:text-base text-gray-600 font-light max-w-md mx-auto">Our most loved pieces right now</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 sm:py-20">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Collection Coming Soon</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">We&apos;re curating amazing pieces for you!</p>
              <Button asChild>
                <Link href="/products">Browse All</Link>
              </Button>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border-0 h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="relative overflow-hidden bg-gray-100 flex-1">
                      {/* Product Image */}
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-pink-500 text-white">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Quick Add Button */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          className="w-full bg-black text-white hover:bg-gray-800 text-xs py-2"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            const cartItem = {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              quantity: 1,
                              size: "M",
                              color: "Black"
                            };
                            const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                            existingCart.push(cartItem);
                            localStorage.setItem('cart', JSON.stringify(existingCart));
                            window.dispatchEvent(new CustomEvent('cart-updated'));
                            alert('Added to cart!');
                          }}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 space-y-2 flex-shrink-0">
                      {/* Product Name */}
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 group-hover:text-gray-700">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "Free Shipping",
                description: "On orders over $50"
              },
              {
                icon: Heart,
                title: "30-Day Returns",
                description: "Easy returns and exchanges"
              },
              {
                icon: Star,
                title: "Premium Quality",
                description: "Carefully selected materials"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold font-serif">{feature.title}</h3>
                <p className="text-gray-600 text-sm font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-serif">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto font-light">
            Join thousands of stylish women who have discovered their perfect look with Caara.
          </p>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
            <Link href="/products">
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
