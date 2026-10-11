import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Coffee,
  Check,
  PackageOpen,
  ArrowLeft,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { RoastIndicator } from '../components/RoastIndicator';
import { Button } from '../components/Button';

export const WishlistPage: React.FC = () => {
  const { wishlist, items, itemCount, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { addToCart, openDrawer } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wishItem = items.find((it) => it.product._id === productId);
    if (!wishItem || wishItem.product.stock <= 0) return;

    setAddingId(productId);
    try {
      const added = await addToCart(productId, 1, wishItem.product);
      if (added) {
        success(`Added "${wishItem.product.name}" to your coffee bag!`);
      }
    } finally {
      setAddingId(null);
    }
  };

  const handleAddAllToCart = async () => {
    const inStockItems = items.filter((it) => it.product && it.product.stock > 0);
    if (inStockItems.length === 0) {
      error('No in-stock items to add to your bag.');
      return;
    }

    setIsAddingAll(true);
    let addedCount = 0;
    try {
      for (const item of inStockItems) {
        const added = await addToCart(item.product._id, 1, item.product);
        if (added) addedCount++;
      }
      if (addedCount > 0) {
        success(`Added ${addedCount} saved coffees to your bag!`);
        openDrawer();
      }
    } finally {
      setIsAddingAll(false);
    }
  };

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromWishlist(productId);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to remove all saved items from your wishlist?')) {
      setIsClearing(true);
      await clearWishlist();
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-[75vh] py-8 sm:py-12 bg-[#F4EDE3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#2B1D16]/60 mb-6 font-medium">
          <Link to="/" className="hover:text-[#C2622D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#2B1D16] font-semibold">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2B1D16]/10 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#C2622D] text-xs font-bold uppercase tracking-wider mb-1.5">
              <Heart className="w-4 h-4 fill-[#C2622D]" />
              <span>Personal Tasting Vault</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D16] tracking-tight">
              Your Saved Micro-Lots
            </h1>
            <p className="mt-1 text-sm text-[#2B1D16]/70 max-w-2xl">
              Handpicked estate coffees and brewing equipment saved for your future orders.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="px-3.5 py-2 text-xs font-medium text-[#2B1D16]/65 hover:text-red-600 hover:bg-red-50 border border-[#2B1D16]/15 rounded-md transition-colors cursor-pointer"
              >
                Clear Wishlist
              </button>

              <button
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                className="px-4 py-2 text-xs font-semibold bg-[#2B1D16] text-[#FAF6F0] hover:bg-[#C2622D] rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAddingAll ? 'Adding...' : 'Move In-Stock to Bag'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="py-20 px-6 max-w-xl mx-auto text-center bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-2xl shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E8DECF]/60 flex items-center justify-center text-[#C2622D]">
              <Heart className="w-8 h-8 stroke-current" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2B1D16] mb-2">
              Your wishlist is currently empty
            </h2>
            <p className="text-sm text-[#2B1D16]/70 mb-8 max-w-md mx-auto leading-relaxed">
              Explore our single-estate Chikmagalur harvests, artisanal cold brew blends, and precision grinders. Click the heart icon on any product to save it here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#2B1D16] text-[#FAF6F0] font-medium text-sm hover:bg-[#C2622D] transition-colors shadow-sm"
              >
                <Coffee className="w-4 h-4" />
                <span>Explore Specialty Coffees</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#2B1D16]/20 text-[#2B1D16] font-medium text-sm hover:bg-[#2B1D16]/5 transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-[#2B1D16]/60">
              <span>
                Showing <strong className="text-[#2B1D16]">{items.length}</strong> saved item
                {items.length !== 1 ? 's' : ''}
              </span>
              <span className="hidden sm:inline">
                Click any roast to view full origin details, cupping notes, and brew guide
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(({ _id: itemId, product, addedAt }) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isCoffee = Boolean(product.roastLevel);
                const categoryName =
                  typeof product.category === 'object' && product.category?.name
                    ? product.category.name
                    : 'Specialty Coffee';
                const formattedDate = new Date(addedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={itemId || product._id}
                    className="group flex flex-col bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl overflow-hidden hover:shadow-md hover:border-[#2B1D16]/20 transition-all duration-200"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-16/10 bg-[#E8DECF]/50 overflow-hidden">
                      <Link to={`/products/${product._id}`} className="block w-full h-full">
                        <img
                          src={product.images?.[0]?.url || getFallbackImage(product.name)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getFallbackImage(product.name);
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Stock Pill */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                        {isOutOfStock ? (
                          <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#2B1D16] text-[#FAF6F0]">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#C2622D] text-[#FAF6F0]">
                            Only {product.stock} Left
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#2F4A3A] text-[#FAF6F0]">
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Quick Remove Button */}
                      <button
                        onClick={(e) => handleRemove(product._id, e)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FAF6F0]/90 backdrop-blur-xs text-[#2B1D16]/60 hover:text-red-600 hover:bg-[#FAF6F0] hover:scale-110 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div className="space-y-2">
                        {/* Category & Estate */}
                        <div className="flex items-center justify-between text-xs text-[#2B1D16]/60">
                          <span className="font-semibold uppercase tracking-wider">
                            {categoryName}
                          </span>
                          {product.estate && (
                            <span className="font-medium truncate max-w-[150px]">
                              {product.estate}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link
                          to={`/products/${product._id}`}
                          className="block hover:text-[#C2622D] transition-colors"
                        >
                          <h3 className="font-serif text-lg font-bold text-[#2B1D16] leading-snug line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Roast Level & Tasting Notes */}
                        {isCoffee && (
                          <div className="pt-1 space-y-1.5">
                            <RoastIndicator level={product.roastLevel} />
                            {product.tastingNotes && product.tastingNotes.length > 0 && (
                              <div className="text-xs text-[#2B1D16]/75 line-clamp-1">
                                {product.tastingNotes.join(' · ')}
                              </div>
                            )}
                          </div>
                        )}

                        {!isCoffee && (
                          <p className="text-xs text-[#2B1D16]/65 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Added date timestamp badge */}
                      <div className="pt-2 border-t border-[#2B1D16]/8 flex items-center justify-between text-[11px] text-[#2B1D16]/50">
                        <span>Saved on {formattedDate}</span>
                        <span>Altitude: {product.altitude || '1,200m+'}</span>
                      </div>

                      {/* Bottom Footer: Price & Add to Bag */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-wider text-[#2B1D16]/50">
                            Price
                          </span>
                          <span className="text-lg font-bold tabular-nums text-[#2B1D16]">
                            {formatINR(product.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleAddToCart(product._id, e)}
                            disabled={isOutOfStock || addingId === product._id}
                            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                              isOutOfStock
                                ? 'bg-[#2B1D16]/10 text-[#2B1D16]/40 cursor-not-allowed'
                                : 'bg-[#2B1D16] text-[#FAF6F0] hover:bg-[#C2622D] active:scale-95'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>
                              {isOutOfStock
                                ? 'Sold Out'
                                : addingId === product._id
                                ? 'Adding...'
                                : 'Add to Bag'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
