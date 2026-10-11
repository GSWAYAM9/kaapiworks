import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCw, Plus, Minus, Coffee, Sparkles, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { RoastIndicator } from '../components/RoastIndicator';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { ProductReviews } from '../components/ProductReviews';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await api.getProductById(id);
        setProduct(data);
        setSelectedImageIndex(0);
        setQuantity(1);

        // Fetch related products in the same category
        const catSlug = typeof data.category === 'object' ? data.category?.slug : undefined;
        if (catSlug) {
          const res = await api.getProducts({ category: catSlug, limit: 4 });
          setRelatedProducts(res.data.filter((p) => p._id !== data._id).slice(0, 3));
        }
      } catch (err: any) {
        console.error('Failed to load product', err);
        setErrorMessage(err.message || 'Product not found.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#C2622D] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-wider text-[#2B1D16]/70">
            Unpacking roast details...
          </span>
        </div>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#2B1D16] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#2B1D16]/70 mb-6">{errorMessage || 'The requested product could not be located.'}</p>
        <Link to="/products">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isCoffee = Boolean(product.roastLevel);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: getFallbackImage(product.name), publicId: 'default' }];

  const currentImage = images[selectedImageIndex]?.url || getFallbackImage(product.name);

  const categoryName =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : 'Specialty Collection';

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(product._id, quantity, product);
    setIsAdding(false);
  };

  return (
    <div className="bg-[#F4EDE3] min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B1D16]/70 hover:text-[#C2622D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Roasts & Gear</span>
          </Link>
        </div>

        {/* Contiguous PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-[#FAF6F0] p-6 sm:p-10 rounded-2xl border border-[#2B1D16]/10 shadow-xs mb-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Primary Main Image */}
            <div className="relative aspect-4/3 sm:aspect-1/1 w-full bg-[#E8DECF]/30 rounded-xl overflow-hidden border border-[#2B1D16]/10">
              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getFallbackImage(product.name);
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Stock Tag */}
              <div className="absolute top-4 left-4">
                {isOutOfStock ? (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#2B1D16] text-[#FAF6F0]">
                    Sold Out
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#C2622D] text-[#FAF6F0]">
                    Only {product.stock} Left in Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#2F4A3A] text-[#FAF6F0]">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#C2622D] ring-2 ring-[#C2622D]/30'
                        : 'border-[#2B1D16]/15 hover:border-[#2B1D16]/40'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              {/* Category & Estate Origin */}
              <div className="flex items-center justify-between text-xs text-[#2B1D16]/70">
                <span className="font-semibold uppercase tracking-wider text-[#C2622D]">
                  {categoryName}
                </span>
                {product.estate && (
                  <span className="font-medium text-[#2B1D16]/80">{product.estate}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D16] leading-tight">
                {product.name}
              </h1>

              {/* Average Rating & Reviews Counter */}
              <div className="flex items-center gap-2 text-xs -mt-1">
                <div className="flex items-center gap-1 text-[#C2622D]">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.averageRating || 0)
                            ? 'text-[#C2622D] fill-[#C2622D]'
                            : 'text-[#2B1D16]/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold font-mono text-sm text-[#2B1D16] ml-1">
                    {(product.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-[#2B1D16]/30">·</span>
                <a
                  href="#reviews"
                  className="text-[#2B1D16]/75 hover:text-[#C2622D] font-medium underline-offset-2 hover:underline cursor-pointer"
                >
                  {product.reviewCount || 0}{' '}
                  {product.reviewCount === 1 ? 'customer review' : 'customer reviews'}
                </a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-serif text-3xl font-bold tabular-nums text-[#2B1D16]">
                  {formatINR(product.price)}
                </span>
                <span className="text-xs text-[#2B1D16]/60">Inclusive of all taxes</span>
              </div>

              {/* Coffee Specifications */}
              {isCoffee && (
                <div className="p-4 rounded-xl bg-[#F4EDE3] border border-[#2B1D16]/10 flex flex-col gap-3 my-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#2B1D16]/60 uppercase tracking-wider">
                      Roast Profile
                    </span>
                    <RoastIndicator level={product.roastLevel} showLabel={true} size="md" />
                  </div>

                  {product.tastingNotes && product.tastingNotes.length > 0 && (
                    <div className="flex items-start justify-between gap-4 pt-2 border-t border-[#2B1D16]/8 text-xs">
                      <span className="text-[#2B1D16]/60 uppercase tracking-wider shrink-0">
                        Tasting Notes
                      </span>
                      <strong className="text-[#2B1D16] text-right">
                        {product.tastingNotes.join(' · ')}
                      </strong>
                    </div>
                  )}

                  {product.altitude && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#2B1D16]/8 text-xs">
                      <span className="text-[#2B1D16]/60 uppercase tracking-wider">Elevation</span>
                      <span className="text-[#2B1D16] font-medium">{product.altitude}</span>
                    </div>
                  )}

                  {product.process && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#2B1D16]/8 text-xs">
                      <span className="text-[#2B1D16]/60 uppercase tracking-wider">Processing</span>
                      <span className="text-[#2B1D16] font-medium">{product.process}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-[#2B1D16]/80 leading-relaxed pt-1">
                {product.description}
              </p>

              {/* Quantity Stepper & Buy Action */}
              <div className="pt-4 border-t border-[#2B1D16]/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center justify-between sm:justify-start border border-[#2B1D16]/20 rounded-lg bg-[#FAF6F0] px-3 py-2 gap-4">
                  <span className="text-xs uppercase font-semibold text-[#2B1D16]/60 sm:hidden">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-1 rounded text-[#2B1D16]/70 hover:text-[#2B1D16] disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-[#2B1D16]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="p-1 rounded text-[#2B1D16]/70 hover:text-[#2B1D16] disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Add to Cart Button & Wishlist Button */}
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding || isCartLoading}
                    isLoading={isAdding}
                    variant="primary"
                    size="lg"
                    className="flex-1 shadow-md"
                  >
                    <ShoppingBag className="w-5 h-5 mr-1" />
                    <span>
                      {isOutOfStock
                        ? 'Currently Out of Stock'
                        : `Add to Bag · ${formatINR(product.price * quantity)}`}
                    </span>
                  </Button>

                  <button
                    onClick={() => toggleWishlist(product._id, product)}
                    aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Save to wishlist'}
                    title={isWishlisted(product._id) ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={`h-[48px] px-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      isWishlisted(product._id)
                        ? 'border-[#C2622D] bg-[#C2622D]/10 text-[#C2622D]'
                        : 'border-[#2B1D16]/20 bg-[#FAF6F0] text-[#2B1D16]/70 hover:text-[#C2622D] hover:border-[#C2622D]/50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted(product._id) ? 'fill-[#C2622D]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Policies */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2B1D16]/10 text-center text-xs text-[#2B1D16]/70">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#C2622D]" />
                <span className="font-semibold text-[#2B1D16]">Express Pan-India</span>
                <span className="text-[10px]">Free above ₹1,499</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#C2622D]" />
                <span className="font-semibold text-[#2B1D16]">Roasted to Order</span>
                <span className="text-[10px]">Small batches</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#C2622D]" />
                <span className="font-semibold text-[#2B1D16]">Direct Estate</span>
                <span className="text-[10px]">Fair-trade pay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Product Reviews */}
        <ProductReviews
          productId={product._id}
          productName={product.name}
          onReviewAdded={async () => {
            const updated = await api.getProductById(product._id);
            setProduct(updated);
          }}
        />

        {/* Related Estate Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
                  Sensory Pairings
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#2B1D16] mt-1">
                  You Might Also Enjoy
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold text-[#2B1D16] hover:text-[#C2622D]"
              >
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
