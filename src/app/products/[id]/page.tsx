"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, Play } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, Product } from "@/lib/firestore";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour countdown
  const [isFlashSale, setIsFlashSale] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Flash sale effect
  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setIsFlashSale(true);
      setTimeout(() => setIsFlashSale(false), 3000); // Flash for 3 seconds every 10 seconds
    }, 5000);

    return () => clearTimeout(flashTimer);
  }, []);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
      
      // Load related products (excluding current product)
      const related = products
        .filter(p => p.id !== productId)
        .slice(0, 4); // Show up to 4 related products
      setRelatedProducts(related);
      
      // TODO: Load real reviews when review system is implemented
      setReviews([]);
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
  };

  const addToCart = () => {
    if (!product) return;

    // Validate required fields
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      quantity,
      size: selectedSize,
      color: selectedColor,
      rating: product.rating,
      reviews: product.reviews
    };

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart with same size and color
    const existingIndex = existingCart.findIndex((item: any) => 
      item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );

    if (existingIndex >= 0) {
      // Update quantity
      existingCart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Update cart count in header (if needed)
    const cartCount = existingCart.reduce((total: number, item: any) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount.toString());
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    alert('Product added to cart!');
    
    // Optional: Redirect to cart
    // router.push('/cart');
  };

  // Get product images (use uploaded images or fallback to placeholder)
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image] 
      : ['https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=800&h=800&fit=crop'];

  // Add video to media array if exists
  const productMedia = product?.video 
    ? [...productImages, product.video] 
    : productImages;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productMedia.length) % productMedia.length);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Product Media */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="aspect-[3/4] sm:aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                {productMedia[currentImageIndex]?.includes('video') ? (
                  <video
                    src={productMedia[currentImageIndex]}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={productMedia[currentImageIndex]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              
              {/* Media Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg touch-target"
                aria-label="Previous product media"
              >
                <ArrowLeft className="h-3 w-3 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg touch-target"
                aria-label="Next product media"
              >
                <ArrowLeft className="h-3 w-3 sm:h-5 sm:w-5 rotate-180" />
              </button>
            </div>

            {/* Thumbnail Media */}
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
              {productMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all touch-target ${
                    currentImageIndex === index ? 'border-purple-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View product ${media.includes('video') ? 'video' : 'image'} ${index + 1}`}
                >
                  {media.includes('video') ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                          <Play className="h-2 w-2 sm:h-3 sm:w-3 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Info */}
            <div>
              <h1 className="heading-hero text-xl sm:text-2xl lg:text-3xl mb-2">{product.name}</h1>
              <p className="text-caption sm:text-body text-gray-600 mb-3 sm:mb-4">{product.category}</p>
              
              {/* Rating */}
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-caption text-gray-500 ml-2">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-black">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.badge && (
                  <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                    product.badge === "Sale" ? "bg-red-600 text-white" :
                    product.badge === "New" ? "bg-green-600 text-white" :
                    "bg-purple-600 text-white"
                  }`}>
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4 sm:space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 sm:mb-3">Size</label>
                <div className="grid grid-cols-5 gap-2">
                  {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl transition-all font-medium text-sm touch-target ${
                        selectedSize === size
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 sm:mb-3">Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(product.colors || ["Black", "White", "Pink", "Blue"]).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl transition-all font-medium text-sm touch-target ${
                        selectedColor === color
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2 sm:mb-3">Quantity</label>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors touch-target"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <span className="w-12 sm:w-16 text-center text-lg sm:text-xl font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors touch-target"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <Button 
                onClick={addToCart}
                className="w-full bg-black text-white hover:bg-gray-800 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl transition-colors touch-target"
                size="lg"
              >
                Add to Cart
              </Button>
              
              <Button variant="outline" className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors touch-target">
                <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Wishlist
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t pt-4 sm:pt-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Description</h3>
                <p className="text-caption sm:text-body text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Features */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 border-t pt-4 sm:pt-6">
              <div className="flex items-center space-x-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Free Shipping</p>
                  <p className="text-xs sm:text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Secure Payment</p>
                  <p className="text-xs sm:text-sm text-gray-600">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Easy Returns</p>
                  <p className="text-xs sm:text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
