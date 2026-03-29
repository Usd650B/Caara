import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
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

  const colorCount = product.colors?.length || 0;
  const optionsCount = (product.colors?.length || 0) + (product.sizes?.length || 0);

  const isCompact = variant === 'compact';

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col h-full bg-white transition-all hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-[#F7F7F7] rounded-[16px] mb-3 aspect-[4/5] p-2 pb-0 sm:p-4 sm:pb-0 flex items-end justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[95%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-xs text-center px-2">No image available</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm ${
              product.badge === 'Sale' ? 'bg-red-600 text-white' : 
              product.badge === 'New' ? 'bg-black text-white' : 'bg-gray-900 text-white'
            }`}>
              {t(product.badge)}
            </span>
          )}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-1 rounded-sm shadow-sm animate-pulse">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-600 text-white px-2 py-1 rounded-sm shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              onToggleFavorite(e, product.id as string);
            }}
            className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10 md:opacity-0 md:group-hover:opacity-100 ${
              isFavorited ? 'opacity-100 scale-110' : 'hover:scale-110'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>
        )}

        {/* Color count indicator */}
        {colorCount > 1 && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex gap-1 z-10">
            <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-semibold text-gray-800 shadow-sm">
              +{colorCount} Colors
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow px-1">
        <h3 className="text-gray-700 line-clamp-2 text-xs sm:text-[13px] font-normal leading-snug mb-1 group-hover:text-black transition-colors min-h-[2.6em]">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded-sm">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Rating & Options */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-black text-black" />
            </div>
            <span className="text-[11px] font-medium text-gray-700">
              {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
            </span>
            <span className="text-[10px] text-gray-400">
              ({product.reviews || Math.floor(Math.random() * 200 + 50)})
            </span>
          </div>
          
          {optionsCount > 1 && (
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
              {optionsCount} options
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
