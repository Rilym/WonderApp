const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function getOrderDetails(orderId) {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) throw new Error('Order not found');
    
    const [items] = await db.query(`
        SELECT oi.quantity, oi.price, oi.booking_date, d.name 
        FROM order_items oi 
        JOIN destinations d ON oi.destination_id = d.id 
        WHERE oi.order_id = ?
    `, [orderId]);
    
    return { order: orders[0], items };
}

function writePdfContent(doc, order, items) {
    // Header
    doc.fontSize(25).text('Wisata E-Ticket', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Order ID: #${order.id}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('id-ID')}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.moveDown();

    doc.fontSize(16).text('Destinations:', { underline: true });
    doc.moveDown();

    items.forEach(item => {
        doc.fontSize(14).text(`- ${item.name}`);
        if (item.booking_date) {
            doc.fontSize(12).text(`  Booking Date: ${new Date(item.booking_date).toLocaleDateString('id-ID')}`);
        }
        doc.fontSize(12).text(`  Quantity: ${item.quantity}`);
        doc.text(`  Price: Rp ${parseFloat(item.price).toLocaleString('id-ID')}`);
        doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Amount: Rp ${parseFloat(order.total_amount).toLocaleString('id-ID')}`, { align: 'right' });
}

async function generatePDFFile(orderId, user) {
    const { order, items } = await getOrderDetails(orderId);
    
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const filePath = path.join(__dirname, '..', 'uploads', `ticket_${orderId}.pdf`);
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);
        writePdfContent(doc, order, items);
        doc.end();
        
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

function generateTicketPDF(order, items, res) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename=ticket-${order.id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    writePdfContent(doc, order, items);
    doc.end();
}

module.exports = Object.assign(generatePDFFile, { generateTicketPDF });
