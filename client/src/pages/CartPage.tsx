import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Coffee,
  Coins,
  Gift,
  Check,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Order } from '../types';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, itemCount, subtotal, shipping: originalShipping, total: originalTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { success, error } = useToast();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [giftMessage, setGiftMessage] = useState('');

  // Bean Points Loyalty Redemption State
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const userPoints = user?.beanPoints !== undefined ? user.beanPoints : 150;
  const maxRedeemable = Math.min(userPoints, subtotal);
  const [pointsInput, setPointsInput] = useState<number>(Math.min(userPoints, Math.min(100, subtotal)));

  const items = cart?.items || [];
  const freeShippingThreshold = 1499;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Compute points discount
  const actualRedeemedPoints = isRedeemingPoints && isAuthenticated
    ? Math.min(Math.max(0, pointsInput), maxRedeemable)
    : 0;
  const pointsDiscount = actualRedeemedPoints * 1; // 1 Bean Point = ₹1
  const netSubtotal = Math.max(0, subtotal - pointsDiscount);
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = netSubtotal + shipping;
  const pointsToEarn = Math.floor(netSubtotal / 10); // 1 point per ₹10 spent

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      if (isAuthenticated) {
        const orderData = await api.createOrder({
          shippingAddress: user?.shippingAddress,
          paymentMethod: 'UPI / NetBanking',
          pointsToRedeem: actualRedeemedPoints,
          giftMessage: giftMessage.trim() || undefined,
        });
        setConfirmedOrder(orderData);
        setOrderConfirmed(true);
        clearCart();
        await checkAuth(); // Refresh user bean points balance
        success('Order placed successfully! Bean Points updated.');
      } else {
        // Guest simulated checkout
        setTimeout(() => {
          setConfirmedOrder({
            _id: `guest_ord_${Date.now()}`,
            orderNumber: `KW-${Math.floor(10000 + Math.random() * 90000)}`,
            user: 'guest',
            items: items.map((it) => ({
              _id: it._id || `item_${Date.now()}`,
              product: it.product,
              name: it.product.name,
              price: it.product.price,
              quantity: it.quantity,
              image: it.product.images?.[0]?.url,
              roastLevel: it.product.roastLevel,
            })),
            subtotal,
            shipping,
            total: grandTotal,
            status: 'confirmed',
            giftMessage: giftMessage.trim() || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setOrderConfirmed(true);
          clearCart();
        }, 800);
      }
    } catch (err: any) {
      error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderConfirmed) {
    const orderNum = confirmedOrder?.orderNumber || `KW-${Math.floor(10000 + Math.random() * 90000)}`;
    return (
      <div className="bg-[#F4EDE3] min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center bg-[#FAF6F0] p-8 sm:p-10 rounded-2xl border border-[#2B1D16]/10 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#2F4A3A]/10 text-[#2F4A3A] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F4A3A]">
            Payment Authorized
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2B1D16] mt-1 mb-2">
            Order #{orderNum} Placed
          </h1>
          <p className="text-sm text-[#2B1D16]/75 leading-relaxed mb-5">
            Thank you for supporting smallholder shade-grown coffee estates. Your order is queued for small-batch roasting in Bengaluru and will be dispatched via express air courier.
          </p>

          {/* Loyalty points confirmation badge */}
          {isAuthenticated && (
            <div className="bg-[#2B1D16]/5 border border-[#C2622D]/20 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#C2622D]" />
                <span className="font-serif font-bold text-xs text-[#2B1D16]">
                  Bean Points Club Rewards
                </span>
              </div>
              {confirmedOrder?.pointsRedeemed ? (
                <div className="text-xs text-[#2B1D16]/80 flex justify-between">
                  <span>Redeemed Points:</span>
                  <span className="font-bold text-[#C2622D]">-{confirmedOrder.pointsRedeemed} pts (₹{confirmedOrder.pointsDiscount} off)</span>
                </div>
              ) : null}
              <div className="text-xs text-[#2F4A3A] font-semibold flex justify-between pt-1 border-t border-[#2B1D16]/10">
                <span>Points Earned on this Order:</span>
                <span>+{confirmedOrder?.pointsEarned || pointsToEarn} Bean Points</span>
              </div>
              <div className="text-[11px] text-[#2B1D16]/60">
                Updated balance: <strong className="text-[#2B1D16] font-mono">{user?.beanPoints ?? 0} Bean Points</strong>
              </div>
            </div>
          )}

          {/* Gift Message on Order Confirmation */}
          {confirmedOrder?.giftMessage && (
            <div className="bg-[#FFFDF9] border border-[#C2622D]/30 rounded-xl p-4 mb-6 text-left shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#C2622D] mb-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>Personalized Gift Note Attached</span>
              </div>
              <p className="text-xs italic text-[#2B1D16]/90 font-serif leading-relaxed bg-[#F4EDE3]/40 p-2.5 rounded-lg border border-[#2B1D16]/5">
                "{confirmedOrder.giftMessage}"
              </p>
              <span className="text-[10px] text-[#2B1D16]/60 mt-1.5 block">
                Our roastery team will hand-write this note on textured cotton parchment with a wax seal.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            {confirmedOrder?._id && (
              <Link to={`/orders/${confirmedOrder._id}`} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full">
                  <Package className="w-4 h-4 mr-1.5" />
                  <span>Track Order</span>
                </Button>
              </Link>
            )}
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <span>Explore Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F4EDE3] min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <EmptyState
            title="Your coffee bag is empty"
            description="Explore our fresh seasonal single-origin roasts, brass filter sets, and precision manual burr grinders."
            actionText="Discover All Roasts"
            onAction={() => (window.location.href = '/products')}
            icon={<Coffee className="w-8 h-8" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4EDE3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B1D16]/70 hover:text-[#C2622D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 border-b border-[#2B1D16]/10 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
              Shopping Bag
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#2B1D16] mt-1">Review Your Order</h1>
          </div>
          <span className="text-sm font-medium text-[#2B1D16]/70 tabular-nums">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in bag
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Free shipping banner */}
            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#2B1D16]/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                {amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-[#C2622D]">{formatINR(amountToFreeShipping)}</strong> more to qualify for <strong>Free Express Shipping</strong>
                  </span>
                ) : (
                  <span className="text-[#2F4A3A] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Congratulations! You've unlocked Free Express Shipping!
                  </span>
                )}
                <span className="font-mono text-xs">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#2B1D16]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C2622D] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#2B1D16]/10 divide-y divide-[#2B1D16]/10 overflow-hidden shadow-xs">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const img = product.images?.[0]?.url || getFallbackImage(product.name);

                return (
                  <div key={item._id || product._id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                    <div className="flex gap-4 items-center flex-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="w-20 h-20 rounded-lg bg-[#E8DECF]/30 overflow-hidden shrink-0 border border-[#2B1D16]/10"
                      >
                        <img
                          src={img}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex flex-col gap-1">
                        <Link
                          to={`/products/${product._id}`}
                          className="font-serif text-base font-bold text-[#2B1D16] hover:text-[#C2622D] transition-colors"
                        >
                          {product.name}
                        </Link>
                        {product.roastLevel && (
                          <span className="text-xs text-[#2B1D16]/60 uppercase tracking-wide">
                            {product.roastLevel} Roast {product.estate ? `· ${product.estate}` : ''}
                          </span>
                        )}
                        <span className="text-xs font-semibold tabular-nums text-[#2B1D16]/70">
                          {formatINR(product.price)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#2B1D16]/20 rounded-lg bg-[#F4EDE3]">
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          className="px-2.5 py-1 text-[#2B1D16]/70 hover:text-[#2B1D16] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold tabular-nums text-[#2B1D16]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="px-2.5 py-1 text-[#2B1D16]/70 hover:text-[#2B1D16] disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="font-serif text-lg font-bold tabular-nums text-[#2B1D16] min-w-[90px] text-right">
                        {formatINR(item.itemTotal || item.unitPrice * item.quantity)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="text-[#2B1D16]/40 hover:text-red-600 transition-colors p-1.5 cursor-pointer"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gift Message Section */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#2B1D16]/10 p-5 sm:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#2B1D16] flex items-center gap-2">
                      <span>Personalized Gift Message</span>
                      <span className="text-[10px] font-sans font-semibold text-[#2F4A3A] bg-[#2F4A3A]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Complimentary Card
                      </span>
                    </h3>
                    <p className="text-xs text-[#2B1D16]/70 mt-0.5">
                      Sending this coffee as a gift? Add a personal note to be hand-written on cotton parchment with a wax seal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-3 pt-3 border-t border-[#2B1D16]/10">
                <label htmlFor="giftMessageInput" className="block text-xs font-semibold text-[#2B1D16]">
                  Gift Note / Message (Optional)
                </label>
                <textarea
                  id="giftMessageInput"
                  rows={3}
                  maxLength={500}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="e.g. Wishing you rich, aromatic mornings with fresh Chikmagalur single-origin beans! Happy Birthday, Priya — with lots of love."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F4EDE3]/70 border border-[#2B1D16]/20 rounded-lg text-[#2B1D16] placeholder-[#2B1D16]/40 focus:outline-none focus:border-[#C2622D] focus:ring-1 focus:ring-[#C2622D] transition-all resize-none"
                />

                <div className="flex items-center justify-between text-[11px] text-[#2B1D16]/65">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C2622D]" />
                    <span>Inscribed on handmade paper and enclosed in the coffee box</span>
                  </span>
                  <span className="font-mono text-xs font-medium">
                    {giftMessage.length} / 500 chars
                  </span>
                </div>

                {/* Quick note suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-[#2B1D16]/60 font-bold uppercase tracking-wider">
                    Quick Notes:
                  </span>
                  {[
                    'Happy Birthday! Enjoy these fresh artisanal estate roasts.',
                    'Warmest congratulations! Here is to fresh beginnings and soulful cups.',
                    'A special coffee treat to brighten your mornings. Enjoy every sip!',
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGiftMessage(suggestion)}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#2B1D16]/5 hover:bg-[#C2622D]/15 hover:text-[#C2622D] text-[#2B1D16]/80 transition-colors cursor-pointer border border-[#2B1D16]/10"
                    >
                      "{suggestion.slice(0, 26)}..."
                    </button>
                  ))}
                  {giftMessage && (
                    <button
                      type="button"
                      onClick={() => setGiftMessage('')}
                      className="text-[11px] text-[#B91C1C] hover:underline font-semibold ml-auto cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-[#FAF6F0] p-6 rounded-xl border border-[#2B1D16]/10 flex flex-col gap-4 shadow-xs">
              <h2 className="font-serif text-xl font-bold text-[#2B1D16] pb-3 border-b border-[#2B1D16]/10">
                Order Summary
              </h2>

              {/* Loyalty Bean Points Section */}
              {isAuthenticated ? (
                <div className="bg-[#F4EDE3] border border-[#2B1D16]/15 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-serif text-xs font-bold text-[#2B1D16] block">
                          Bean Points Club
                        </span>
                        <span className="text-[11px] text-[#2B1D16]/70">
                          Balance: <strong className="font-mono text-[#C2622D]">{userPoints} pts</strong> (worth {formatINR(userPoints)})
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRedeemingPoints}
                        onChange={(e) => {
                          setIsRedeemingPoints(e.target.checked);
                          if (e.target.checked && pointsInput === 0) {
                            setPointsInput(Math.min(userPoints, subtotal));
                          }
                        }}
                        disabled={userPoints <= 0}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#2B1D16]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C2622D]" />
                    </label>
                  </div>

                  {isRedeemingPoints && userPoints > 0 && (
                    <div className="pt-2 border-t border-[#2B1D16]/10 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2B1D16]/70">Redeem points:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={maxRedeemable}
                            value={pointsInput}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setPointsInput(isNaN(val) ? 0 : Math.max(0, Math.min(val, maxRedeemable)));
                            }}
                            className="w-16 px-2 py-1 text-xs text-right font-mono font-bold bg-[#FAF6F0] border border-[#2B1D16]/20 rounded focus:outline-none focus:border-[#C2622D]"
                          />
                          <span className="text-[11px] font-semibold text-[#2B1D16]">pts</span>
                        </div>
                      </div>

                      {/* Quick Point Selectors */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setPointsInput(maxRedeemable)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2B1D16]/10 hover:bg-[#C2622D] hover:text-[#FAF6F0] text-[#2B1D16] transition-colors cursor-pointer"
                        >
                          Max ({maxRedeemable} pts)
                        </button>
                        {maxRedeemable >= 50 && (
                          <button
                            type="button"
                            onClick={() => setPointsInput(50)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2B1D16]/10 hover:bg-[#C2622D] hover:text-[#FAF6F0] text-[#2B1D16] transition-colors cursor-pointer"
                          >
                            50 pts
                          </button>
                        )}
                        {maxRedeemable >= 100 && (
                          <button
                            type="button"
                            onClick={() => setPointsInput(100)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2B1D16]/10 hover:bg-[#C2622D] hover:text-[#FAF6F0] text-[#2B1D16] transition-colors cursor-pointer"
                          >
                            100 pts
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-[#2F4A3A] font-semibold flex items-center justify-between pt-1">
                        <span>Discount applied:</span>
                        <span>-{formatINR(pointsDiscount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs bg-[#F4EDE3] p-3 rounded-xl border border-[#2B1D16]/10 text-[#2B1D16]/80 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#C2622D]" />
                    <span>Earn Bean Points on every order</span>
                  </div>
                  <Link to="/login" className="font-bold text-[#C2622D] hover:underline shrink-0">
                    Sign in
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-2.5 text-sm text-[#2B1D16]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold text-[#2B1D16]">
                    {formatINR(subtotal)}
                  </span>
                </div>

                {actualRedeemedPoints > 0 && (
                  <div className="flex justify-between text-[#C2622D]">
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      <span>Bean Points Discount</span>
                      <span className="text-[10px] bg-[#C2622D]/15 px-1.5 py-0.2 rounded font-mono">
                        -{actualRedeemedPoints} pts
                      </span>
                    </span>
                    <span className="tabular-nums font-bold">
                      -{formatINR(pointsDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="tabular-nums font-semibold">
                    {shipping === 0 ? (
                      <span className="text-[#2F4A3A]">FREE</span>
                    ) : (
                      formatINR(shipping)
                    )}
                  </span>
                </div>

                {giftMessage.trim() && (
                  <div className="flex justify-between items-center text-xs text-[#2B1D16]/85 bg-[#FAF6F0] p-2 rounded-lg border border-[#C2622D]/25">
                    <span className="flex items-center gap-1.5 text-[#C2622D] font-medium">
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      <span>Artisanal Gift Card</span>
                    </span>
                    <span className="font-mono font-bold text-[#2F4A3A] text-[11px]">
                      FREE
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-[#2B1D16]/10 text-base font-bold text-[#2B1D16]">
                  <span>Total (INR)</span>
                  <span className="tabular-nums text-xl text-[#C2622D]">
                    {formatINR(grandTotal)}
                  </span>
                </div>

                {/* Points to be earned notification */}
                <div className="bg-[#2F4A3A]/10 border border-[#2F4A3A]/20 rounded-lg p-2.5 mt-1 text-xs text-[#2F4A3A] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>You'll earn on this order:</span>
                  </span>
                  <strong className="font-mono font-bold">+{pointsToEarn} Bean Points</strong>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                isLoading={isCheckingOut}
                variant="primary"
                size="lg"
                className="w-full mt-2"
              >
                <span>Authorize & Pay {formatINR(grandTotal)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#2B1D16]/60 text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-[#2F4A3A]" />
                <span>256-bit SSL encrypted · Authentic Indian Estates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
