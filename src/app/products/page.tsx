"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Filter, Search, ArrowRight, ChevronDown, X, Truck } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import Link from "next/link";

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Knitwear"];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity }
];
const sizes = ["All", "XS", "S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedSize, setSelectedSize] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    const matchesPriceRange = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    const matchesSize = selectedSize === "All" || (product.sizes && product.sizes.includes(selectedSize));
    return matchesCategory && matchesSearch && matchesPriceRange && matchesSize;
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

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                The <span className="gradient-text">Collection</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-light">Discover pieces that define your universe</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 md:w-64 text-sm transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Filters Sidebar */}
          <div className="lg:w-72">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className="w-full flex items-center justify-between h-12 rounded-xl glass border-primary/20"
              >
                <span className="font-bold">Filters & Refine</span>
                <Filter className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Desktop Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-card rounded-2xl border border-border shadow-sm p-6 space-y-8 sticky top-32 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-hide`}>
              
              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Category</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between text-sm transition-all ${
                        selectedCategory === category
                          ? "text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span className="text-left">{category}</span>
                      {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Price</h3>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`w-full flex items-center justify-between text-sm transition-all ${
                        selectedPriceRange.label === range.label
                          ? "text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span className="text-left">{range.label}</span>
                      {selectedPriceRange.label === range.label && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPriceRange(priceRanges[0]);
                    setSelectedSize("All");
                    setSearchTerm("");
                  }}
                  variant="outline"
                  className="w-full text-xs font-bold uppercase tracking-wider hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters Display */}
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedCategory !== "All" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>{selectedCategory}</span>
                  <button onClick={() => setSelectedCategory("All")} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
              {selectedPriceRange.label !== "All Prices" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>{selectedPriceRange.label}</span>
                  <button onClick={() => setSelectedPriceRange(priceRanges[0])} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
              {selectedSize !== "All" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>Size: {selectedSize}</span>
                  <button onClick={() => setSelectedSize("All")} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            {/* Product Count & Info */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-light">
                Showing <span className="font-bold text-foreground">{sortedProducts.length}</span> extraordinary pieces
              </p>
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full">
                <Truck className="h-3 w-3" />
                <span>Free Worldwide Shipping</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="glass rounded-xl aspect-[3/4] animate-pulse"></div>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-[3rem] p-12">
                  <div className="w-20 h-20 gradient-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-12">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    No Matches Found
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto font-light">
                    Adjust your filters to discover other extraordinary pieces from our collection.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedPriceRange(priceRanges[0]);
                      setSelectedSize("All");
                    }} 
                    className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest"
                  >
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                sortedProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-card rounded-xl">
                      <div className="relative overflow-hidden aspect-[3/4]">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Badge */}
                        {product.badge && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 text-[9px] font-bold gradient-bg text-white rounded uppercase tracking-wider shadow">
                              {product.badge}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                          <Button 
                            className="flex-1 bg-white/95 text-black hover:bg-black hover:text-white border-none h-8 text-[10px] font-bold tracking-wider uppercase rounded-lg shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Cart logic here
                              alert('Added to your bag! ✨');
                            }}
                          >
                            Add
                          </Button>
                          <Button 
                            size="icon"
                            className="bg-white/95 text-black border-none h-8 w-8 rounded-lg shadow-lg hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Saved to favorites! ❤️');
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-card relative">
                        <h3 className="font-bold text-foreground text-xs leading-tight mb-1 truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-sm font-black text-primary">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through font-medium">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500 mt-1">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="text-[10px] font-bold text-muted-foreground">4.8 (124)</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
