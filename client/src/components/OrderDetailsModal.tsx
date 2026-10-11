import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  ExternalLink,
  CreditCard,
  Coffee,
  X,
  MessageSquare,
  ShieldCheck,
  Download,
  Gift,
  RotateCcw,
} from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { OrderStatusTracker } from './OrderStatusTracker';
import { generateInvoicePDF } from '../utils/generateInvoicePdf';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithOrder?: (orderNumber: string) => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order: initialOrder,
  isOpen,
  onClose,
  onOpenChatWithOrder,
  onOrderUpdated,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);

  // Sync state if initialOrder changes
  React.useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  if (!isOpen || !currentOrder) return null;

  const order = currentOrder;

  const handleCopyOrderNumber = () => {
    if (order.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const { reorderOrder } = useCart();

  const handleReorder = async () => {
    if (!order || !order.items || order.items.length === 0) return;
    setIsReordering(true);
    try {
      const res = await reorderOrder(order.items);
      if (res) {
        onClose();
      }
    } finally {
      setIsReordering(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      generateInvoicePDF(order);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate total item units
  const totalItemUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleStatusChange = (updated: Order) => {
    setCurrentOrder(updated);
    if (onOrderUpdated) {
      onOrderUpdated(updated);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2B1D16]/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl bg-[#FAF6F0] border border-[#2B1D16]/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF6F0] border-b border-[#2B1D16]/10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2B1D16] text-[#FAF6F0] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Package className="w-5 h-5 text-[#C2622D]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C2622D] font-bold">
                  Order Details
                </span>
                <span className="text-[#2B1D16]/30">·</span>
                <span className="text-xs text-[#2B1D16]/70">
                  {orderDate} at {orderTime}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1D16]">
                  {order.orderNumber}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  title="Copy Order ID"
                  className="p-1 text-[#2B1D16]/50 hover:text-[#2B1D16] hover:bg-[#2B1D16]/5 rounded transition-colors"
                >
                  {hasCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {hasCopied && (
                  <span className="text-[11px] font-medium text-green-700 animate-in fade-in">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              title="Download Tax Invoice PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FAF6F0] bg-[#2B1D16] hover:bg-[#C2622D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>{isDownloading ? 'PDF...' : 'Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              title="Print Receipt"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2B1D16] bg-[#2B1D16]/5 hover:bg-[#2B1D16]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#2B1D16]/60 hover:text-[#2B1D16] hover:bg-[#2B1D16]/8 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Visual Order Status Tracking Timeline */}
          <OrderStatusTracker
            order={order}
            onStatusChange={handleStatusChange}
            showSimulator={true}
          />

          {/* 2. Specific Item Breakdown & Quantities */}
          <div className="bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2B1D16]/10">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#C2622D]" />
                <h3 className="font-serif text-base font-bold text-[#2B1D16]">
                  Item Breakdown & Quantities
                </h3>
              </div>
              <span className="text-xs font-semibold tabular-nums text-[#2B1D16]/70">
                {totalItemUnits} {totalItemUnits === 1 ? 'total unit' : 'total units'} (
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'})
              </span>
            </div>

            <div className="divide-y divide-[#2B1D16]/8">
              {order.items.map((item, idx) => {
                const productId =
                  typeof item.product === 'object' && item.product !== null
                    ? (item.product as any)._id
                    : item.product;

                return (
                  <div
                    key={item._id || idx}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF6F0]/40 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.image || getFallbackImage(item.name)}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover border border-[#2B1D16]/10 shrink-0 bg-white shadow-xs"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          {productId ? (
                            <Link
                              to={`/products/${productId}`}
                              className="font-bold text-sm text-[#2B1D16] hover:text-[#C2622D] transition-colors inline-flex items-center gap-1"
                              onClick={onClose}
                            >
                              <span>{item.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                          ) : (
                            <span className="font-bold text-sm text-[#2B1D16]">{item.name}</span>
                          )}

                          {item.roastLevel && (
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#C2622D]/10 text-[#C2622D] font-bold">
                              {item.roastLevel} Roast
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#2B1D16]/70 mt-1">
                          <span className="font-medium">Unit Price: {formatINR(item.price)}</span>
                          <span className="text-[#2B1D16]/30">·</span>
                          <span className="font-medium text-[#2B1D16]/60">Artisanal 250g Pack</span>
                        </div>
                      </div>
                    </div>

                    {/* Specific Item Quantity & Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2B1D16]/6">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] uppercase font-bold text-[#2B1D16]/60">
                          Specific Quantity
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-0.5 rounded-full bg-[#2B1D16] text-[#FAF6F0] font-mono text-xs font-bold shadow-xs">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] uppercase font-bold text-[#2B1D16]/60">
                          Item Total
                        </span>
                        <span className="font-serif text-base font-bold tabular-nums text-[#2B1D16]">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gift Message / Personalized Note */}
          {order.giftMessage && (
            <div className="bg-[#FFFDF9] border border-[#C2622D]/30 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2622D]">
                  <Gift className="w-4 h-4" />
                  <span>Personalized Gift Note</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#C2622D]/15 text-[#C2622D] px-2 py-0.5 rounded uppercase">
                  Parchment Inscribed
                </span>
              </div>
              <div className="bg-[#F4EDE3]/40 border border-[#2B1D16]/8 rounded-lg p-3 my-1">
                <p className="text-xs italic text-[#2B1D16] font-serif leading-relaxed">
                  "{order.giftMessage}"
                </p>
              </div>
              <p className="text-[11px] text-[#2B1D16]/60 mt-0.5">
                Hand-written on cotton parchment with a wax seal inside the coffee box.
              </p>
            </div>
          )}

          {/* 3. Address & Payment Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Destination */}
            <div className="bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl p-4 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2622D]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Shipping Destination</span>
              </div>
              <div className="text-xs text-[#2B1D16]/85 leading-relaxed">
                <p className="font-semibold text-sm text-[#2B1D16]">
                  {order.shippingAddress?.street || '12th Main Road, Indiranagar'}
                </p>
                <p>
                  {order.shippingAddress?.city || 'Bengaluru'},{' '}
                  {order.shippingAddress?.state || 'Karnataka'} -{' '}
                  <span className="font-mono font-medium">
                    {order.shippingAddress?.postalCode || '560038'}
                  </span>
                </p>
                <p className="text-[#2B1D16]/70">
                  {order.shippingAddress?.country || 'India'}
                </p>
              </div>
              <div className="mt-auto pt-2 border-t border-[#2B1D16]/8 flex items-center gap-1 text-[11px] text-[#2F4A3A] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Delivery Address</span>
              </div>
            </div>

            {/* Payment & Invoice Breakdown */}
            <div className="bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl p-4 flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2B1D16]">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#C2622D]" />
                  <span>Payment Summary</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-bold uppercase">
                  ● {order.paymentStatus || 'paid'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-[#2B1D16]/75">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItemUnits} units):</span>
                  <span className="font-mono font-medium text-[#2B1D16]">
                    {formatINR(order.subtotal || order.total - (order.shipping || 0))}
                  </span>
                </div>
                {order.pointsDiscount ? (
                  <div className="flex justify-between text-[#C2622D] font-medium">
                    <span>Bean Points Discount ({order.pointsRedeemed || 0} pts):</span>
                    <span className="font-mono font-bold">-{formatINR(order.pointsDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Pan-India Courier Shipping:</span>
                  <span className="font-mono font-medium text-[#2B1D16]">
                    {order.shipping === 0 ? (
                      <span className="text-[#2F4A3A] font-bold">FREE</span>
                    ) : (
                      formatINR(order.shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST Included):</span>
                  <span className="font-mono font-medium text-[#2B1D16]/60">₹0 (All taxes incl.)</span>
                </div>
                {order.pointsEarned ? (
                  <div className="flex justify-between text-[#2F4A3A] font-semibold text-[11px] bg-[#2F4A3A]/10 px-2 py-1 rounded">
                    <span>Bean Points Earned:</span>
                    <span className="font-mono">+{order.pointsEarned} pts</span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-[#2B1D16]/10 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-sm text-[#2B1D16]">Grand Total:</span>
                  <span className="font-serif text-lg font-bold tabular-nums text-[#2B1D16]">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#2B1D16]/65 pt-1">
                Method:{' '}
                <span className="font-semibold text-[#2B1D16]">
                  {order.paymentMethod || 'UPI (Google Pay / PhonePe)'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Roastery Freshness & Concierge Assistance */}
          <div className="bg-[#FAF6F0] border border-[#C2622D]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#2B1D16]">
                  Chikmagalur Freshness Guarantee
                </span>
                <p className="text-[#2B1D16]/70 text-[11px]">
                  All beans roasted in small batches within 48h of dispatch and heat-sealed in
                  degassing foil valve pouches.
                </p>
              </div>
            </div>

            {onOpenChatWithOrder && (
              <button
                type="button"
                onClick={() => onOpenChatWithOrder(order.orderNumber)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C2622D] bg-[#C2622D]/10 hover:bg-[#C2622D]/20 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Concierge About This Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF6F0] border-t border-[#2B1D16]/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#2B1D16]/60">
            For support questions, write to{' '}
            <a
              href="mailto:orders@kaapiworks.in"
              className="text-[#C2622D] underline font-medium"
            >
              orders@kaapiworks.in
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReorder}
              disabled={isReordering}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#C2622D] hover:text-[#FAF6F0] bg-[#C2622D]/10 hover:bg-[#C2622D] border border-[#C2622D]/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              title="Add all items from this order into your cart"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin' : ''}`} />
              <span>{isReordering ? 'Adding...' : 'Reorder Items'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="px-4 py-2 text-xs font-semibold text-[#2B1D16] bg-[#2B1D16]/5 hover:bg-[#2B1D16]/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>{isDownloading ? 'Generating...' : 'Download Invoice (PDF)'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#FAF6F0] bg-[#2B1D16] hover:bg-[#C2622D] rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
