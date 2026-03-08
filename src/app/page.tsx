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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-6 py-3 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">Limited Edition Collection</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="heading-hero text-2xl sm:text-3xl md:text-4xl lg:text-6xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Caara Fashion
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto font-inter">
                Where Style Meets <span className="font-semibold text-purple-600">Elegance</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Shop Collection <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold transform hover:scale-105 transition-all duration-300"
              >
                View Lookbook
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 sm:gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">10K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-600">500+</div>
                <div className="text-xs sm:text-sm text-gray-600">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">4.9★</div>
                <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 animate-float">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-10 animate-float-delayed">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
            <Diamond className="h-8 w-8 text-white" />
          </div>
        </div>
      </section>

      {/* Interactive Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-body text-gray-600">Discover your perfect style</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id 
                    ? 'bg-gradient-to-br ' + category.color + ' text-white shadow-xl' 
                    : 'bg-white hover:shadow-lg border border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    activeCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br ' + category.color
                  }`}>
                    <category.icon className={`h-6 w-6 ${
                      activeCategory === category.id ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <span className={`font-semibold text-sm ${
                    activeCategory === category.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                </div>
                {activeCategory === category.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with Enhanced Design */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">TRENDING NOW</span>
            </div>
            <h2 className="heading-section mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Featured Collection
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">Handpicked pieces that are taking the fashion world by storm</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 to-pink-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
                      <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">We're curating something amazing for you!</p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                  <Link href="/products">Browse All Products</Link>
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
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs font-medium bg-black text-white rounded">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col space-y-2">
                          <Button 
                            className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-4 py-2 text-sm"
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
                            Add to Cart
                          </Button>
                          <Button 
                            className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-4 py-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Added to wishlist! ❤️');
                            }}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Wishlist
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-black transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-black">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
            <p className="text-body text-gray-600">Real reviews from real customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="card-compact bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 font-poppins">{testimonial.name}</h4>
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-body text-gray-600 italic font-inter">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h3 className="heading-card text-gray-900">Free Shipping</h3>
              <p className="text-body text-gray-600">On orders over $50</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="heading-card text-gray-900">Easy Returns</h3>
              <p className="text-body text-gray-600">30-day return policy</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="heading-card text-gray-900">Premium Quality</h3>
              <p className="text-body text-gray-600">Carefully selected materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="heading-hero text-white mb-4">
              Ready to Transform Your Style?
            </h2>
            <p className="text-body text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of stylish women who have discovered their perfect look with Caara.
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Shopping Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
