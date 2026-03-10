"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, Star, ArrowRight, Heart, Sparkles, TrendingUp, Users, Gift, Zap, Crown, Diamond } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 8); // Show more products for better visual impact

  const categories = [
    { id: "all", name: "✨ All", icon: Sparkles, color: "from-purple-500 to-pink-500" },
    { id: "dresses", name: "👗 Dresses", icon: Diamond, color: "from-pink-500 to-rose-500" },
    { id: "tops", name: "👕 Tops", icon: Crown, color: "from-blue-500 to-purple-500" },
    { id: "sets", name: "💃 Sets", icon: Heart, color: "from-green-500 to-teal-500" },
    { id: "new", name: "⭐ New", icon: Zap, color: "from-yellow-500 to-orange-500" },
    { id: "trending", name: "🔥 Trending", icon: TrendingUp, color: "from-red-500 to-pink-500" }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      text: "Absolutely love the quality! The dresses fit perfectly and the shipping was super fast.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Emily K.",
      text: "Best shopping experience! The clothes are exactly as described and the customer service is amazing.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Jessica L.",
      text: "I'm obsessed with my new outfit! So many compliments whenever I wear it.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=50&h=50&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Content */}
        <div className="text-center max-w-7xl mx-auto w-full">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg border border-gray-200">
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-black animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-black uppercase tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>The Art of Being Unforgettable</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-black text-black tracking-tight leading-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
                Every Queen<br className="sm:hidden" /> Wear CARA
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black font-light max-w-2xl mx-auto tracking-wide px-4" style={{ fontFamily: 'Georgia, serif' }}>
                ......
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-gray-800 px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold tracking-wider shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Enter the World <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-black text-black hover:bg-black hover:text-white px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold tracking-wider transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Discover More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Categories */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-black tracking-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              Define Your Universe
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-light tracking-wide px-4" style={{ fontFamily: 'Georgia, serif' }}>Every piece tells your story</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id 
                    ? 'bg-gradient-to-br ' + category.color + ' text-white shadow-xl' 
                    : 'bg-white hover:shadow-lg border border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                    activeCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br ' + category.color
                  }`}>
                    <category.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                      activeCategory === category.id ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <span className={`font-semibold text-xs sm:text-sm tracking-wide uppercase text-center ${
                    activeCategory === category.id ? 'text-white' : 'text-black'
                  }`} style={{ fontFamily: 'Georgia, serif' }}>
                    {category.name}
                  </span>
                </div>
                {activeCategory === category.id && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              <span className="text-xs sm:text-sm font-semibold text-black uppercase tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>CULTURE CREATORS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-black tracking-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              The Collection
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-light tracking-wide px-4" style={{ fontFamily: 'Georgia, serif' }}>Curated pieces that become part of your identity</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-gray-200"></div>
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2 text-black tracking-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
                  The Future Awaits
                </h3>
                <p className="text-gray-600 mb-6 font-light px-4" style={{ fontFamily: 'Georgia, serif' }}>Something extraordinary is coming your way</p>
                <Button className="bg-black text-white hover:bg-gray-800 font-semibold tracking-wider px-6 py-3 text-sm sm:text-base" style={{ fontFamily: 'Georgia, serif' }} asChild>
                  <Link href="/products">Explore the Universe</Link>
                </Button>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                    <div className="relative overflow-hidden">
                      <div className="aspect-[3/4] bg-gray-50">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-black text-white rounded uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col space-y-2">
                          <Button 
                            className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold tracking-wider"
                            style={{ fontFamily: 'Georgia, serif' }}
                            onClick={(e) => {
                              e.stopPropagation();
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
                              alert('Added to cart! ✨');
                            }}
                          >
                            Make It Yours
                          </Button>
                          <Button 
                            className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold tracking-wider"
                            style={{ fontFamily: 'Georgia, serif' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Saved to your collection! ❤️');
                            }}
                          >
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-medium text-black text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-black transition-colors tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base lg:text-lg font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Culture Section - Replacing Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-black tracking-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              The CARA Culture
            </h2>
            <p className="text-gray-600 text-lg font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>More than fashion, it's a movement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-black" style={{ fontFamily: 'Georgia, serif' }}>B</span>
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Be Bold</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Dare to stand out, embrace your uniqueness</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-black" style={{ fontFamily: 'Georgia, serif' }}>E</span>
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Be Extraordinary</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Elevate every moment, make it count</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-black" style={{ fontFamily: 'Georgia, serif' }}>Y</span>
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Be You</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Authenticity is your greatest power</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Beyond Fashion</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Free shipping on your journey</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Love It or Exchange</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>30 days to find your perfect match</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Crafted Excellence</h3>
              <p className="text-gray-600 font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Every piece tells a story</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              Ready to Become Iconic?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Join the movement. Wear CARA. Create your legacy.
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold tracking-wider shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
