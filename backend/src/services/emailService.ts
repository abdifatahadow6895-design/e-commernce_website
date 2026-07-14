import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
});

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)}
  .header{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:24px}
  .content{padding:30px;color:#374151;line-height:1.6}
  .btn{display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0}
  .footer{padding:20px;text-align:center;color:#9ca3af;font-size:12px;background:#f9fafb}
</style></head>
<body><div class="container">
  <div class="header"><h1>NexShop</h1></div>
  <div class="content">${content}</div>
  <div class="footer">&copy; ${new Date().getFullYear()} NexShop. All rights reserved.</div>
</div></body></html>`;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!config.smtp.user) {
    logger.info(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html: baseTemplate(html),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${config.clientUrl}/verify-email?token=${token}`;
  await sendEmail(email, 'Verify Your Email - NexShop', `
    <h2>Welcome to NexShop!</h2>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${url}" class="btn">Verify Email</a>
    <p>Or copy this link: ${url}</p>
    <p>This link expires in 24 hours.</p>
  `);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail(email, 'Reset Your Password - NexShop', `
    <h2>Password Reset Request</h2>
    <p>Click the button below to reset your password:</p>
    <a href="${url}" class="btn">Reset Password</a>
    <p>Or copy this link: ${url}</p>
    <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `);
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
) => {
  const itemsHtml = items
    .map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price.toFixed(2)}</td></tr>`)
    .join('');
  await sendEmail(email, `Order Confirmation #${orderNumber} - NexShop`, `
    <h2>Thank you for your order!</h2>
    <p>Order <strong>#${orderNumber}</strong> has been confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Item</th><th>Qty</th><th>Price</th></tr>
      ${itemsHtml}
    </table>
    <p><strong>Total: $${total.toFixed(2)}</strong></p>
    <a href="${config.clientUrl}/orders/${orderNumber}" class="btn">Track Order</a>
  `);
};

export const sendOrderStatusEmail = async (email: string, orderNumber: string, status: string) => {
  await sendEmail(email, `Order #${orderNumber} - ${status}`, `
    <h2>Order Update</h2>
    <p>Your order <strong>#${orderNumber}</strong> status has been updated to: <strong>${status}</strong></p>
    <a href="${config.clientUrl}/orders/${orderNumber}" class="btn">View Order</a>
  `);
};

export const sendSMS = async (phone: string, message: string) => {
  if (!config.twilio.accountSid) {
    logger.info(`[SMS Mock] To: ${phone}, Message: ${message}`);
    return;
  }
  logger.info(`SMS sent to ${phone}`);
};

export const sendContactEmail = async (data: { name: string; email: string; subject: string; message: string }) => {
  const supportEmail = config.smtp.from.match(/<(.+)>/)?.[1] || 'support@nexshop.com';
  await sendEmail(
    supportEmail,
    `[Contact] ${data.subject}`,
    `
    <h2>New Contact Message</h2>
    <p><strong>From:</strong> ${data.name} (${data.email})</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
  `
  );
  await sendEmail(data.email, 'We received your message - NexShop', `
    <h2>Thank you for contacting NexShop</h2>
    <p>Hi ${data.name}, we received your message and will respond within 24 hours.</p>
  `);
};
