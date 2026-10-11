import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Coffee,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { Order } from '../types';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { useToast } from './Toast';

interface ActiveOrdersDashboardProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export const ActiveOrdersDashboard: React.FC<ActiveOrdersDashboardProps> = ({
  orders,
  onSelectOrder,
}) => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Filter only active orders (not delivered and not cancelled)
  const activeOrders = orders.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    activeOrders[0]?._id || ''
  );

  // Keep selected order in sync if activeOrders change
  const currentOrder =
    activeOrders.find((o) => o._id === selectedOrderId) || activeOrders[0] || null;

  const handleCopyAwb = (awb: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    success(`Courier tracking number ${awb} copied to clipboard!`);
    setTimeout(() => setCopiedAwb(null), 2500);
  };

  // Helper for tracking steps
  const getStageInfo = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          step: 1,
          label: 'Order Confirmed',
          headline: 'Order Confirmed & Queued',
          desc: 'Payment authorized. Your single-origin green lots are lined up for fresh micro-batch roasting.',
          color: '#2F4A3A',
        };
      case 'processing':
        return {
          step: 2,
          label: 'Roastery Sorting',
          headline: 'Sorting & Measuring Lots',
          desc: 'Our roast masters are calibrating drum temperatures and moisture levels in Bengaluru.',
          color: '#C2622D',
        };
      case 'roasted':
        return {
          step: 3,
          label: 'Freshly Roasted',
          headline: 'Drum Roasted & Resting',
          desc: 'Your beans completed roasting today. Resting for 12 hours before nitrogen-flushed foil sealing.',
          color: '#B45309',
        };
      case 'dispatched':
        return {
          step: 4,
          label: 'Dispatched',
          headline: 'Handed to Courier Partner',
          desc: 'Packed in foil pouches with one-way aroma degassing valves and dispatched to express air hub.',
          color: '#1D4ED8',
        };
      case 'shipped':
        return {
          step: 5,
          label: 'In Transit',
          headline: 'In Transit via Express Courier',
          desc: 'Shipment has departed the central hub and is on route to your delivery address.',
          color: '#2563EB',
        };
      default:
        return {
          step: 1,
          label: 'Processing',
          headline: 'Processing Order',
          desc: 'Your specialty coffee order is being prepared.',
          color: '#2B1D16',
        };
    }
  };

  if (activeOrders.length === 0) {
    return (
      <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#2B1D16]/10 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#2F4A3A]/10 text-[#2F4A3A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2B1D16]">
                Order Tracking Dashboard
              </h3>
              <p className="text-xs text-[#2B1D16]/70 mt-0.5">
                No active in-transit shipments right now. All past coffee orders have been safely delivered.
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#FAF6F0] bg-[#2B1D16] hover:bg-[#C2622D] transition-colors shrink-0 shadow-xs"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Order Fresh Harvest</span>
          </Link>
        </div>
      </div>
    );
  }

  const stage = getStageInfo(currentOrder.status);
  const carrier = currentOrder.carrier || 'Blue Dart Express Air';
  const trackingNumber =
    currentOrder.trackingNumber ||
    `BD-${currentOrder.orderNumber.replace('KW-', '') || '98214309'}`;

  // Estimate delivery calculation: 3 days after creation or provided date
  const estimatedDate = currentOrder.estimatedDelivery
    ? new Date(currentOrder.estimatedDelivery)
    : new Date(new Date(currentOrder.createdAt).getTime() + 3 * 86400000);

  const formattedEstimatedDate = estimatedDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const orderDate = new Date(currentOrder.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalUnits = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  const pipelineStages = [
    { num: 1, label: 'Confirmed', sub: 'Placed' },
    { num: 2, label: 'Processing', sub: 'Roastery' },
    { num: 3, label: 'Roasted', sub: 'Resting' },
    { num: 4, label: 'Dispatched', sub: 'Express Hub' },
    { num: 5, label: 'In Transit', sub: 'On the Way' },
  ];

  return (
    <div className="bg-[#FAF6F0] rounded-2xl border-2 border-[#C2622D]/30 shadow-md mb-8 overflow-hidden">
      {/* Dashboard Top Header Banner */}
      <div className="bg-[#2B1D16] text-[#FAF6F0] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[#FAF6F0]">
                Active Order Tracking Dashboard
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C2622D] text-[#FAF6F0]">
                {activeOrders.length} {activeOrders.length === 1 ? 'Shipment' : 'Shipments'}
              </span>
            </div>
            <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
              Live updates from our Bengaluru small-batch roastery and express air logistics
            </p>
          </div>
        </div>

        {/* Multi-Order Tabs if more than 1 active order */}
        {activeOrders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {activeOrders.map((ord) => (
              <button
                key={ord._id}
                type="button"
                onClick={() => setSelectedOrderId(ord._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  (currentOrder._id === ord._id)
                    ? 'bg-[#C2622D] text-[#FAF6F0] shadow-xs'
                    : 'bg-white/10 text-[#FAF6F0]/75 hover:bg-white/20'
                }`}
              >
                #{ord.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* Order Identity & Key Attributes Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#2B1D16]/10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-bold text-[#2B1D16]">
              Order #{currentOrder.orderNumber}
            </span>
            <span className="text-xs text-[#2B1D16]/40">·</span>
            <span className="text-xs text-[#2B1D16]/70">Placed on {orderDate}</span>
            <span className="text-xs text-[#2B1D16]/40">·</span>
            <span className="text-xs font-semibold text-[#2B1D16]/80">
              {totalUnits} {totalUnits === 1 ? 'item' : 'items'} ({formatINR(currentOrder.total)})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs"
              style={{
                backgroundColor: `${stage.color}18`,
                color: stage.color,
                border: `1px solid ${stage.color}40`,
              }}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{stage.label}</span>
            </span>

            <Link
              to={`/orders/${currentOrder._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#FAF6F0] bg-[#2B1D16] hover:bg-[#C2622D] transition-colors cursor-pointer shadow-xs"
            >
              <span>View Full Order & Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 5-Step Visual Pipeline Tracker */}
        <div className="bg-[#F4EDE3] p-5 sm:p-6 rounded-xl border border-[#2B1D16]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C2622D]" />
              <h4 className="font-serif text-sm font-bold text-[#2B1D16]">
                Shipment Progression
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#C2622D]">
              Stage {stage.step} of 5
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="relative">
            {/* Connecting Bar */}
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-[#2B1D16]/15 -z-0">
              <div
                className="h-full bg-[#C2622D] transition-all duration-500 rounded-full"
                style={{
                  width: `${((stage.step - 1) / 4) * 100}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
              {pipelineStages.map((st) => {
                const isPassed = stage.step >= st.num;
                const isCurrent = stage.step === st.num;

                return (
                  <div
                    key={st.num}
                    className={`flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center p-2 rounded-lg ${
                      isCurrent ? 'bg-white/60 sm:bg-transparent shadow-2xs sm:shadow-none' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                        isCurrent
                          ? 'bg-[#C2622D] text-white ring-4 ring-[#C2622D]/20 shadow-xs'
                          : isPassed
                          ? 'bg-[#2F4A3A] text-white'
                          : 'bg-[#2B1D16]/15 text-[#2B1D16]/50'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{st.num}</span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-xs block font-bold leading-tight ${
                          isCurrent
                            ? 'text-[#C2622D]'
                            : isPassed
                            ? 'text-[#2B1D16]'
                            : 'text-[#2B1D16]/50'
                        }`}
                      >
                        {st.label}
                      </span>
                      <span className="text-[10px] text-[#2B1D16]/60 leading-tight block">
                        {st.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual description of current stage */}
          <div className="mt-5 pt-4 border-t border-[#2B1D16]/10 flex items-start gap-3 bg-white/70 p-3.5 rounded-lg">
            <Clock className="w-4 h-4 text-[#C2622D] shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs text-[#2B1D16] block font-semibold">
                {stage.headline}
              </strong>
              <p className="text-xs text-[#2B1D16]/75 mt-0.5 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Logistics Info Cards: 2-Column Grid (Courier Details & Estimated Delivery) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Courier Details */}
          <div className="bg-[#F4EDE3] p-5 rounded-xl border border-[#2B1D16]/10 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C2622D] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Courier & Logistics Partner</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#2F4A3A]/15 text-[#2F4A3A]">
                  Active Consignment
                </span>
              </div>

              <div>
                <h5 className="font-serif text-base font-bold text-[#2B1D16]">
                  {carrier}
                </h5>
                <p className="text-xs text-[#2B1D16]/70 mt-0.5">
                  Origin: Central Micro-Roastery, Indiranagar, Bengaluru
                </p>
              </div>

              {/* Waybill / Tracking Number Box */}
              <div className="bg-white p-3 rounded-lg border border-[#2B1D16]/10 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-[#2B1D16]/60 font-semibold">
                    Air Waybill (AWB) / Tracking No.
                  </span>
                  <span className="font-mono text-sm font-bold text-[#2B1D16] tracking-wide">
                    {trackingNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyAwb(trackingNumber, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2B1D16]/5 hover:bg-[#C2622D] hover:text-[#FAF6F0] text-[#2B1D16] text-xs font-semibold transition-colors cursor-pointer"
                  title="Copy tracking code"
                >
                  {copiedAwb === trackingNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#C2622D]" />
                      <span className="text-[11px]">Copy AWB</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2B1D16]/10 flex items-center justify-between text-xs text-[#2B1D16]/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F4A3A]" />
                <span>Express Air Carbon Neutral Delivery</span>
              </span>
            </div>
          </div>

          {/* Card 2: Estimated Delivery & Address */}
          <div className="bg-[#F4EDE3] p-5 rounded-xl border border-[#2B1D16]/10 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C2622D] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Estimated Delivery</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#C2622D]/15 text-[#C2622D]">
                  On Schedule
                </span>
              </div>

              {/* Delivery Date Display */}
              <div className="bg-white p-3.5 rounded-lg border border-[#2B1D16]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold text-[#2B1D16] block leading-tight">
                      {formattedEstimatedDate}
                    </span>
                    <span className="text-xs text-[#2F4A3A] font-semibold mt-0.5 block">
                      Expected by 7:00 PM IST · Express Air Dispatch
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="flex items-start gap-2 pt-1 text-xs text-[#2B1D16]/75">
                <MapPin className="w-4 h-4 text-[#C2622D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#2B1D16] block">
                    Delivering to:
                  </span>
                  <p className="text-[#2B1D16]/70 mt-0.5 line-clamp-2">
                    {currentOrder.shippingAddress?.street
                      ? `${currentOrder.shippingAddress.street}, ${currentOrder.shippingAddress.city}, ${currentOrder.shippingAddress.state} - ${currentOrder.shippingAddress.postalCode}`
                      : 'Bengaluru, Karnataka - 560038, India'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2B1D16]/10 flex items-center justify-between text-xs text-[#2B1D16]/70">
              <span>Standard delivery window: 10:00 AM - 7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Personalized Gift Message Banner */}
        {currentOrder.giftMessage && (
          <div className="bg-[#FFFDF9] border border-[#C2622D]/30 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2622D]">
                <Gift className="w-4 h-4" />
                <span>Personalized Gift Note Included</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#C2622D]/15 text-[#C2622D] px-2 py-0.5 rounded uppercase">
                Artisanal Parchment
              </span>
            </div>
            <p className="text-xs italic text-[#2B1D16] font-serif leading-relaxed bg-[#F4EDE3]/40 p-2.5 rounded-lg border border-[#2B1D16]/5">
              "{currentOrder.giftMessage}"
            </p>
          </div>
        )}

        {/* Order Items Summary Preview */}
        <div className="pt-3 border-t border-[#2B1D16]/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#2B1D16]">
              Consignment Items ({currentOrder.items.length})
            </span>
            <span className="text-xs text-[#2B1D16]/60">
              Small-batch nitrogen flushed packs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentOrder.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-lg border border-[#2B1D16]/10 flex items-center gap-3 shadow-2xs"
              >
                <img
                  src={item.image || getFallbackImage(item.name)}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-md object-cover border border-[#2B1D16]/10 shrink-0 bg-[#FAF6F0]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-[#2B1D16] line-clamp-1">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#2B1D16]/65">
                    <span className="font-mono font-bold text-[#C2622D]">
                      Qty: {item.quantity}
                    </span>
                    {item.roastLevel && (
                      <span>· {item.roastLevel} Roast</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
