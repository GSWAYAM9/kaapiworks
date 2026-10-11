import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  MapPin,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Coffee,
  ExternalLink,
  Heart,
  Coins,
  Gift,
  Trophy,
  Check,
} from 'lucide-react';
import { Order, User, ShippingAddress } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { ActiveOrdersDashboard } from '../components/ActiveOrdersDashboard';

export const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const { reorderOrder } = useCart();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  // Order Details Modal state
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.shippingAddress?.street || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [stateName, setStateName] = useState(user?.shippingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(user?.shippingAddress?.country || 'India');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setStreet(user.shippingAddress?.street || '');
      setCity(user.shippingAddress?.city || '');
      setStateName(user.shippingAddress?.state || '');
      setPostalCode(user.shippingAddress?.postalCode || '');
      setCountry(user.shippingAddress?.country || 'India');
    }
  }, [user]);

  useEffect(() => {
    async function loadOrders() {
      setIsLoadingOrders(true);
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err: any) {
        error(err.message || 'Failed to retrieve order history.');
      } finally {
        setIsLoadingOrders(false);
      }
    }

    loadOrders();
  }, [error]);

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam && orders.length > 0) {
      const match = orders.find(
        (o) => o._id === orderParam || o.orderNumber === orderParam
      );
      if (match) {
        setSelectedOrder(match);
        setIsDetailsModalOpen(true);
      }
    }
  }, [searchParams, orders]);

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
    setSearchParams({ order: order.orderNumber });
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSearchParams({});
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setSelectedOrder(updatedOrder);
    setOrders((prev) =>
      prev.map((ord) => (ord._id === updatedOrder._id ? updatedOrder : ord))
    );
  };

  const handleOpenChatWithOrder = (orderNumber: string) => {
    setIsDetailsModalOpen(false);
    window.dispatchEvent(
      new CustomEvent('open-coffee-chat', {
        detail: {
          prompt: `Hello! I have a question regarding my order ${orderNumber}. Can you help me check its status or bean roast details?`,
        },
      })
    );
  };

  const handleReorder = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.items || order.items.length === 0) {
      error('No items found in this order to reorder.');
      return;
    }
    setReorderingOrderId(order._id);
    try {
      await reorderOrder(order.items);
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await api.updateProfile({
        name,
        phone,
        shippingAddress: {
          street,
          city,
          state: stateName,
          postalCode,
          country,
        },
      });
      await checkAuth();
      success('Shipping address and profile updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#2F4A3A]/15 text-[#2F4A3A]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'dispatched':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#C2622D]/15 text-[#C2622D]">
            <Truck className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
        );
      case 'roasted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Freshly Roasted</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#2B1D16]/10 text-[#2B1D16]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#2B1D16]/10 text-[#2B1D16]">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
    }
  };

  // Coffee Rewards & Tier Milestone Calculations
  const currentPoints = user?.beanPoints !== undefined ? user.beanPoints : 150;
  const rewardTiers = [
    { target: 100, reward: '₹100 Off', tierName: 'Bronze Roaster' },
    { target: 250, reward: '₹250 Off', tierName: 'Silver Peaberry' },
    { target: 500, reward: '₹500 Off', tierName: 'Gold Estate' },
    { target: 1000, reward: '₹1,000 Off', tierName: 'Master Cupper' },
  ];
  const nextTier =
    rewardTiers.find((t) => t.target > currentPoints) || {
      target: Math.ceil((currentPoints + 150) / 250) * 250,
      reward: `₹${Math.ceil((currentPoints + 150) / 250) * 250} Off`,
      tierName: 'Elite Patron',
    };
  const pointsToNextDiscount = Math.max(0, nextTier.target - currentPoints);
  const rewardProgressPercent = Math.min(
    100,
    Math.max(6, Math.round((currentPoints / nextTier.target) * 100))
  );

  return (
    <div className="bg-[#F4EDE3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#2B1D16]/10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2B1D16] text-[#FAF6F0] flex items-center justify-center shadow-xs">
              <UserIcon className="w-6 h-6 text-[#C2622D]" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C2622D]">
                Customer Account
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                {user?.name || 'Your Profile'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#2B1D16]/70">
            <Link
              to="/wishlist"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2B1D16]/15 bg-[#FAF6F0] hover:bg-[#C2622D] hover:text-[#FAF6F0] hover:border-[#C2622D] text-xs font-semibold text-[#2B1D16] transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>Saved Items (Wishlist)</span>
            </Link>

            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#C2622D]" />
              <span className="font-medium">{user?.email}</span>
            </div>
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#2B1D16]/10 text-[#2B1D16] font-bold">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Active Orders Tracking Dashboard */}
        <ActiveOrdersDashboard orders={orders} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Editable Profile & Address Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#2B1D16]/10 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-[#2B1D16] mb-1">
                Personal Information & Address
              </h2>
              <p className="text-xs text-[#2B1D16]/70 mb-5">
                Update your contact details and default delivery address for express Pan-India coffee dispatches.
              </p>

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                />

                <Input
                  label="Email (Account ID)"
                  value={user?.email || ''}
                  disabled
                  hint="Email cannot be modified"
                />

                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99801 12345"
                />

                <div className="pt-3 border-t border-[#2B1D16]/8 flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
                    Shipping Destination
                  </span>

                  <Input
                    label="Street / Apartment / Landmark"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 402, Nilgiri Heights"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                    />
                    <Input
                      label="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Karnataka"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Postal Code (PIN)"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 560008"
                    />
                    <Input
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                >
                  Save Profile Information
                </Button>
              </form>
            </div>

            {/* Coffee Rewards Section */}
            <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#2B1D16]/10 shadow-xs space-y-5">
              {/* Header with Balance */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2B1D16]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center shadow-2xs">
                    <Gift className="w-5 h-5 text-[#C2622D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif text-lg font-bold text-[#2B1D16]">
                        Coffee Rewards
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#C2622D]/15 text-[#C2622D]">
                        {nextTier.tierName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#2B1D16]/65 block">
                      Bean Points Loyalty Program
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#2B1D16]/60 block font-semibold">
                    Points Balance
                  </span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-mono text-xl font-bold text-[#C2622D]">
                      {currentPoints}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#2B1D16]">
                      pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Toward Next Discount */}
              <div className="bg-[#F4EDE3] p-4 rounded-xl border border-[#2B1D16]/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2B1D16] flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#C2622D]" />
                    <span>Next Milestone: {nextTier.reward}</span>
                  </span>
                  <span className="font-mono font-bold text-[#C2622D]">
                    {rewardProgressPercent}%
                  </span>
                </div>

                {/* Styled Progress Bar */}
                <div
                  className="w-full bg-[#2B1D16]/10 h-3 rounded-full overflow-hidden p-0.5 border border-[#2B1D16]/10 relative"
                  role="progressbar"
                  aria-valuenow={currentPoints}
                  aria-valuemin={0}
                  aria-valuemax={nextTier.target}
                  aria-label="Progress toward next discount"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#C2622D] to-[#D97706] rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${rewardProgressPercent}%` }}
                  />
                </div>

                {/* Progress Details & Distance */}
                <div className="flex items-center justify-between text-[11px] text-[#2B1D16]/75 pt-0.5">
                  <span className="font-mono">
                    <strong className="text-[#2B1D16]">{currentPoints}</strong> / {nextTier.target} pts
                  </span>
                  <span className="font-medium text-[#2F4A3A]">
                    {pointsToNextDiscount === 0
                      ? 'Milestone unlocked! Ready to redeem.'
                      : `${pointsToNextDiscount} more pts for ${nextTier.reward}`}
                  </span>
                </div>

                {/* Milestone Tiers Grid */}
                <div className="pt-2 border-t border-[#2B1D16]/10 grid grid-cols-4 gap-1.5 text-center">
                  {rewardTiers.map((tier) => {
                    const isAchieved = currentPoints >= tier.target;
                    const isCurrentGoal = nextTier.target === tier.target;

                    return (
                      <div
                        key={tier.target}
                        className={`p-1.5 rounded-lg text-[10px] transition-all ${
                          isAchieved
                            ? 'bg-[#2F4A3A]/10 border border-[#2F4A3A]/20 text-[#2F4A3A]'
                            : isCurrentGoal
                            ? 'bg-[#C2622D]/10 border border-[#C2622D]/30 text-[#C2622D] font-bold ring-1 ring-[#C2622D]/30'
                            : 'bg-white/40 border border-[#2B1D16]/5 text-[#2B1D16]/50'
                        }`}
                      >
                        <div className="font-mono font-bold flex items-center justify-center gap-0.5">
                          {isAchieved && <Check className="w-2.5 h-2.5 text-[#2F4A3A]" />}
                          <span>{tier.target} pts</span>
                        </div>
                        <div className="text-[9px] truncate font-medium mt-0.5">
                          {tier.reward}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rewards Program Rules & Value */}
              <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#2B1D16]/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#2B1D16]/70">Current Redemption Value:</span>
                  <span className="font-bold text-[#2F4A3A] font-mono">
                    {formatINR(currentPoints)} off
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#2B1D16]/70">Earning Rate:</span>
                  <span className="font-medium text-[#2B1D16]">
                    1 pt per ₹10 spent
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#2B1D16]/70">Checkout Redemption:</span>
                  <span className="font-medium text-[#2B1D16]">
                    1 pt = ₹1 instant discount
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#2B1D16]/70 leading-relaxed">
                Bean Points are automatically awarded upon purchase and can be redeemed in your cart with one click for instant discounts.
              </p>

              <Link to="/products" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C2622D]" />
                  <span>Earn Points with Fresh Harvests</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#2B1D16]/10 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2B1D16]/10">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C2622D]" />
                  <h2 className="font-serif text-xl font-bold text-[#2B1D16]">
                    Order History
                  </h2>
                </div>
                <span className="text-xs font-semibold tabular-nums text-[#2B1D16]/70">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                </span>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#C2622D] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs uppercase tracking-wider text-[#2B1D16]/60">
                    Loading your past harvests...
                  </span>
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No past orders found"
                  description="You haven't placed an order with Kaapi Works yet. Discover freshly roasted single-origin lots and handcrafted brewing gear."
                  actionText="Explore Whole Beans & Gear"
                  onAction={() => (window.location.href = '/products')}
                  icon={<Coffee className="w-8 h-8 text-[#C2622D]" />}
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {orders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <div
                        key={order._id}
                        onClick={() => handleOpenOrderDetails(order)}
                        className="bg-[#F4EDE3] border border-[#2B1D16]/10 hover:border-[#C2622D]/60 rounded-xl p-5 flex flex-col gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B1D16]/10">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-[#2B1D16] group-hover:text-[#C2622D] transition-colors">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-[#2B1D16]/60">·</span>
                            <span className="text-xs text-[#2B1D16]/70">{formattedDate}</span>
                            <span className="text-xs text-[#2B1D16]/40 hidden sm:inline">·</span>
                            <span className="text-[11px] font-semibold text-[#2B1D16]/70 hidden sm:inline">
                              {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {order.giftMessage && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C2622D] bg-[#C2622D]/10 px-2 py-0.5 rounded-full"
                                title={`Gift note: "${order.giftMessage}"`}
                              >
                                <Gift className="w-3 h-3" />
                                <span className="hidden sm:inline">Gift Note</span>
                              </span>
                            )}
                            {getStatusBadge(order.status)}
                            <span className="font-serif text-base font-bold tabular-nums text-[#2B1D16]">
                              {formatINR(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="flex flex-col divide-y divide-[#2B1D16]/8">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || getFallbackImage(item.name)}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover border border-[#2B1D16]/10 shrink-0 bg-white shadow-xs"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-[#2B1D16] line-clamp-1 group-hover:text-[#C2622D] transition-colors">
                                    {item.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-[#2B1D16]/10 text-[#2B1D16]">
                                      Qty: {item.quantity}
                                    </span>
                                    <span className="text-[11px] text-[#2B1D16]/60">
                                      · {formatINR(item.price)} each
                                      {item.roastLevel ? ` · ${item.roastLevel} Roast` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="font-bold text-xs tabular-nums text-[#2B1D16]">
                                {formatINR(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Destination */}
                        <div className="pt-2 border-t border-[#2B1D16]/10 flex flex-wrap items-center justify-between text-[11px] text-[#2B1D16]/65 gap-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C2622D]" />
                            <span className="truncate max-w-xs">
                              Delivered to:{' '}
                              {order.shippingAddress?.street
                                ? `${order.shippingAddress.street}, ${order.shippingAddress.city}`
                                : 'Bengaluru, Karnataka'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="hidden sm:flex items-center gap-1.5 mr-1">
                              <span>Payment: {order.paymentMethod || 'UPI Paid'}</span>
                              <span className="font-bold text-[#2F4A3A]">● {order.paymentStatus}</span>
                            </div>

                            {/* Reorder Button */}
                            <button
                              type="button"
                              onClick={(e) => handleReorder(order, e)}
                              disabled={reorderingOrderId === order._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#C2622D] hover:text-[#FAF6F0] bg-[#C2622D]/10 hover:bg-[#C2622D] border border-[#C2622D]/30 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
                              title="Add all items from this order back into your coffee bag"
                            >
                              <RotateCcw
                                className={`w-3.5 h-3.5 ${
                                  reorderingOrderId === order._id ? 'animate-spin' : ''
                                }`}
                              />
                              <span>
                                {reorderingOrderId === order._id ? 'Adding...' : 'Reorder'}
                              </span>
                            </button>

                            <Link
                              to={`/orders/${order._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#FAF6F0] bg-[#2B1D16] group-hover:bg-[#C2622D] hover:bg-[#C2622D] transition-colors shadow-xs cursor-pointer"
                              title="View full order details, tracking timeline, and invoice"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        onOpenChatWithOrder={handleOpenChatWithOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};
