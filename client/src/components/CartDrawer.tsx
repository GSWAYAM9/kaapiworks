import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from './Button';

export const CartDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    cart,
    itemCount,
    subtotal,
    shipping,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 1499;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const items = cart?.items || [];

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderConfirmed(true);
      clearCart();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B1D16]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6F0] shadow-2xl flex flex-col border-l border-[#2B1D16]/15 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#2B1D16]/10 flex items-center justify-between bg-[#F4EDE3]">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[#2B1D16]">Your Coffee Bag</h2>
              <span className="text-xs font-semibold text-[#2B1D16]/60 tabular-nums">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-[#2B1D16]/70 hover:text-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-[#FAF6F0] border-b border-[#2B1D16]/8">
            <div className="flex items-center justify-between text-xs mb-1.5">
              {amountToFreeShipping > 0 ? (
                <span className="text-[#2B1D16]/80 font-medium">
                  Add <strong className="text-[#C2622D]">{formatINR(amountToFreeShipping)}</strong> more for{' '}
                  <strong>Free Express Shipping</strong>
                </span>
              ) : (
                <span className="text-[#2F4A3A] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  You've unlocked Free Express Shipping!
                </span>
              )}
              <span className="font-mono text-[11px] text-[#2B1D16]/60">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#2B1D16]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C2622D] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {orderConfirmed ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#2F4A3A]/10 text-[#2F4A3A] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B1D16] mb-2">Order Confirmed!</h3>
                <p className="text-sm text-[#2B1D16]/75 mb-1">
                  Thank you for supporting artisanal South Indian estates.
                </p>
                <p className="text-xs font-mono text-[#C2622D] mb-6">Order ID: #KW-{Math.floor(10000 + Math.random() * 90000)}</p>
                <Button
                  onClick={() => {
                    setOrderConfirmed(false);
                    closeDrawer();
                  }}
                  variant="primary"
                >
                  Continue Exploring
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#2B1D16]/5 text-[#2B1D16]/40 flex items-center justify-center mb-3">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2B1D16] mb-1">Your bag is empty</h3>
                <p className="text-xs text-[#2B1D16]/60 max-w-xs mb-6">
                  Discover fresh small-batch roasts and manual brewing equipment from Indian estates.
                </p>
                <Link to="/products" onClick={closeDrawer}>
                  <Button variant="primary" size="sm">
                    Browse All Roasts
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#2B1D16]/8">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const img = product.images?.[0]?.url || getFallbackImage(product.name);

                  return (
                    <div key={item._id || product._id} className="py-4 flex gap-4">
                      {/* Thumbnail */}
                      <Link
                        to={`/products/${product._id}`}
                        onClick={closeDrawer}
                        className="w-20 h-20 bg-[#E8DECF]/40 rounded-lg overflow-hidden shrink-0 border border-[#2B1D16]/10"
                      >
                        <img
                          src={img}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getFallbackImage(product.name);
                          }}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              to={`/products/${product._id}`}
                              onClick={closeDrawer}
                              className="font-serif text-sm font-bold text-[#2B1D16] hover:text-[#C2622D] transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(product._id)}
                              className="text-[#2B1D16]/40 hover:text-red-600 transition-colors p-1"
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {product.roastLevel && (
                            <span className="text-[11px] text-[#2B1D16]/60 uppercase tracking-wide">
                              {product.roastLevel} Roast
                            </span>
                          )}
                        </div>

                        {/* Price & Stepper */}
                        <div className="flex items-center justify-between mt-2 pt-1">
                          <div className="flex items-center border border-[#2B1D16]/20 rounded-md bg-[#F4EDE3]">
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity - 1)}
                              className="px-2 py-1 text-[#2B1D16]/70 hover:text-[#2B1D16] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold tabular-nums text-[#2B1D16]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity + 1)}
                              disabled={item.quantity >= product.stock}
                              className="px-2 py-1 text-[#2B1D16]/70 hover:text-[#2B1D16] disabled:opacity-30 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-bold tabular-nums text-[#2B1D16]">
                            {formatINR(item.itemTotal || item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && !orderConfirmed && (
            <div className="p-6 bg-[#F4EDE3] border-t border-[#2B1D16]/10 flex flex-col gap-3">
              {!isAuthenticated && (
                <div className="text-[11px] text-[#2B1D16]/70 bg-[#FAF6F0] p-2.5 rounded-lg border border-[#2B1D16]/10 flex items-center justify-between">
                  <span>Guest order. Sign in to track or save.</span>
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="font-semibold text-[#C2622D] hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-1.5 text-xs text-[#2B1D16]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#2B1D16]">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="tabular-nums font-medium">
                    {shipping === 0 ? (
                      <span className="text-[#2F4A3A] font-semibold">FREE</span>
                    ) : (
                      formatINR(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#2B1D16]/10 text-sm font-bold text-[#2B1D16]">
                  <span>Total</span>
                  <span className="tabular-nums text-base text-[#C2622D]">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#2B1D16]/20 hover:border-[#C2622D] text-xs font-bold uppercase tracking-wider text-[#2B1D16] hover:text-[#C2622D] bg-[#F4EDE3] transition-colors"
                >
                  <Gift className="w-3.5 h-3.5 text-[#C2622D]" />
                  <span>View Bag & Add Gift Note</span>
                </Link>

                <Button
                  onClick={handleCheckout}
                  isLoading={isCheckingOut}
                  variant="primary"
                  className="w-full"
                >
                  <span>Quick Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#2B1D16]/60 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F4A3A]" />
                <span>Small batch guaranteed · Safe Pan-India delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
