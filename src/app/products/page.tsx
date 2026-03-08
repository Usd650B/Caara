"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Filter, Search, ArrowRight } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import Link from "next/link";

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Knitwear"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceRange = true; // TODO: Implement price range filtering
    return matchesCategory && matchesSearch && matchesPriceRange;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 font-serif">Shop Our Collection</h1>
        <p className="text-gray-600 text-sm md:text-base font-light">Discover the latest trends in women's fashion</p>
      </div>

      {/* Mobile Filters Toggle */}
      <div className="md:hidden mb-6">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters & Categories
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-8`}>
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm md:text-base ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
            <div className="space-y-3">
              {[
                { label: "Under $50", min: 0, max: 50 },
                { label: "$50 - $100", min: 50, max: 100 },
                { label: "$100 - $200", min: 100, max: 200 },
                { label: "Over $200", min: 200, max: Infinity }
              ].map((range) => (
                <button
                  key={range.label}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm md:text-base"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-center hover:border-black transition-colors text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm md:text-base"
              />
            </div>
            <select
              aria-label="Sort products by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Product Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {sortedProducts.length} products
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <h3 className="text-lg md:text-xl font-semibold mb-4">No Products Available</h3>
                <p className="text-gray-600 mb-6">Check back soon for new arrivals!</p>
                <Button variant="outline" onClick={() => setSelectedCategory("All")}>
                  View All Categories
                </Button>
              </div>
            ) : (
              sortedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow overflow-hidden bg-white border border-gray-100 cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ShoppingCart className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* NEW Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-black text-white">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Quick Add to Cart */}
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          className="w-full bg-black text-white hover:bg-gray-800 text-xs"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cartItem = {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              quantity: 1,
                              size: "M", // Default size
                              color: "Black" // Default color
                            };
                            const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                            existingCart.push(cartItem);
                            localStorage.setItem('cart', JSON.stringify(existingCart));
                            
                            // Dispatch custom event to update header cart count
                            window.dispatchEvent(new CustomEvent('cart-updated'));
                            
                            alert('Product added to cart!');
                          }}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Quick Add
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      {/* Product Name */}
                      <h3 className="font-medium text-sm text-black hover:text-gray-800 transition-colors line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-black font-bold text-sm">${product.price}</span>
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
        </div>
      </div>
    </div>
  );
}
