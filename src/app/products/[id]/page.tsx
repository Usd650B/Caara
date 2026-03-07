"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart } from "lucide-react";
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

  // Mock reviews with photos
  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      comment: "Absolutely love this dress! The quality is amazing and it fits perfectly.",
      date: "2 days ago",
      image: "https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Emily K.",
      rating: 4,
      comment: "Great quality for the price! Will definitely buy again.",
      date: "1 week ago",
      image: "https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Jessica L.",
      rating: 5,
      comment: "Perfect for my date night! Got so many compliments.",
      date: "2 weeks ago",
      image: "https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=50&h=50&fit=crop&crop=face"
    }
  ];

  // Mock "customers also bought" products
  const relatedProducts = [
    { id: "related1", name: "Floral Summer Dress", price: 49.99, image: "https://images.unsplash.com/photo-1434389677661-ea1ecd5dc955?w=200&h=200&fit=crop" },
    { id: "related2", name: "Classic White Tee", price: 29.99, image: "https://images.unsplash.com/photo-1522777796106-5df8f240734a?w=200&h=200&fit=crop" },
    { id: "related3", name: "Denim Jacket", price: 79.99, image: "https://images.unsplash.com/photo-1551109095320-f41f0e5b4e8?w=200&h=200&format=auto" }
  ];

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

  // Mock images for slider (in real app, these would come from product data)
  const productImages = [
    product?.image || 'https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1434389677661-ea1ecd5dc955?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1469334030793-5c077498c5a8?w=800&h=800&fit=crop'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Slider */}
        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src={productImages[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Image Navigation */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
              aria-label="Previous product image"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
              aria-label="Next product image"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  currentImageIndex === index ? 'border-black' : 'border-gray-200'
                }`}
                aria-label={`View product image ${index + 1}`}
              >
                <img 
                  src={image} 
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.category}</p>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl font-bold text-black">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.badge && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  product.badge === "Sale" ? "bg-black text-white" :
                  product.badge === "New" ? "bg-gray-800 text-white" :
                  "bg-gray-600 text-white"
                }`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Flash Sale Banner */}
          {isFlashSale && (
            <div className="bg-red-600 text-white py-2 px-4 rounded-lg mb-4 animate-pulse">
              <span className="font-semibold">🔥 FLASH SALE - 20% OFF ENDS SOON!</span>
            </div>
          )}

          {/* Countdown Timer */}
          <div className="bg-black text-white py-3 px-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">⏰ Sale Ends In:</span>
              <div className="flex space-x-2">
                <span className="bg-white text-black px-2 py-1 rounded font-mono text-sm">
                  {Math.floor(timeLeft / 3600)}h
                </span>
                <span className="bg-white text-black px-2 py-1 rounded font-mono text-sm">
                  {Math.floor((timeLeft % 3600) / 60)}m
                </span>
                <span className="bg-white text-black px-2 py-1 rounded font-mono text-sm">
                  {timeLeft % 60}s
                </span>
              </div>
            </div>
          </div>

          {/* Stock Urgency */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-600 font-semibold text-sm">⚡ Only 3 left in stock!</span>
              <span className="text-sm text-gray-500">23 people viewing this</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full w-[85%]"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">85% sold</p>
          </div>
          </div>

          {/* Product Options */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Size</label>
              <div className="grid grid-cols-5 gap-2">
                {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-3 border rounded-lg transition-colors ${
                      selectedSize === size
                        ? "border-black bg-gray-50 text-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {(product.colors || ["Black", "White", "Pink", "Blue"]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-3 border rounded-lg transition-colors ${
                      selectedColor === color
                        ? "border-black bg-gray-50 text-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:border-black"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:border-black"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <Button 
              onClick={addToCart}
              className="w-full bg-black text-white hover:bg-gray-800 py-4 text-lg font-semibold"
              size="lg"
            >
              Add to Cart
            </Button>
            
            <Button variant="outline" className="w-full py-4 text-lg">
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t pt-8">
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Product Features */}
          <div className="grid grid-cols-1 gap-4 border-t pt-8">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-black" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-black" />
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm text-gray-600">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-black" />
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>

          {/* Customer Reviews with Photos */}
          <div className="border-t pt-8">
            <h3 className="font-semibold text-lg mb-6">Customer Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={review.image} 
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{review.name}</span>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers Also Bought */}
          <div className="border-t pt-8">
            <h3 className="font-semibold text-lg mb-6">Customers Also Bought</h3>
            <div className="grid grid-cols-3 gap-4">
              {relatedProducts.map((related) => (
                <div key={related.id} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                    <img 
                      src={related.image} 
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{related.name}</h4>
                  <p className="text-sm font-bold text-black">${related.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
