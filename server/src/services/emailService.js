import nodemailer from 'nodemailer';
import { getIsMongoConnected } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/store.js';

let transporterPromise = null;

/**
 * Initializes and returns the Nodemailer transporter.
 * Uses custom SMTP credentials if defined in environment variables,
 * or gracefully provisions an Ethereal test account for local development and review.
 */
async function getTransporter() {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      console.log(`[EmailService] Configuring SMTP transporter for ${smtpHost}:${smtpPort}`);
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    // Fallback: Provision a zero-configuration Ethereal test account
    try {
      console.log('[EmailService] No production SMTP configured. Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      console.log(`[EmailService] Ethereal test account created: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('[EmailService] Could not connect to Ethereal, using JSON transport fallback:', err.message);
      return nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  })();

  return transporterPromise;
}

/**
 * Status descriptions and badges for email notifications
 */
const STATUS_CONFIG = {
  confirmed: {
    label: 'Order Confirmed',
    color: '#2F4A3A',
    badgeText: 'CONFIRMED',
    headline: 'Your order has been confirmed!',
    description:
      'Our roast masters in Indiranagar have received your order. We are queuing your single-origin beans for fresh small-batch roasting.',
  },
  processing: {
    label: 'Processing & Sorting',
    color: '#C2622D',
    badgeText: 'PROCESSING',
    headline: 'Your beans are being weighed & sorted',
    description:
      'We are measuring your green bean lot sizes, calibrating moisture levels, and setting roast profiles.',
  },
  roasted: {
    label: 'Freshly Roasted',
    color: '#B45309',
    badgeText: 'FRESHLY ROASTED',
    headline: 'Fresh from the Roaster drum!',
    description:
      'Your coffee cherries have completed roasting! They are currently undergoing 12 hours of natural resting before nitrogen-flushed sealing.',
  },
  dispatched: {
    label: 'Dispatched from Roastery',
    color: '#1D4ED8',
    badgeText: 'DISPATCHED',
    headline: 'Packed in foil pouches & dispatched',
    description:
      'Your order has been sealed in foil pouches with one-way degassing valves and handed over to our express air courier.',
  },
  shipped: {
    label: 'In Transit (Shipped)',
    color: '#15803D',
    badgeText: 'IN TRANSIT',
    headline: 'Your coffee is on its way to you!',
    description:
      'Your parcel is moving swiftly via express air transit. It will arrive fresh and ready to brew.',
  },
  delivered: {
    label: 'Delivered',
    color: '#047857',
    badgeText: 'DELIVERED',
    headline: 'Your Kaapi parcel has arrived!',
    description:
      'Your specialty coffee has reached its destination. For optimal sweetness and body, let the beans rest 4-7 days from roast date.',
  },
  cancelled: {
    label: 'Order Cancelled',
    color: '#B91C1C',
    badgeText: 'CANCELLED',
    headline: 'Order Cancelled',
    description:
      'Your order has been cancelled. Any pre-paid funds have been routed for refund back to your original payment method.',
  },
};

/**
 * Generates responsive HTML email template for order status updates
 */
function renderOrderStatusTemplate({
  order,
  customerName,
  previousStatus,
  newStatus,
  appUrl,
}) {
  const statusInfo = STATUS_CONFIG[newStatus.toLowerCase()] || {
    label: newStatus.toUpperCase(),
    color: '#C2622D',
    badgeText: newStatus.toUpperCase(),
    headline: `Order Status: ${newStatus}`,
    description: `Your order status has changed to ${newStatus}.`,
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const orderUrl = `${appUrl}/orders/${order._id || order.orderNumber}`;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8DECF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <strong style="color: #2B1D16; font-size: 14px; display: block;">${item.name || 'Specialty Coffee'}</strong>
        ${item.roastLevel ? `<span style="font-size: 12px; color: #8C6D58; text-transform: uppercase;">Roast: ${item.roastLevel}</span>` : ''}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #E8DECF; text-align: center; color: #2B1D16; font-size: 14px; font-family: -apple-system, sans-serif;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8DECF; text-align: right; color: #2B1D16; font-size: 14px; font-weight: bold; font-family: -apple-system, sans-serif;">
        ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
      </td>
    </tr>
  `
    )
    .join('');

  const shippingAddr = order.shippingAddress || {};
  const addressLine = [
    shippingAddr.street,
    shippingAddr.city,
    shippingAddr.state,
    shippingAddr.postalCode ? `PIN: ${shippingAddr.postalCode}` : '',
    shippingAddr.country || 'India',
  ]
    .filter(Boolean)
    .join(', ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - Kaapi Works</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4EDE3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F4EDE3; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #FAF6F0; border: 1px solid #E8DECF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(43, 29, 22, 0.06);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #2B1D16; padding: 24px 30px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #C2622D; color: #FAF6F0; width: 32px; height: 32px; line-height: 32px; border-radius: 6px; font-weight: bold; font-size: 16px; vertical-align: middle; margin-right: 8px;">☕</span>
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #FAF6F0; letter-spacing: 0.5px; vertical-align: middle;">KAAPI WORKS</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-size: 10px; color: #C2622D; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Artisanal South Indian Specialty Roasters</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Highlight Banner -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FAF6F0; border-bottom: 1px solid #E8DECF;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: ${statusInfo.color}15; border: 1px solid ${statusInfo.color}40; color: ${statusInfo.color}; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                ● ${statusInfo.badgeText}
              </div>
              <h1 style="margin: 0 0 10px 0; color: #2B1D16; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold;">
                ${statusInfo.headline}
              </h1>
              <p style="margin: 0 auto; max-width: 480px; color: #5C4738; font-size: 14px; line-height: 1.6;">
                ${statusInfo.description}
              </p>
              ${
                previousStatus && previousStatus !== newStatus
                  ? `<div style="margin-top: 12px; font-size: 12px; color: #8C6D58;">Status changed from <strike>${previousStatus}</strike> to <strong>${newStatus}</strong></div>`
                  : ''
              }
            </td>
          </tr>

          <!-- Tracking Details (if available) -->
          ${
            order.trackingNumber || order.carrier
              ? `
          <tr>
            <td style="padding: 18px 30px; background-color: #F4EDE3; border-bottom: 1px solid #E8DECF;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                <tr>
                  <td style="color: #8C6D58; font-size: 11px; text-transform: uppercase; font-weight: 600;">Carrier Partner:</td>
                  <td style="color: #2B1D16; font-weight: bold; text-align: right;">${order.carrier || 'Blue Dart Express Air'}</td>
                </tr>
                <tr>
                  <td style="padding-top: 6px; color: #8C6D58; font-size: 11px; text-transform: uppercase; font-weight: 600;">AWB Tracking ID:</td>
                  <td style="padding-top: 6px; color: #C2622D; font-weight: bold; font-family: monospace; text-align: right;">${order.trackingNumber || 'Available at dispatch'}</td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Order Summary Header -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; color: #C2622D; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Order Summary</span>
                    <h2 style="margin: 2px 0 0 0; color: #2B1D16; font-family: Georgia, 'Times New Roman', serif; font-size: 18px;">
                      #${order.orderNumber}
                    </h2>
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <span style="font-size: 12px; color: #8C6D58;">Placed on ${formattedDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <thead>
                  <tr style="border-bottom: 2px solid #2B1D16;">
                    <th align="left" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8C6D58; font-weight: 600;">Micro-Lot Item</th>
                    <th align="center" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8C6D58; font-weight: 600;">Qty</th>
                    <th align="right" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8C6D58; font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 15px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #5C4738;">Subtotal:</td>
                  <td align="right" style="padding: 4px 0; color: #2B1D16; font-weight: 600;">₹${(order.subtotal || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #5C4738;">Express Pan-India Shipping:</td>
                  <td align="right" style="padding: 4px 0; color: #2F4A3A; font-weight: 600;">
                    ${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 0 0; color: #2B1D16; font-size: 15px; font-weight: bold; border-top: 1px solid #E8DECF;">Total Paid:</td>
                  <td align="right" style="padding: 8px 0 0 0; color: #2B1D16; font-size: 16px; font-weight: bold; border-top: 1px solid #E8DECF;">
                    ₹${(order.total || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 16px 30px; background-color: #F4EDE3; border-top: 1px solid #E8DECF; font-size: 12px; color: #5C4738; line-height: 1.5;">
              <strong style="color: #2B1D16; font-size: 13px; display: block; margin-bottom: 4px;">Delivery Address</strong>
              ${customerName ? `<span>${customerName}</span><br>` : ''}
              <span>${addressLine || 'Address on file'}</span>
            </td>
          </tr>

          ${
            order.giftMessage
              ? `
          <!-- Personalized Gift Note -->
          <tr>
            <td style="padding: 16px 30px; background-color: #FFFDF9; border-top: 1px solid #E8DECF; font-size: 12px; color: #5C4738;">
              <div style="display: inline-block; background-color: #C2622D15; border: 1px solid #C2622D40; color: #C2622D; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                🎁 Complimentary Handwritten Gift Note Included
              </div>
              <p style="margin: 0; font-style: italic; color: #2B1D16; font-family: Georgia, serif; line-height: 1.5; font-size: 13px;">
                "${order.giftMessage}"
              </p>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Call to Action -->
          <tr>
            <td style="padding: 28px 30px; text-align: center;">
              <a href="${orderUrl}" target="_blank" style="display: inline-block; background-color: #2B1D16; color: #FAF6F0; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(43,29,22,0.15);">
                Track Your Order Online →
              </a>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #8C6D58;">
                Have questions about your brew? Reply directly to this email or reach us at <a href="mailto:care@kaapiworks.in" style="color: #C2622D; text-decoration: none; font-weight: 600;">care@kaapiworks.in</a>.
              </p>
            </td>
          </tr>

          <!-- Roastery Footer -->
          <tr>
            <td style="background-color: #24160F; padding: 20px 30px; text-align: center; color: #A89B91; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #FAF6F0; font-weight: bold;">Kaapi Works Specialty Roasters Pvt. Ltd.</p>
              <p style="margin: 0 0 6px 0;">12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038</p>
              <p style="margin: 0; color: #8C6D58;">Direct Trade Certified · Roasted to Order · Zero Plastic Packaging</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a confirmation email to customer when order status changes.
 *
 * @param {Object} params
 * @param {Object} params.order The order document or record
 * @param {string} [params.customerEmail] Optional email override
 * @param {string} [params.customerName] Optional name override
 * @param {string} [params.previousStatus] The previous status before update
 * @param {string} params.newStatus The newly assigned status
 */
export async function sendOrderStatusNotification({
  order,
  customerEmail,
  customerName,
  previousStatus = 'confirmed',
  newStatus,
}) {
  try {
    let toEmail = customerEmail;
    let recipientName = customerName || 'Valued Customer';

    // 1. Resolve recipient email if not provided
    if (!toEmail && order.user) {
      if (getIsMongoConnected()) {
        const user = await User.findById(order.user);
        if (user) {
          toEmail = user.email;
          recipientName = user.name || recipientName;
        }
      } else {
        const user = memoryStore.findUserById(order.user);
        if (user) {
          toEmail = user.email;
          recipientName = user.name || recipientName;
        }
      }
    }

    if (!toEmail) {
      console.warn(`[EmailService] Cannot send status email for order ${order.orderNumber}: No recipient email found.`);
      return { success: false, reason: 'No recipient email' };
    }

    const appUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000';
    const statusLabel = (STATUS_CONFIG[newStatus.toLowerCase()]?.label || newStatus).toUpperCase();
    const subject = `☕ Your Kaapi Works Order #${order.orderNumber} is now ${statusLabel}!`;

    const html = renderOrderStatusTemplate({
      order,
      customerName: recipientName,
      previousStatus,
      newStatus,
      appUrl,
    });

    const text = `
Hello ${recipientName},

Your Kaapi Works order #${order.orderNumber} status has been updated to: ${statusLabel}.

Summary:
- Order: #${order.orderNumber}
- Total: ₹${(order.total || 0).toLocaleString('en-IN')}
- Tracking: ${order.trackingNumber || 'Available at dispatch'}
- Logistics: ${order.carrier || 'Blue Dart Express Air'}

Track your live order online: ${appUrl}/orders/${order._id || order.orderNumber}

Thank you for choosing Kaapi Works Specialty Roasters.
Need help? Email us at care@kaapiworks.in.
    `.trim();

    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"Kaapi Works Roastery" <orders@kaapiworks.in>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(
      `[EmailService] ✉️ Order notification sent to ${toEmail} for order ${order.orderNumber} (${previousStatus} -> ${newStatus}) [MessageID: ${info.messageId}]`
    );
    if (previewUrl) {
      console.log(`[EmailService] 🔗 Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to send status update email for order ${order.orderNumber}:`, error.message);
    // Never throw to caller so API response remains resilient
    return { success: false, error: error.message };
  }
}
