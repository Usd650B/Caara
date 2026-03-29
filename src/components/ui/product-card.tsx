import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "./lazy-image";
import React from "react";

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, productId: string) => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({ 
  product, 
  isFavorited = false, 
  onToggleFavorite,
  variant = 'default'
}: ProductCardProps) {
  const { formatPrice, t } = useSettings();

  const optionsCount = (product.colors?.length || 0) + (product.sizes?.length || 0);
  const colorCount = product.colors?.length || 0;
  
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group bg-white border border-gray-200 hover:border-gray-400 transition-all duration-300 block overflow-hidden rounded-md shadow-sm hover:shadow-md ${variant === 'compact' ? 'max-w-[160px]' : ''}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <LazyImage
          src={product.image || ""}
          alt={product.name}
          className="group-hover:scale-110 transition-transform duration-700 ease-in-out"
          aspectRatio="aspect-[3/4]"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-sm ${
              product.badge === 'Sale' ? 'bg-orange-600 text-white' : 
              product.badge === 'New' ? 'bg-blue-600 text-white' : 'bg-black text-white'
            }`}>
              {t(product.badge)}
            </span>
          )}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="text-[9px] font-bold uppercase tracking-wide bg-red-500 text-white px-1.5 py-0.5 rounded-sm animate-pulse">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[9px] font-bold uppercase tracking-wide bg-gray-500 text-white px-1.5 py-0.5 rounded-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button - Improved visibility for mobile */}
        <button
          onClick={(e) => {
            if (onToggleFavorite) {
              onToggleFavorite(e, product.id as string);
            }
          }}
          className={`absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all duration-300 shadow-sm md:opacity-0 md:group-hover:opacity-100 ${
            isFavorited ? 'border-red-200 scale-110' : 'border-gray-100 hover:border-gray-300'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`} 
          />
        </button>

        {/* Style/Color Indicator - inspired by the user photo */}
        {colorCount > 1 && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex gap-1 overflow-hidden">
             <div className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-medium text-gray-700 whitespace-nowrap">
               {colorCount} colors available
             </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Name - Ensure it doesn't break layout */}
        <h3 className="text-xs text-gray-700 line-clamp-2 leading-tight mb-1.5 font-medium min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
          <span className="text-sm font-extrabold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-orange-600">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Rating & Options */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  className={`h-2.5 w-2.5 ${
                    s <= Math.round(product.rating || 4.5) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-200 fill-gray-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-400">
              ({product.reviews || 0})
            </span>
          </div>
          
          {/* Options count text - matches user photo style but more compact for card */}
          {optionsCount > 1 && (
             <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">
               {optionsCount} options
             </span>
          )}
        </div>
      </div>
    </Link>
  );
}
