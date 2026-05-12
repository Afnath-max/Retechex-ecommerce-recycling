// server/utils/emailService.js
import nodemailer from 'nodemailer';

/**
 * Create a Nodemailer transport using environment variables.
 * Works with Brevo (smtp-relay.brevo.com) or any SMTP provider.
 *
 * Required env (set these in server/.env):
 *  - SMTP_HOST
 *  - SMTP_PORT
 *  - SMTP_USER
 *  - SMTP_PASS
 *  - SMTP_FROM  (must be a verified sender on your SMTP provider)
 */
function createTransporter() {
  const mailer = nodemailer.default || nodemailer;

  // Basic sanity checks (don't throw here; verify() endpoint can report status)
  if (!process.env.SMTP_HOST) console.warn('[email] Missing SMTP_HOST');
  if (!process.env.SMTP_USER) console.warn('[email] Missing SMTP_USER');
  if (!process.env.SMTP_PASS) console.warn('[email] Missing SMTP_PASS');
  if (!process.env.SMTP_FROM) console.warn('[email] Missing SMTP_FROM - using default');

  return mailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ✅ FIXED: Use SMTP_FROM from .env (verified sender email)
// This MUST be a verified sender in Brevo (naweedhah@gmail.com)
const FROM = process.env.SMTP_FROM || '"ReTechEx" <naweedhah@gmail.com>';

// Small helpers
const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const currency = (n, code = 'LKR') =>
  (Number.isFinite(+n) ? Number(n) : 0).toLocaleString('en-LK', { style: 'currency', currency: code });

/* -------------------------------------------------------------------------- */
/*                           Public: diagnostics                               */
/* -------------------------------------------------------------------------- */

export async function testEmailConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service ready');
    console.log('📧 Sending from:', FROM);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error?.message || error);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                             Public: utilities                               */
/* -------------------------------------------------------------------------- */

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* -------------------------------------------------------------------------- */
/*                               Email: OTP                                    */
/* -------------------------------------------------------------------------- */

export async function sendOTPEmail(email, otp, name = '') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Your Verification Code</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Use the following One-Time Password (OTP) to verify your account:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:6px;margin:16px 0;color:#111827">${otp}</div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color:#64748b;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Your ReTechEx Verification Code',
    html,
  });

  console.log('✅ OTP email sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                             Email: Welcome                                  */
/* -------------------------------------------------------------------------- */

export async function sendWelcomeEmail(email, name = '') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Welcome to ReTechEx 🎉</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>We're excited to have you on board. You can now book drop-offs, browse the marketplace, and track your orders.</p>
      <p>If you ever need help, just reply to this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Welcome to ReTechEx!',
    html,
  });

  console.log('✅ Welcome email sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                        Email: Order Confirmation                            */
/* -------------------------------------------------------------------------- */

export async function sendOrderConfirmationEmail(email, name, order) {
  const transporter = createTransporter();

  const itemsHTML = (order?.items || [])
    .map(
      (it) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${escapeHtml(it.name || it.itemName || '')}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${Number(it.qty || it.quantity || 1)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${currency(it.price || it.unitPrice || 0)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Order Confirmation</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Thanks for your order. Below are the details:</p>

      <p style="margin:10px 0"><strong>Order #:</strong> ${escapeHtml(order?.orderNumber || order?._id || '')}<br/>
      <strong>Date:</strong> ${fmtDateTime(order?.createdAt || Date.now())}</p>

      <table style="border-collapse:collapse;width:100%;font-size:14px;margin:8px 0 14px">
        <thead>
          <tr>
            <th align="left" style="padding:6px 8px;border-bottom:1px solid #e5e7eb">Item</th>
            <th align="center" style="padding:6px 8px;border-bottom:1px solid #e5e7eb">Qty</th>
            <th align="right" style="padding:6px 8px;border-bottom:1px solid #e5e7eb">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <p><strong>Total:</strong> ${currency(order?.totalPrice || order?.total || 0)}</p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Order Confirmation - ${order?.orderNumber || order?._id || ''}`,
    html,
  });

  console.log('✅ Order confirmation sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                   Email: Appointment Approved / Confirmation                */
/* -------------------------------------------------------------------------- */

export async function sendAppointmentConfirmationEmail(email, name, appointment) {
  const transporter = createTransporter();

  const itemsHTML = (appointment?.items || [])
    .map((i) => `<li>${escapeHtml(i.itemName || i.name || 'Item')} (Qty: ${Number(i.quantity || i.qty || 1)})</li>`)
    .join('');

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Approved ✅</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Your appointment has been approved.</p>
      <p style="margin:10px 0">
        <strong>Appointment #:</strong> ${escapeHtml(appointment?.appointmentNumber || appointment?._id || '')}<br/>
        <strong>Date:</strong> ${fmtDateTime(appointment?.date || appointment?.createdAt || Date.now())}
      </p>
      ${itemsHTML ? `<p><strong>Items:</strong></p><ul>${itemsHTML}</ul>` : ''}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Appointment Approved - ${appointment?.appointmentNumber || appointment?._id || ''}`,
    html,
  });

  console.log('✅ Appointment approval sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                           Email: Forgot Password OTP                        */
/* -------------------------------------------------------------------------- */

export async function sendForgotPasswordEmail(email, otp, name = '') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Password Reset Code</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Use this OTP to reset your password:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:6px;margin:16px 0;color:#111827">${otp}</div>
      <p>This code will expire in 10 minutes.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Password Reset Code',
    html,
  });

  console.log('✅ Password reset email sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                             Email: Low Stock Alert                          */
/* -------------------------------------------------------------------------- */

export async function sendLowStockAlert(email, name, product) {
  const transporter = createTransporter();

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Low Stock Alert ⚠️</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>The following product is below its low stock threshold:</p>
      <p style="margin:10px 0">
        <strong>Product:</strong> ${escapeHtml(product?.name || '')}<br/>
        <strong>Current Stock:</strong> ${Number(product?.stockQuantity ?? 0)} units<br/>
        <strong>Threshold:</strong> ${Number(product?.lowStockThreshold ?? 0)} units
      </p>
      <p>Please consider restocking.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">ReTechEx</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Low Stock Alert - ${product?.name || ''}`,
    html,
  });

  console.log('✅ Low stock alert sent →', email);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                                   Utils                                     */
/* -------------------------------------------------------------------------- */

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default {
  createTransporter,
  testEmailConnection,
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendAppointmentConfirmationEmail,
  sendForgotPasswordEmail,
  sendLowStockAlert,
};