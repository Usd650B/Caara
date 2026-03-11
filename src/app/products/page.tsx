"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Filter, Search, ArrowRight, ChevronDown, X } from "lucide-react";
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
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black" style={{ fontFamily: 'Georgia, serif' }}>The Collection</h1>
              <p className="text-gray-600 text-sm sm:text-base">Discover pieces that define your universe</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-48 md:w-64 text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Independently Scrollable */}
          <div className="lg:w-64">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className="w-full flex items-center justify-between"
              >
                <span>Filters</span>
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Desktop Filters - Fixed Height with Scroll */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)] overflow-y-auto sticky top-24`}>

              {/* Categories Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('category')}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Categories</span>
                  <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'category' && (
                  <div className="mt-2 space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedCategory === category
                            ? "bg-black text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-black"
                        }`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('price')}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Price Range</span>
                  <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'price' && (
                  <div className="mt-2 space-y-1">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          setSelectedPriceRange(range);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedPriceRange.label === range.label
                            ? "bg-black text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-black"
                        }`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('size')}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Size</span>
                  <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'size' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'size' && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setOpenDropdown(null);
                        }}
                        className={`px-2 py-1 border rounded-lg text-center transition-colors text-sm ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-black hover:border-black"
                        }`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Filters for Scroll Testing */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Additional Filters</h3>
                
                {/* Color Filter */}
                <div>
                  <button
                    onClick={() => toggleDropdown('color')}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Color</span>
                    <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'color' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'color' && (
                    <div className="mt-2 space-y-1">
                      {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'].map((color) => (
                        <button
                          key={color}
                          className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black text-sm transition-colors"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Material Filter */}
                <div>
                  <button
                    onClick={() => toggleDropdown('material')}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Material</span>
                    <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'material' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'material' && (
                    <div className="mt-2 space-y-1">
                      {['Cotton', 'Silk', 'Wool', 'Linen', 'Polyester', 'Denim', 'Leather', 'Cashmere'].map((material) => (
                        <button
                          key={material}
                          className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black text-sm transition-colors"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand Filter */}
                <div>
                  <button
                    onClick={() => toggleDropdown('brand')}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Brand</span>
                    <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'brand' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'brand' && (
                    <div className="mt-2 space-y-1">
                      {['CARA', 'CARA Premium', 'CARA Essentials', 'CARA Limited'].map((brand) => (
                        <button
                          key={brand}
                          className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black text-sm transition-colors"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Occasion Filter */}
                <div>
                  <button
                    onClick={() => toggleDropdown('occasion')}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-black text-sm" style={{ fontFamily: 'Georgia, serif' }}>Occasion</span>
                    <ChevronDown className={`h-4 w-4 text-black transition-transform ${openDropdown === 'occasion' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'occasion' && (
                    <div className="mt-2 space-y-1">
                      {['Casual', 'Formal', 'Business', 'Party', 'Date Night', 'Weekend', 'Travel', 'Special'].map((occasion) => (
                        <button
                          key={occasion}
                          className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black text-sm transition-colors"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {occasion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceRange(priceRanges[0]);
                  setSelectedSize("All");
                  setSearchTerm("");
                }}
                className="w-full text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Products Grid - Normal Scroll */}
          <div className="flex-1">
            {/* Active Filters Display */}
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedCategory !== "All" && (
                <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-xs text-black" style={{ fontFamily: 'Georgia, serif' }}>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="ml-2 text-gray-500 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedPriceRange.label !== "All Prices" && (
                <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-xs text-black" style={{ fontFamily: 'Georgia, serif' }}>{selectedPriceRange.label}</span>
                  <button
                    onClick={() => setSelectedPriceRange(priceRanges[0])}
                    className="ml-2 text-gray-500 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedSize !== "All" && (
                <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-xs text-black" style={{ fontFamily: 'Georgia, serif' }}>{selectedSize}</span>
                  <button
                    onClick={() => setSelectedSize("All")}
                    className="ml-2 text-gray-500 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Count */}
            <div className="mb-4">
              <p className="text-xs text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                Showing {sortedProducts.length} products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] bg-gray-200"></div>
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-black" style={{ fontFamily: 'Georgia, serif' }}>No Products Available</h3>
                  <p className="text-gray-600 mb-4 text-sm">Check back soon for new arrivals!</p>
                  <Button variant="outline" onClick={() => setSelectedCategory("All")} className="text-sm">
                    View All Categories
                  </Button>
                </div>
              ) : (
                sortedProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
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
                              <ShoppingCart className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Badge */}
                        {product.badge === "New" && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-medium bg-black text-white rounded" style={{ fontFamily: 'Georgia, serif' }}>
                              NEW
                            </span>
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex flex-col space-y-2">
                            <Button 
                              className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-3 py-1 text-xs font-medium"
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
                              className="bg-white text-black hover:bg-black hover:text-white border border-gray-200 px-3 py-1 text-xs font-medium"
                              style={{ fontFamily: 'Georgia, serif' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('Saved to your collection! ❤️');
                              }}
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-black text-sm mb-1 line-clamp-2 group-hover:text-black transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-black" style={{ fontFamily: 'Georgia, serif' }}>
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through" style={{ fontFamily: 'Georgia, serif' }}>
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
        </div>
      </div>
    </div>
  );
}
