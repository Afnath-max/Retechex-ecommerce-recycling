import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate Order PDF
export const generateOrderPDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `order-${order._id}-${Date.now()}.pdf`;
      const filePath = path.join('/tmp', fileName);
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).fillColor('#667eea').text('ReTechEx', { align: 'left' });
      doc.fontSize(10).fillColor('#666').text('Electronics Refurbishment & Marketplace', { align: 'left' });
      doc.moveDown();

      // Title
      doc.fontSize(24).fillColor('#000').text('ORDER INVOICE', { align: 'center' });
      doc.moveDown();

      // Order Info Box
      doc.fontSize(12).fillColor('#667eea').text(`Order #${order._id.toString().slice(-8).toUpperCase()}`, { align: 'right' });
      doc.fontSize(10).fillColor('#666')
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' })
        .text(`Status: ${order.orderStatus}`, { align: 'right' });
      doc.moveDown(2);

      // Customer Info
      doc.fontSize(14).fillColor('#000').text('Customer Information:');
      doc.fontSize(10).fillColor('#333')
        .text(`Name: ${order.user?.name || 'N/A'}`)
        .text(`Email: ${order.user?.email || 'N/A'}`)
        .text(`Phone: ${order.user?.phone || 'N/A'}`);
      doc.moveDown();

      // Shipping Address
      doc.fontSize(14).fillColor('#000').text('Shipping Address:');
      doc.fontSize(10).fillColor('#333')
        .text(order.shippingAddress.street)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state || ''}`)
        .text(`${order.shippingAddress.zipCode || ''} ${order.shippingAddress.country || 'Sri Lanka'}`);
      doc.moveDown(2);

      // Items Table Header
      const tableTop = doc.y;
      doc.fontSize(12).fillColor('#000');
      doc.text('Item', 50, tableTop, { width: 200 });
      doc.text('Qty', 270, tableTop, { width: 50, align: 'center' });
      doc.text('Price', 340, tableTop, { width: 100, align: 'right' });
      doc.text('Subtotal', 460, tableTop, { width: 100, align: 'right' });
      
      // Line under header
      doc.moveTo(50, tableTop + 20).lineTo(560, tableTop + 20).stroke();
      
      let currentY = tableTop + 30;

      // Items
      doc.fontSize(10).fillColor('#333');
      order.items.forEach((item) => {
        const subtotal = item.quantity * item.price;
        
        doc.text(item.name, 50, currentY, { width: 200 });
        doc.text(item.quantity.toString(), 270, currentY, { width: 50, align: 'center' });
        doc.text(`Rs. ${item.price.toLocaleString()}`, 340, currentY, { width: 100, align: 'right' });
        doc.text(`Rs. ${subtotal.toLocaleString()}`, 460, currentY, { width: 100, align: 'right' });
        
        currentY += 25;
      });

      // Line before total
      doc.moveTo(50, currentY).lineTo(560, currentY).stroke();
      currentY += 15;

      // Total
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('TOTAL:', 360, currentY, { width: 80, align: 'right' });
      doc.text(`Rs. ${order.totalAmount.toLocaleString()}`, 460, currentY, { width: 100, align: 'right' });
      
      doc.moveDown(3);

      // Payment Info
      doc.fontSize(12).fillColor('#000').font('Helvetica');
      doc.text('Payment Information:');
      doc.fontSize(10).fillColor('#333')
        .text(`Method: ${order.paymentMethod || 'Cash on Delivery'}`)
        .text(`Status: ${order.paymentStatus || 'Pending'}`);

      // Footer
      doc.fontSize(8).fillColor('#999')
        .text('Thank you for your business!', 50, doc.page.height - 100, { align: 'center' })
        .text('© 2024 ReTechEx - All Rights Reserved', { align: 'center' })
        .text('Contact: support@retechex.com | www.retechex.com', { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Generate Appointments Report PDF
export const generateAppointmentsReportPDF = async (appointments, filters) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
      const fileName = `appointments-report-${Date.now()}.pdf`;
      const filePath = path.join('/tmp', fileName);
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).fillColor('#667eea').text('ReTechEx', { align: 'left' });
      doc.fontSize(10).fillColor('#666').text('Appointments Report', { align: 'left' });
      doc.moveDown();

      // Title
      doc.fontSize(18).fillColor('#000').text('APPOINTMENTS REPORT', { align: 'center' });
      doc.moveDown();

      // Filters Applied
      if (filters) {
        doc.fontSize(10).fillColor('#666').text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'right' });
        if (filters.status) doc.text(`Status: ${filters.status}`, { align: 'right' });
        if (filters.branch) doc.text(`Branch: ${filters.branch}`, { align: 'right' });
        if (filters.date) doc.text(`Date: ${new Date(filters.date).toLocaleDateString()}`, { align: 'right' });
      }
      doc.moveDown(2);

      // Summary Stats
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold').text('Summary:', 50);
      doc.fontSize(10).fillColor('#333').font('Helvetica')
        .text(`Total Appointments: ${appointments.length}`)
        .text(`Pending: ${appointments.filter(a => a.status === 'Pending').length}`)
        .text(`Approved: ${appointments.filter(a => a.status === 'Approved').length}`)
        .text(`Completed: ${appointments.filter(a => a.status === 'Completed').length}`)
        .text(`Cancelled: ${appointments.filter(a => a.status === 'Cancelled').length}`);
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
      doc.text('Date', 50, tableTop, { width: 80 });
      doc.text('Time', 140, tableTop, { width: 70 });
      doc.text('Customer', 220, tableTop, { width: 120 });
      doc.text('Branch', 350, tableTop, { width: 100 });
      doc.text('Items', 460, tableTop, { width: 150 });
      doc.text('Status', 620, tableTop, { width: 80 });
      
      // Line under header
      doc.moveTo(50, tableTop + 15).lineTo(750, tableTop + 15).stroke();
      
      let currentY = tableTop + 25;

      // Appointments
      doc.fontSize(8).fillColor('#333').font('Helvetica');
      appointments.forEach((appointment, index) => {
        // Check if we need a new page
        if (currentY > 500) {
          doc.addPage();
          currentY = 50;
          
          // Repeat header on new page
          doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
          doc.text('Date', 50, currentY, { width: 80 });
          doc.text('Time', 140, currentY, { width: 70 });
          doc.text('Customer', 220, currentY, { width: 120 });
          doc.text('Branch', 350, currentY, { width: 100 });
          doc.text('Items', 460, currentY, { width: 150 });
          doc.text('Status', 620, currentY, { width: 80 });
          doc.moveTo(50, currentY + 15).lineTo(750, currentY + 15).stroke();
          currentY += 25;
          doc.fontSize(8).fillColor('#333').font('Helvetica');
        }

        const date = new Date(appointment.appointmentDate).toLocaleDateString();
        const items = appointment.items.map(i => i.itemName).join(', ').substring(0, 30);
        
        doc.text(date, 50, currentY, { width: 80 });
        doc.text(appointment.appointmentTime, 140, currentY, { width: 70 });
        doc.text(appointment.customerInfo.name, 220, currentY, { width: 120 });
        doc.text(appointment.branch, 350, currentY, { width: 100 });
        doc.text(items, 460, currentY, { width: 150 });
        doc.text(appointment.status, 620, currentY, { width: 80 });
        
        currentY += 20;
        
        // Separator line every 5 rows
        if ((index + 1) % 5 === 0) {
          doc.moveTo(50, currentY).lineTo(750, currentY).strokeOpacity(0.2).stroke().strokeOpacity(1);
          currentY += 5;
        }
      });

      // Footer
      doc.fontSize(8).fillColor('#999')
        .text('© 2024 ReTechEx - Confidential Report', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// --- NEW: Admin Summary PDF ---
export const generateAdminSummaryPDF = async (summary) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        generatedAt = new Date(),
        orders = {},
        appointments = {},
        inventory = {},
        discounts = {},
      } = summary || {};

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `admin-summary-${Date.now()}.pdf`;
      const filePath = path.join('/tmp', fileName);

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).fillColor('#667eea').text('ReTechEx', { align: 'left' });
      doc.fontSize(10).fillColor('#666').text('Admin Summary Report', { align: 'left' });
      doc.moveDown();

      // Title
      doc.fontSize(18).fillColor('#000').text('ADMIN SUMMARY REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date(generatedAt).toLocaleString()}`, { align: 'right' });
      doc.moveDown(1.5);

      const section = (title) => {
        doc.moveDown(0.8);
        doc.fontSize(14).fillColor('#111827').text(title);
        doc.moveTo(50, doc.y + 2).lineTo(560, doc.y + 2).strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.moveDown(0.6);
        doc.fontSize(11).fillColor('#374151');
      };

      const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

      // Orders
      section('Orders');
      doc.text(`Total Orders: ${orders.count || 0}`);
      doc.text(`Total Revenue: ${money(orders.revenue || 0)}`);
      doc.text(`By Status:`);
      (orders.byStatus || []).forEach(s => {
        const label = s._id || s.status || 'Unknown';
        doc.text(`  • ${label}: ${s.count}`);
      });

      // Appointments
      section('Appointments');
      doc.text(`Total Appointments: ${appointments.count || 0}`);
      doc.text(`By Status:`);
      (appointments.byStatus || []).forEach(s => {
        const label = s._id || s.status || 'Unknown';
        doc.text(`  • ${label}: ${s.count}`);
      });
      if (appointments.next) {
        doc.text(`Next Appointment: ${appointments.next.date}${appointments.next.branch ? ` • ${appointments.next.branch}` : ''}`);
      }

      // Inventory
      section('Inventory');
      doc.text(`Total Products: ${inventory.count || 0}`);
      doc.text(`Total In Stock: ${inventory.inStock || 0}`);
      if (inventory.lowStock?.length) {
        doc.text('Low Stock (top 5):');
        inventory.lowStock.slice(0, 5).forEach(p => {
          doc.text(`  • ${p.name} — stock: ${p.stock}`);
        });
      }

      // Discounts
      section('Discounts');
      doc.text(`Active Discounts: ${discounts.active || 0}`);
      if (discounts.top?.length) {
        doc.text('Top Discounts:');
        discounts.top.slice(0, 5).forEach(d => {
          const pct = d.percentage ?? d.percent ?? 0;
          doc.text(`  • ${d.code || d.name} — ${pct}%`);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#999')
        .text('© 2024 ReTechEx - Confidential', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export default {
  generateOrderPDF,
  generateAppointmentsReportPDF,
  generateAdminSummaryPDF,
};
