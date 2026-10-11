import React, { useState } from 'react';
import {
  Package,
  Truck,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
} from 'lucide-react';
import { Order } from '../types';
import { useToast } from './Toast';
import { api } from '../services/api';

interface OrderStatusTrackerProps {
  order: Order;
  onStatusChange?: (updatedOrder: Order) => void;
  showSimulator?: boolean;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  onStatusChange,
  showSimulator = true,
}) => {
  const { success, error } = useToast();
  const [hasCopiedTracking, setHasCopiedTracking] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const trackingNumber =
    order.trackingNumber || `BD-KW-${order.orderNumber.replace('KW-', '') || '98214'}`;
  const carrier = order.carrier || 'Blue Dart Air Express';

  const handleCopyTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackingNumber);
    setHasCopiedTracking(true);
    setTimeout(() => setHasCopiedTracking(false), 2000);
  };

  const handleSimulateStatus = async (newStatus: Order['status']) => {
    if (order.status === newStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateOrderStatus(order._id, newStatus);
      if (onStatusChange) {
        onStatusChange(updated);
      }
      success(`Order status updated to ${newStatus.toUpperCase()} · Customer notification email dispatched!`);
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Determine stage index
  const getStageIndex = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 0;
      case 'processing':
      case 'roasted':
        return 1;
      case 'dispatched':
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const currentIdx = getStageIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  // Base timestamps from order.createdAt
  const createdDate = new Date(order.createdAt);
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

  const formatDateTime = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const processingDate = new Date(createdDate.getTime() + 18 * 60 * 60 * 1000);
  const shippedDate = new Date(createdDate.getTime() + 42 * 60 * 60 * 1000);
  const estimatedDeliveryDate = new Date(createdDate.getTime() + 72 * 60 * 60 * 1000);

  const steps = [
    {
      id: 'confirmed',
      title: 'Confirmed',
      fullTitle: 'Order Confirmed',
      desc: 'Payment verified & order placed',
      date: formatDate(createdDate),
      timestamp: formatDateTime(createdDate),
      icon: CheckCircle2,
    },
    {
      id: 'processing',
      title: 'Processing',
      fullTitle: 'Roasting & Processing',
      desc: 'Micro-lot roasting in Chikmagalur',
      date: formatDate(processingDate),
      timestamp: formatDateTime(processingDate),
      icon: Sparkles,
    },
    {
      id: 'shipped',
      title: 'Shipped',
      fullTitle: 'Dispatched & In Transit',
      desc: 'Handed to courier partner',
      date: formatDate(shippedDate),
      timestamp: formatDateTime(shippedDate),
      icon: Truck,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      fullTitle: 'Delivered',
      desc: 'Safely arrived at your doorstep',
      date: formatDate(estimatedDeliveryDate),
      timestamp: formatDateTime(estimatedDeliveryDate),
      icon: Package,
    },
  ];

  // Calculate timeline progress bar width (percentage)
  const getProgressPercentage = () => {
    if (isCancelled) return 0;
    if (currentIdx === 0) return 12;
    if (currentIdx === 1) return 40;
    if (currentIdx === 2) return 72;
    if (currentIdx === 3) return 100;
    return 20;
  };

  // Milestone activity events
  const getMilestoneEvents = () => {
    const events = [];

    if (currentIdx >= 3) {
      events.push({
        status: 'Delivered',
        location: order.shippingAddress?.city
          ? `${order.shippingAddress.city}, India`
          : 'Bengaluru, Karnataka',
        title: 'Package delivered to recipient',
        desc: 'Handed over with contactless verification at customer destination.',
        timestamp: formatDateTime(estimatedDeliveryDate),
        isCurrent: currentIdx === 3,
      });
      events.push({
        status: 'Out for Delivery',
        location: order.shippingAddress?.city
          ? `${order.shippingAddress.city} Delivery Center`
          : 'Indiranagar Hub, Bengaluru',
        title: 'Out for delivery with courier agent',
        desc: 'Assigned to courier delivery executive for final mile delivery.',
        timestamp: formatDateTime(new Date(estimatedDeliveryDate.getTime() - 6 * 3600 * 1000)),
        isCurrent: false,
      });
    }

    if (currentIdx >= 2) {
      events.push({
        status: 'In Transit',
        location: 'Kempegowda Cargo Air Terminal',
        title: 'Departed central distribution sorting center',
        desc: `Consignment in transit via ${carrier} surface express network.`,
        timestamp: formatDateTime(shippedDate),
        isCurrent: currentIdx === 2,
      });
      events.push({
        status: 'Dispatched',
        location: 'Chikmagalur Logistics Yard',
        title: 'Package picked up by courier',
        desc: `Manifest generated under AWB ${trackingNumber}. Sealed with tamper-evident tape.`,
        timestamp: formatDateTime(new Date(shippedDate.getTime() - 8 * 3600 * 1000)),
        isCurrent: false,
      });
    }

    if (currentIdx >= 1) {
      events.push({
        status: 'Processing',
        location: 'Kaapi Works Estate Roastery, Chikmagalur',
        title: 'Specialty lot roasted & nitrogen-flushed',
        desc: 'Batch roasted to peak curve profile, degassed, and sealed in airtight aroma-valve pouches.',
        timestamp: formatDateTime(processingDate),
        isCurrent: currentIdx === 1,
      });
      events.push({
        status: 'Batch Queued',
        location: 'Roastery Operations',
        title: 'Green beans queued for morning drum roast',
        desc: 'Single-origin lots measured and staged for the head roaster.',
        timestamp: formatDateTime(new Date(createdDate.getTime() + 6 * 3600 * 1000)),
        isCurrent: false,
      });
    }

    // Always confirmed
    events.push({
      status: 'Confirmed',
      location: 'Kaapi Works Central Server',
      title: 'Order verified & payment confirmed',
      desc: `Payment of total captured successfully. Order number ${order.orderNumber} placed.`,
      timestamp: formatDateTime(createdDate),
      isCurrent: currentIdx === 0,
    });

    return events;
  };

  const milestoneEvents = getMilestoneEvents();

  return (
    <div className="bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* 1. Header with Status Badge & Carrier Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2B1D16]/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2B1D16] text-[#FAF6F0] flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-5 h-5 text-[#C2622D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2B1D16]">
                Order Status Tracking
              </h2>
              {/* Dynamic Status Badge */}
              {isCancelled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Cancelled</span>
                </span>
              ) : currentIdx === 3 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2F4A3A]/15 text-[#2F4A3A] border border-[#2F4A3A]/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Delivered</span>
                </span>
              ) : currentIdx === 2 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2622D]/15 text-[#C2622D] border border-[#C2622D]/30">
                  <span className="w-2 h-2 rounded-full bg-[#C2622D] animate-ping" />
                  <span>In Transit</span>
                </span>
              ) : currentIdx === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span>Roasting & Processing</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2B1D16]/10 text-[#2B1D16] border border-[#2B1D16]/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Order Confirmed</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#2B1D16]/70 mt-0.5">
              {isCancelled ? (
                'Order was cancelled and processing halted.'
              ) : currentIdx === 3 ? (
                `Delivered on ${formatDate(estimatedDeliveryDate)}`
              ) : (
                <>
                  Estimated Delivery:{' '}
                  <span className="font-semibold text-[#2B1D16]">
                    {formatDate(estimatedDeliveryDate)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Carrier Details & Tracking Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-1.5 rounded-lg border border-[#2B1D16]/10 shadow-2xs">
            <span className="text-[11px] text-[#2B1D16]/65">AWB:</span>
            <span className="font-mono text-xs font-bold text-[#2B1D16]">{trackingNumber}</span>
            <button
              type="button"
              onClick={handleCopyTracking}
              title="Copy Tracking Number"
              className="p-1 hover:bg-[#2B1D16]/5 text-[#2B1D16]/60 hover:text-[#2B1D16] rounded transition-colors"
            >
              {hasCopiedTracking ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <span className="text-[11px] text-[#2B1D16]/60">via {carrier}</span>
        </div>
      </div>

      {/* 2. Visual Timeline */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-sm text-red-800">Order Has Been Cancelled</span>
            <p className="text-red-700/90 leading-relaxed">
              This order was stopped before final courier dispatch. If an online payment was
              debited, a full refund has been credited back to your original payment method within
              3–5 business days.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-2">
          {/* Horizontal Stepper (Desktop & Tablet) */}
          <div className="relative hidden md:block px-6">
            {/* Background connecting track */}
            <div className="absolute top-5 left-12 right-12 h-1.5 bg-[#2B1D16]/15 rounded-full z-0" />

            {/* Filled progress track */}
            <div
              className="absolute top-5 left-12 h-1.5 bg-gradient-to-r from-[#2F4A3A] to-[#C2622D] rounded-full z-0 transition-all duration-700 ease-out"
              style={{
                width: `calc(${getProgressPercentage()}% - 3rem)`,
                maxWidth: 'calc(100% - 6rem)',
              }}
            />

            {/* Steps Container */}
            <div className="relative z-10 grid grid-cols-4 gap-4">
              {steps.map((st, idx) => {
                const isCompleted = currentIdx > idx;
                const isCurrent = currentIdx === idx;
                const isPending = currentIdx < idx;
                const IconComponent = st.icon;

                return (
                  <div key={st.id} className="flex flex-col items-center text-center group">
                    {/* Circle Node */}
                    <div className="relative mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#2F4A3A] text-white shadow-xs'
                            : isCurrent
                            ? 'bg-[#C2622D] text-white ring-4 ring-[#C2622D]/25 shadow-md scale-110'
                            : 'bg-[#FAF6F0] border-2 border-[#2B1D16]/20 text-[#2B1D16]/40'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>

                      {/* Active pulsating beacon */}
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C2622D] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C2622D] border-2 border-white"></span>
                        </span>
                      )}
                    </div>

                    {/* Step Title & Details */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isCurrent
                            ? 'text-[#C2622D]'
                            : isCompleted
                            ? 'text-[#2B1D16]'
                            : 'text-[#2B1D16]/40'
                        }`}
                      >
                        {st.title}
                      </span>

                      <span
                        className={`text-[11px] leading-tight max-w-[140px] ${
                          isPending ? 'text-[#2B1D16]/40' : 'text-[#2B1D16]/70'
                        }`}
                      >
                        {st.desc}
                      </span>

                      {/* Date Badge */}
                      <span
                        className={`mt-1 font-mono text-[10px] px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-[#C2622D]/15 text-[#C2622D] font-bold'
                            : isCompleted
                            ? 'bg-[#2F4A3A]/10 text-[#2F4A3A] font-semibold'
                            : 'bg-transparent text-[#2B1D16]/30'
                        }`}
                      >
                        {isCompleted || isCurrent ? st.date : `Est. ${st.date}`}
                      </span>

                      {isCurrent && (
                        <span className="mt-1 inline-flex items-center text-[9px] uppercase tracking-wider font-extrabold text-[#C2622D] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#C2622D]/30 shadow-2xs">
                          ● Active Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Stepper (Mobile Optimized) */}
          <div className="md:hidden flex flex-col gap-4 pl-2">
            {steps.map((st, idx) => {
              const isCompleted = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              const isPending = currentIdx < idx;
              const IconComponent = st.icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={st.id} className="relative flex items-start gap-3.5">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute top-8 left-4 w-0.5 -bottom-4 -ml-[1px] transition-colors ${
                        isCompleted ? 'bg-[#2F4A3A]' : 'bg-[#2B1D16]/15'
                      }`}
                    />
                  )}

                  {/* Node icon */}
                  <div className="relative shrink-0 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#2F4A3A] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#C2622D] text-white ring-4 ring-[#C2622D]/20 shadow-xs'
                          : 'bg-[#FAF6F0] border-2 border-[#2B1D16]/20 text-[#2B1D16]/40'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Step information */}
                  <div className="flex flex-col gap-0.5 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-[#C2622D]'
                            : isCompleted
                            ? 'text-[#2B1D16]'
                            : 'text-[#2B1D16]/50'
                        }`}
                      >
                        {st.fullTitle}
                      </span>

                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2622D] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#C2622D]/30">
                          Current Stage
                        </span>
                      )}

                      <span className="font-mono text-[10px] text-[#2B1D16]/55">
                        {isCompleted || isCurrent ? st.date : `Est. ${st.date}`}
                      </span>
                    </div>

                    <p
                      className={`text-xs ${
                        isPending ? 'text-[#2B1D16]/40' : 'text-[#2B1D16]/70'
                      }`}
                    >
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Detailed Milestone Events Log Toggle */}
      <div className="border-t border-[#2B1D16]/10 pt-3">
        <button
          type="button"
          onClick={() => setIsLogExpanded(!isLogExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#2B1D16]/80 hover:text-[#C2622D] py-1 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C2622D]" />
            <span>View Detailed Courier Checkpoints & Tracking History</span>
            <span className="font-mono text-[10px] bg-[#2B1D16]/10 px-1.5 py-0.2 rounded text-[#2B1D16]">
              {milestoneEvents.length} updates
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#C2622D]">
            <span>{isLogExpanded ? 'Hide History' : 'Show History'}</span>
            {isLogExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {isLogExpanded && (
          <div className="mt-3 bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl p-4 divide-y divide-[#2B1D16]/8 animate-in fade-in duration-200">
            {milestoneEvents.map((evt, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="relative mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      idx === 0
                        ? 'bg-[#C2622D] ring-2 ring-[#C2622D]/30 animate-pulse'
                        : 'bg-[#2F4A3A]'
                    }`}
                  />
                </div>

                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[#2B1D16]">{evt.title}</span>
                    <span className="font-mono text-[11px] text-[#2B1D16]/60">
                      {evt.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#2B1D16]/75 leading-relaxed">{evt.desc}</p>

                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#2B1D16]/60">
                    <MapPin className="w-3 h-3 text-[#C2622D]" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Interactive Status Simulator (Demo & Testing Feature) */}
      {showSimulator && (
        <div className="bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#C2622D] ${
                isUpdatingStatus ? 'animate-spin' : ''
              }`}
            />
            <span className="font-bold text-[#2B1D16]">Simulate Order Progress:</span>
            <span className="text-[11px] text-[#2B1D16]/60 hidden sm:inline">
              (Test live status timeline updates)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { label: 'Confirmed', status: 'confirmed' },
                { label: 'Processing', status: 'processing' },
                { label: 'Shipped', status: 'shipped' },
                { label: 'Delivered', status: 'delivered' },
                { label: 'Cancelled', status: 'cancelled' },
              ] as const
            ).map((item) => {
              const isActive =
                (item.status === 'processing' &&
                  (order.status === 'processing' || order.status === 'roasted')) ||
                (item.status === 'shipped' &&
                  (order.status === 'shipped' || order.status === 'dispatched')) ||
                order.status === item.status;

              return (
                <button
                  key={item.status}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleSimulateStatus(item.status as Order['status'])}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2B1D16] text-[#FAF6F0] shadow-xs'
                      : 'bg-[#F4EDE3] text-[#2B1D16]/70 hover:text-[#2B1D16] hover:bg-[#2B1D16]/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
