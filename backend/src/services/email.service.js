import nodemailer from 'nodemailer';
import { appConfig } from '../config/app-config.js';
import { ApiError } from '../errors/api-error.js';

let transporter = null;

export class EmailService {
    /**
     * Get or initialize the nodemailer SMTP transporter
     */
    static getTransporter() {
        if (!transporter) {
            const hasCredentials = Boolean(appConfig.SMTP_USER && appConfig.SMTP_PASSWORD);

            if (!hasCredentials || appConfig.NODE_ENV === 'test') {
                // In local dev without credentials or during automated tests, use a JSON / stream transporter
                transporter = nodemailer.createTransport({
                    jsonTransport: true,
                });
            } else {
                transporter = nodemailer.createTransport({
                    host: appConfig.SMTP_HOST,
                    port: appConfig.SMTP_PORT,
                    secure: appConfig.SMTP_SECURE, // true for 465, false for 587
                    auth: {
                        user: appConfig.SMTP_USER,
                        pass: appConfig.SMTP_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: appConfig.NODE_ENV === 'production',
                    },
                });
            }
        }
        return transporter;
    }

    /**
     * Verify SMTP connection status
     */
    static async verifyConnection() {
        try {
            const transport = EmailService.getTransporter();
            if (typeof transport.verify === 'function') {
                await transport.verify();
                return { connected: true, host: appConfig.SMTP_HOST, port: appConfig.SMTP_PORT };
            }
            return { connected: true, simulated: true };
        } catch (err) {
            console.error('[EmailService] SMTP verification failed:', err.message);
            return { connected: false, error: err.message };
        }
    }

    /**
     * Core email dispatcher
     */
    static async sendEmail({ to, subject, html, text, from = null, attachments = [] }) {
        if (!to) {
            throw ApiError.badRequest('Recipient email (to) is required');
        }
        if (!subject) {
            throw ApiError.badRequest('Email subject is required');
        }

        const transport = EmailService.getTransporter();
        const fromAddress = from || `"${appConfig.SMTP_FROM_NAME}" <${appConfig.SMTP_FROM_EMAIL}>`;

        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            html,
            text: text || html?.replace(/<[^>]*>?/gm, '').trim(),
            attachments,
        };

        const result = await transport.sendMail(mailOptions);
        console.log(`[EmailService] Sent email to ${to} [Subject: "${subject}"] (MessageId: ${result.messageId || 'simulated'})`);
        return result;
    }

    /**
     * Order Confirmation Email Template
     */
    static renderOrderConfirmationTemplate(order) {
        const itemsHtml = (order.items || [])
            .map(
                (item) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 8px; font-size: 14px; color: #111827;">
                        <strong>${item.name}</strong><br/>
                        <span style="font-size: 12px; color: #6b7280;">Weight: ${item.weight} | Qty: ${item.quantity}</span>
                    </td>
                    <td style="padding: 12px 8px; font-size: 14px; color: #0f382c; font-family: monospace; text-align: right; font-weight: 600;">
                        ₹${Number(item.price) * Number(item.quantity)}
                    </td>
                </tr>`
            )
            .join('');

        const addr = order.shippingAddress || {};
        const isOnline = order.paymentMethod === 'ONLINE';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - KashBites</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
                <!-- Header -->
                <div style="background-color: #0f382c; padding: 30px 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">KashBites</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px;">A Taste of Kashmir · Pure Himalayan Harvest</p>
                </div>

                <!-- Body -->
                <div style="padding: 24px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                            ${isOnline ? 'Payment Verified & Confirmed' : 'Cash on Delivery Confirmed'}
                        </span>
                        <h2 style="margin: 12px 0 4px; font-size: 20px; color: #111827;">Thank you for your order, ${addr.fullName || 'Valued Customer'}!</h2>
                        <p style="margin: 0; font-size: 14px; color: #4b5563;">Order Reference: <strong style="color: #0f382c; font-family: monospace;">#${order.orderNumber}</strong></p>
                    </div>

                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #0f382c; text-align: left;">
                                <th style="padding: 8px; font-size: 12px; color: #4b5563; text-transform: uppercase;">Items</th>
                                <th style="padding: 8px; font-size: 12px; color: #4b5563; text-transform: uppercase; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Pricing Summary -->
                    <div style="background-color: #fcfbf7; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
                            <span>Subtotal</span>
                            <span style="font-family: monospace;">₹${order.subtotal}</span>
                        </div>
                        ${
                            order.discount > 0
                                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #059669; font-weight: 600;">
                                <span>Harvest Discount</span>
                                <span style="font-family: monospace;">-₹${order.discount}</span>
                            </div>`
                                : ''
                        }
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
                            <span>Air Express Shipping</span>
                            <span style="font-family: monospace; color: #0f382c; font-weight: 600;">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 15px; font-weight: 700; color: #111827;">
                            <span>Total Payable</span>
                            <span style="font-family: monospace; color: #0f382c; font-size: 17px;">₹${order.total}</span>
                        </div>
                    </div>

                    <!-- Delivery Destination -->
                    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Delivery Destination</h3>
                        <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.5;">
                            <strong>${addr.fullName}</strong><br/>
                            ${addr.addressLine1}${addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br/>
                            ${addr.city}, ${addr.state} - ${addr.pincode}<br/>
                            Contact: ${addr.phone}
                        </p>
                    </div>

                    <!-- Air Express Notice -->
                    <div style="background-color: #fef9c3; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; font-size: 12px; color: #854d0e; text-align: center;">
                        ✈️ Your parcel is being packed at our <strong>Srinagar Cold-Packing facility</strong>. Estimated delivery: <strong>3-4 business days</strong>.
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px;">KashBites Kashmir · Industrial Estate, Sanat Nagar, Srinagar, J&K – 190005</p>
                    <p style="margin: 0;">Need help? Reply directly to this email or visit <a href="${appConfig.APP_URL}" style="color: #0f382c; text-decoration: underline;">kashbites.in</a></p>
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Payment Success / Receipt Email Template
     */
    static renderPaymentSuccessTemplate(order, paymentInfo = {}) {
        const paymentId = paymentInfo.paymentId || order.razorpayPaymentId || 'N/A';
        const addr = order.shippingAddress || {};

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Received - KashBites</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="background-color: #0f382c; padding: 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 22px;">KashBites</h1>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #d4af37;">Payment Receipt · 256-bit Secure</p>
                </div>

                <div style="padding: 24px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #d1fae5; color: #059669; font-size: 24px;">✓</div>
                        <h2 style="margin: 12px 0 4px; font-size: 18px; color: #111827;">Payment Successful!</h2>
                        <p style="margin: 0; font-size: 14px; color: #4b5563;">We have received your payment of <strong style="color: #0f382c; font-size: 16px;">₹${order.total}</strong>.</p>
                    </div>

                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
                        <div><strong>Order Number:</strong> <span style="font-family: monospace;">#${order.orderNumber}</span></div>
                        <div><strong>Razorpay Payment ID:</strong> <span style="font-family: monospace;">${paymentId}</span></div>
                        <div><strong>Payment Method:</strong> Razorpay (UPI / Card / NetBanking)</div>
                        <div><strong>Customer:</strong> ${addr.fullName || 'Customer'}</div>
                        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                    </div>

                    <p style="font-size: 13px; color: #6b7280; text-align: center;">Your order is now being cold-packed and readied for air dispatch from Srinagar.</p>
                </div>

                <div style="background-color: #f9fafb; padding: 14px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                    KashBites Kashmir · All payments verified via Razorpay
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Welcome Email Template
     */
    static renderWelcomeTemplate(user) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to KashBites Chinar Club</title>
        </head>
        <body style="font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <h1 style="color: #0f382c; margin-top: 0;">Welcome to KashBites, ${user.name || 'Friend'}!</h1>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Thank you for joining KashBites. You now have privileged access to authentic, single-origin Kashmiri Kagzi walnuts, Mamra almonds, and Himalayan sun-dried apricots straight from Shopian and Pulwama.
                </p>
                <div style="background: #fdf6e2; border: 1px solid #f6e05e; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #744210;">
                    🎁 <strong>Chinar Club Perk:</strong> Use code <strong>KASHMIR10</strong> for 10% off your orders.
                </div>
                <p style="color: #6b7280; font-size: 12px;">Warm regards,<br/>The KashBites Kashmir Team</p>
            </div>
        </body>
        </html>`;
    }

    /**
     * Account Created on Guest Order Template (with Login Credentials)
     */
    static renderAccountCreatedTemplate({ name, email, password, loginUrl = appConfig.APP_URL }) {
        const displayName = name || 'Valued Customer';
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your KashBites Account Credentials</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
                <!-- Header -->
                <div style="background-color: #0f382c; padding: 30px 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">KashBites</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px;">Welcome to Chinar Club · Pure Himalayan Harvest</p>
                </div>

                <!-- Body Content -->
                <div style="padding: 28px 24px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                            Account Created Successfully 🏔️
                        </span>
                        <h2 style="margin: 14px 0 6px; font-size: 20px; color: #111827;">Welcome, ${displayName}!</h2>
                        <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                            To ensure you can easily track your order, download GST invoices, and enjoy seamless reorders, we have automatically created a <strong>KashBites Chinar Club</strong> account for you.
                        </p>
                    </div>

                    <!-- Credentials Card -->
                    <div style="background-color: #fcfbf7; border: 2px dashed #0f382c; border-radius: 10px; padding: 20px; margin: 24px 0;">
                        <h3 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #0f382c; text-align: center; font-weight: 700;">
                            🔑 Your Login Credentials
                        </h3>

                        <div style="margin-bottom: 12px; background: #ffffff; padding: 12px 14px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 13px; color: #6b7280; font-weight: 600;">Email:</span>
                            <span style="font-size: 14px; color: #111827; font-family: monospace; font-weight: 700;">${email}</span>
                        </div>

                        <div style="background: #ffffff; padding: 12px 14px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 13px; color: #6b7280; font-weight: 600;">Temporary Password:</span>
                            <span style="font-size: 15px; color: #0f382c; font-family: monospace; font-weight: 800; background: #ecfdf5; padding: 4px 10px; border-radius: 4px; border: 1px solid #a7f3d0; letter-spacing: 1px;">${password}</span>
                        </div>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0f382c; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 4px rgba(15, 56, 44, 0.2);">
                            Sign In to KashBites &rarr;
                        </a>
                    </div>

                    <!-- Member Perks Box -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; font-size: 13px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
                        <strong style="color: #0f382c;">✨ What you can do with your account:</strong>
                        <ul style="margin: 8px 0 0; padding-left: 20px;">
                            <li>Live-track your walnut & almond parcels shipped from Srinagar.</li>
                            <li>Earn <strong>Chinar Club Points</strong> on every order to redeem for future harvest discounts.</li>
                            <li>Update your password anytime under <strong>Settings &gt; Security</strong>.</li>
                        </ul>
                    </div>

                    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
                        For your security, we recommend changing your password after your first sign in.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px;">KashBites Kashmir · Industrial Estate, Sanat Nagar, Srinagar, J&K – 190005</p>
                    <p style="margin: 0;">Need help? Reply to this email or visit <a href="${loginUrl}" style="color: #0f382c; text-decoration: underline;">kashbites.in</a></p>
                </div>
            </div>
        </body>
        </html>`;
    }
}

export default EmailService;
