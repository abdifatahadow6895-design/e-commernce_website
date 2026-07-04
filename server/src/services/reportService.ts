import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IOrder } from '../models/Order.js';
import { config } from '../config/index.js';

export const generateInvoicePDF = async (order: IOrder): Promise<string> => {
  const uploadDir = config.upload.dir;
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `invoice-${order.orderNumber}.pdf`;
  const filepath = path.join(uploadDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(24).text('NexShop', { align: 'center' });
    doc.fontSize(12).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Order Number: ${order.orderNumber}`);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.moveDown();

    doc.text('Shipping Address:');
    const addr = order.shippingAddress;
    doc.text(`${addr.fullName}`);
    doc.text(`${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`);
    doc.text(`${addr.country} | ${addr.phone}`);
    doc.moveDown();

    doc.fontSize(12).text('Items:', { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      doc.fontSize(10).text(`${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
    if (order.discount > 0) doc.text(`Discount: -$${order.discount.toFixed(2)}`);
    doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`);
    doc.text(`Tax: $${order.tax.toFixed(2)}`);
    doc.fontSize(12).text(`Total: $${order.total.toFixed(2)}`, { underline: true });

    doc.end();
    stream.on('finish', () => resolve(`/uploads/${filename}`));
    stream.on('error', reject);
  });
};

export const exportOrdersCSV = (orders: IOrder[]): string => {
  const headers = 'Order Number,Date,Customer,Status,Payment,Total\n';
  const rows = orders
    .map(
      (o) =>
        `${o.orderNumber},${o.createdAt.toISOString()},${o.user},${o.orderStatus},${o.paymentStatus},${o.total}`
    )
    .join('\n');
  return headers + rows;
};
