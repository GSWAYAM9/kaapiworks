import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { RoastIndicator } from './RoastIndicator';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [imageSrc, setImageSrc] = useState(
    product.images?.[0]?.url || getFallbackImage(product.name)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isCoffee = Boolean(product.roastLevel);
  const wishlisted = isWishlisted(product._id);

  const categoryName =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : 'Specialty Coffee';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    await addToCart(product._id, 1, product);
    setIsAdding(false);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    await toggleWishlist(product._id, product);
    setIsTogglingWishlist(false);
  };

  return (
    <div className="group flex flex-col bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#2B1D16]/20">
      {/* Product Image Slot */}
      <div className="relative block w-full aspect-4/3 bg-[#E8DECF]/40 overflow-hidden">
        <Link
          to={`/products/${product._id}`}
          className="block w-full h-full"
        >
          <img
            src={imageSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageSrc(getFallbackImage(product.name))}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Stock Status Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {isOutOfStock ? (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#2B1D16] text-[#FAF6F0]">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#C2622D] text-[#FAF6F0]">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
            wishlisted
              ? 'bg-[#FAF6F0] text-[#C2622D] scale-100 hover:scale-110'
              : 'bg-[#FAF6F0]/85 backdrop-blur-xs text-[#2B1D16]/60 hover:text-[#C2622D] hover:bg-[#FAF6F0] hover:scale-110 opacity-90 group-hover:opacity-100'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              wishlisted ? 'fill-[#C2622D] text-[#C2622D]' : 'stroke-current'
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#2B1D16]/60">
            <span className="font-semibold uppercase tracking-wider">{categoryName}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#C2622D] fill-[#C2622D]" />
              <span className="font-bold text-[#2B1D16] font-mono text-[11px]">
                {(product.averageRating || 0) > 0 ? (product.averageRating || 0).toFixed(1) : '5.0'}
              </span>
              {Boolean(product.reviewCount) && (
                <span className="text-[10px] text-[#2B1D16]/50">({product.reviewCount})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`} className="group-hover:text-[#C2622D] transition-colors">
            <h3 className="font-serif text-lg font-bold text-[#2B1D16] leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Coffee Roast Profile & Tasting Notes */}
          {isCoffee && (
            <div className="mt-1 flex flex-col gap-1.5">
              <RoastIndicator level={product.roastLevel} />

              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div className="text-xs text-[#2B1D16]/75 line-clamp-1">
                  {product.tastingNotes.map((note, index) => (
                    <span key={index}>
                      {note}
                      {index < (product.tastingNotes?.length || 0) - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Non-coffee description snippet */}
          {!isCoffee && (
            <p className="text-xs text-[#2B1D16]/65 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer: Price & Add Button */}
        <div className="pt-3 border-t border-[#2B1D16]/8 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#2B1D16]/50 uppercase tracking-wider">Price</span>
            <span className="text-base font-bold tabular-nums text-[#2B1D16]">
              {formatINR(product.price)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding || isLoading}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isOutOfStock
                ? 'bg-[#2B1D16]/10 text-[#2B1D16]/40 cursor-not-allowed'
                : 'bg-[#2B1D16] text-[#FAF6F0] hover:bg-[#C2622D] active:scale-95 shadow-2xs'
            }`}
            aria-label={`Quick buy ${product.name}`}
            title="Quick Buy - add directly to bag and open checkout drawer"
          >
            <Zap className={`w-3.5 h-3.5 ${isAdding ? 'animate-bounce' : 'fill-current text-[#FAF6F0]'}`} />
            <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Quick Buy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
