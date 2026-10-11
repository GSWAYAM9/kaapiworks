import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates an elegant, professional Tax Invoice PDF for Kaapi Works orders.
 * Uses standard jsPDF vector primitives for crisp rendering, consistent fonts,
 * and zero external font or CDN network dependencies.
 */
export function generateInvoicePDF(order: Order): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  // --- Theme Colors ---
  const espressoColor: [number, number, number] = [43, 29, 22]; // #2B1D16
  const terracottaColor: [number, number, number] = [194, 98, 45]; // #C2622D
  const creamBg: [number, number, number] = [250, 246, 240]; // #FAF6F0
  const lightGray: [number, number, number] = [230, 225, 218]; // Divider line
  const mutedText: [number, number, number] = [100, 90, 85];

  // 1. Header Banner / Brand
  doc.setFillColor(...creamBg);
  doc.rect(margin, y, contentWidth, 32, 'F');

  // Decorative Accent bar on left
  doc.setFillColor(...terracottaColor);
  doc.rect(margin, y, 3, 32, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...espressoColor);
  doc.text('KAAPI WORKS', margin + 8, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...terracottaColor);
  doc.text('SOUTH INDIAN SPECIALTY ROASTERS · DIRECT ESTATE TRADE', margin + 8, y + 15);

  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text('12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038', margin + 8, y + 21);
  doc.text('GSTIN: 29AABCK1294K1Z8 · Email: care@kaapiworks.in · Phone: +91 (80) 4920-1892', margin + 8, y + 26);

  // Invoice Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...espressoColor);
  doc.text('TAX INVOICE', pageWidth - margin - 5, y + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...terracottaColor);
  doc.text(`ORIGINAL FOR RECIPIENT`, pageWidth - margin - 5, y + 18, { align: 'right' });

  y += 38;

  // 2. Order Metadata & Shipping Info (Two-Column Block)
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Invoice & Order Metadata
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...terracottaColor);
  doc.text('INVOICE SUMMARY', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...espressoColor);

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text(`Order No:`, margin + 5, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.orderNumber}`, margin + 35, y + 13);
  doc.setFont('helvetica', 'normal');

  doc.text(`Invoice Date:`, margin + 5, y + 19);
  doc.text(`${orderDate} at ${orderTime}`, margin + 35, y + 19);

  doc.text(`Payment Status:`, margin + 5, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34); // Green
  doc.text(`${(order.paymentStatus || 'PAID').toUpperCase()}`, margin + 35, y + 25);
  doc.setTextColor(...espressoColor);
  doc.setFont('helvetica', 'normal');

  doc.text(`Payment Mode:`, margin + 5, y + 31);
  doc.text(`${order.paymentMethod || 'UPI / NetBanking'}`, margin + 35, y + 31);

  // Right Box: Billed & Shipped To
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...terracottaColor);
  doc.text('DISPATCH / BILLING ADDRESS', margin + colWidth + 11, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...espressoColor);

  const addr = order.shippingAddress || {};
  const recipientName = 'Customer';
  const street = addr.street || 'Address on file';
  const cityState = [addr.city, addr.state].filter(Boolean).join(', ') || 'Bengaluru, Karnataka';
  const pinCountry = [addr.postalCode ? `PIN: ${addr.postalCode}` : '', addr.country || 'India'].filter(Boolean).join(' · ');

  doc.setFont('helvetica', 'bold');
  doc.text(`Recipient: ${recipientName}`, margin + colWidth + 11, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(street, margin + colWidth + 11, y + 19);
  doc.text(cityState, margin + colWidth + 11, y + 25);
  doc.text(pinCountry, margin + colWidth + 11, y + 31);

  y += 44;

  // 3. Carrier & Tracking Box (if available)
  if (order.carrier || order.trackingNumber || order.status) {
    doc.setFillColor(...creamBg);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...espressoColor);
    doc.text('Logistics Partner:', margin + 4, y + 7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(order.carrier || 'Blue Dart Express Air', margin + 35, y + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Tracking AWB:', margin + 85, y + 7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(order.trackingNumber || 'Generating at dispatch', margin + 112, y + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', margin + 150, y + 7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...terracottaColor);
    doc.text((order.status || 'Confirmed').toUpperCase(), margin + 162, y + 7.5);

    y += 16;
  }

  // 4. Line Items Table Header
  doc.setFillColor(...espressoColor);
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Sl.', margin + 3, y + 5.5);
  doc.text('Description / Micro-Lot', margin + 15, y + 5.5);
  doc.text('Roast Profile', margin + 105, y + 5.5);
  doc.text('Qty', margin + 135, y + 5.5, { align: 'center' });
  doc.text('Rate (INR)', margin + 155, y + 5.5, { align: 'right' });
  doc.text('Amount (INR)', pageWidth - margin - 3, y + 5.5, { align: 'right' });

  y += 8;

  // 5. Line Items Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  order.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(252, 250, 247);
      doc.rect(margin, y, contentWidth, 9, 'F');
    }

    doc.setTextColor(...espressoColor);
    doc.text(`${index + 1}`, margin + 3, y + 6);

    const itemName = item.name || 'Specialty Coffee Roast';
    // Truncate long name to fit cleanly
    const truncatedName = itemName.length > 45 ? `${itemName.slice(0, 42)}...` : itemName;
    doc.text(truncatedName, margin + 15, y + 6);

    const roast = (item.roastLevel || 'Whole Bean / Medium').toUpperCase();
    doc.setTextColor(...mutedText);
    doc.text(roast, margin + 105, y + 6);

    doc.setTextColor(...espressoColor);
    doc.text(`${item.quantity}`, margin + 135, y + 6, { align: 'center' });

    const unitPrice = item.price ? item.price.toLocaleString('en-IN') : '0';
    doc.text(`Rs. ${unitPrice}`, margin + 155, y + 6, { align: 'right' });

    const lineTotal = item.price && item.quantity ? (item.price * item.quantity).toLocaleString('en-IN') : '0';
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${lineTotal}`, pageWidth - margin - 3, y + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Bottom border per row
    doc.setDrawColor(...lightGray);
    doc.line(margin, y + 9, pageWidth - margin, y + 9);

    y += 9;
  });

  y += 4;

  // 6. Summary Totals (Right Column) & Notes (Left Column)
  const summaryWidth = 75;
  const summaryLeft = pageWidth - margin - summaryWidth;

  // Left Note Box: Roastery Quality Seal
  doc.setFillColor(...creamBg);
  doc.roundedRect(margin, y, contentWidth - summaryWidth - 8, 36, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...terracottaColor);
  doc.text('THE ROASTER\'S FRESHNESS GUARANTEE', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text('• 100% shade-canopy Arabica and heritage peaberry estate lots.', margin + 4, y + 12);
  doc.text('• Roasted in micro-batches and nitrogen-flushed with 1-way degassing valves.', margin + 4, y + 17);
  doc.text('• Best enjoyed 7 to 28 days post roast date. Keep in cool, dry pantry.', margin + 4, y + 22);
  doc.text('• Direct trade certified: Premiums paid directly to Chikmagalur & Araku farmers.', margin + 4, y + 27);
  doc.text('• Customer Support: care@kaapiworks.in | Express PAN-India Support', margin + 4, y + 32);

  // Right Totals Table
  const hasPointsDiscount = (order.pointsDiscount || 0) > 0;
  const tableHeight = hasPointsDiscount ? 42 : 36;
  doc.setDrawColor(...lightGray);
  doc.roundedRect(summaryLeft, y, summaryWidth, tableHeight, 1.5, 1.5, 'D');

  doc.setFontSize(8);
  doc.setTextColor(...espressoColor);
  doc.text('Subtotal:', summaryLeft + 4, y + 7);
  doc.text(`Rs. ${(order.subtotal || 0).toLocaleString('en-IN')}`, pageWidth - margin - 4, y + 7, { align: 'right' });

  let curY = y + 7;
  if (hasPointsDiscount) {
    curY += 6;
    doc.setTextColor(...terracottaColor);
    doc.text(`Bean Points (${order.pointsRedeemed || 0} pts):`, summaryLeft + 4, curY);
    doc.text(`-Rs. ${(order.pointsDiscount || 0).toLocaleString('en-IN')}`, pageWidth - margin - 4, curY, { align: 'right' });
    doc.setTextColor(...espressoColor);
  }

  curY += 6;
  doc.text('Express Air Freight:', summaryLeft + 4, curY);
  const shippingText = order.shipping === 0 ? 'FREE (PAN-INDIA)' : `Rs. ${(order.shipping || 99).toLocaleString('en-IN')}`;
  doc.setTextColor(order.shipping === 0 ? 34 : 43, order.shipping === 0 ? 139 : 29, order.shipping === 0 ? 34 : 22);
  doc.text(shippingText, pageWidth - margin - 4, curY, { align: 'right' });
  doc.setTextColor(...espressoColor);

  curY += 6;
  doc.text('Taxes (GST Included):', summaryLeft + 4, curY);
  doc.text('Rs. 0.00 (Inclusive)', pageWidth - margin - 4, curY, { align: 'right' });

  // Grand Total Highlight Bar
  doc.setFillColor(...espressoColor);
  doc.rect(summaryLeft, curY + 4, summaryWidth, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', summaryLeft + 4, curY + 10.5);
  doc.text(`Rs. ${(order.total || 0).toLocaleString('en-IN')}`, pageWidth - margin - 4, curY + 10.5, { align: 'right' });

  y += tableHeight + 8;

  // Gift Message Callout (if present)
  if (order.giftMessage) {
    doc.setFillColor(255, 253, 249);
    doc.setDrawColor(...terracottaColor);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...terracottaColor);
    doc.text('HANDWRITTEN GIFT NOTE INCLUDED:', margin + 4, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...espressoColor);
    const splitMsg = doc.splitTextToSize(`"${order.giftMessage}"`, contentWidth - 8);
    doc.text(splitMsg, margin + 4, y + 10);

    y += 18;
  }

  // 7. Footer & Signoff
  doc.setDrawColor(...lightGray);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(
    'This is an authorized computer-generated tax invoice for your Kaapi Works order. No signature is required.',
    pageWidth / 2,
    y + 6,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...terracottaColor);
  doc.text(
    'Kaapi Works Specialty Roasters Private Limited · www.kaapiworks.in · Direct Estate Sourcing',
    pageWidth / 2,
    y + 11,
    { align: 'center' }
  );

  // Trigger browser file download
  const sanitizedOrderNumber = (order.orderNumber || 'order').replace(/[^a-zA-Z0-9_-]/g, '');
  doc.save(`KaapiWorks-Invoice-${sanitizedOrderNumber}.pdf`);
}
