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
      className="group flex flex-col h-full bg-transparent transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50/80 rounded-[24px] mb-4 aspect-[4/5] p-4 flex items-center justify-center group-hover:bg-gray-100/80 transition-colors duration-500">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-xs text-center px-2">No image available</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
              product.badge === 'Sale' ? 'bg-red-600 text-white' : 
              product.badge === 'New' ? 'bg-black text-white' : 'bg-gray-900 text-white'
            }`}>
              {t(product.badge)}
            </span>
          )}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2.5 py-1 rounded-full shadow-sm animate-pulse">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-600 text-white px-2.5 py-1 rounded-full shadow-sm">
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
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 ${
              isFavorited ? 'opacity-100 scale-110 !translate-x-0' : 'hover:scale-110'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-black'
              }`} 
            />
          </button>
        )}

        {/* Color count indicator */}
        {colorCount > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-1 z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-800 shadow-sm">
              +{colorCount} Colors
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow px-1">
        <h3 className="text-gray-800 line-clamp-2 text-[13px] sm:text-[14px] font-medium leading-relaxed mb-1.5 group-hover:text-black transition-colors min-h-[2.8em]">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <span className="font-semibold text-gray-900 text-sm sm:text-[15px]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Rating & Options */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-[11px] font-medium text-gray-700">
              {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
            </span>
            <span className="text-[10px] text-gray-400">
              ({product.reviews || Math.floor(Math.random() * 200 + 50)})
            </span>
          </div>
          
          {optionsCount > 1 && (
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded-sm">
              {optionsCount} options
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
