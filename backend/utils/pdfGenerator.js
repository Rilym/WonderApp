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
    const brandColor = '#2563eb';
    const darkGray = '#1f2937';
    const lightGray = '#f9fafb';
    const borderColor = '#e5e7eb';

    // --- Full Width Header Banner ---
    doc.rect(0, 0, doc.page.width, 110).fill(brandColor);
    
    // Header Text
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('WanderApp', 50, 40);
       
    doc.fontSize(12)
       .font('Helvetica')
       .text('OFFICIAL E-TICKET VOUCHER', 50, 75, { characterSpacing: 2 });

    // Header Right
    doc.fontSize(10)
       .font('Helvetica')
       .text('www.wanderapp.com', 0, 50, { align: 'right', width: doc.page.width - 50 });

    // --- Order Details Section ---
    const startY = 140;
    
    doc.fillColor(brandColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('ORDER SUMMARY', 50, startY);
       
    doc.moveTo(50, startY + 20).lineTo(doc.page.width - 50, startY + 20).strokeColor(borderColor).lineWidth(1).stroke();
    
    doc.fillColor(darkGray).font('Helvetica').fontSize(11);
    doc.text(`Order Reference : #${order.id.toString().padStart(6, '0')}`, 50, startY + 35);
    doc.text(`Purchase Date   : ${new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, startY + 55);
    
    doc.text(`Order Status    : `, 50, startY + 75);
    doc.font('Helvetica-Bold')
       .fillColor(order.status === 'paid' ? '#16a34a' : '#ea580c')
       .text(order.status.toUpperCase(), 140, startY + 75);

    // --- Ticket Items ---
    let currentY = startY + 120;

    items.forEach((item, index) => {
        // Handle Page Break if ticket box won't fit
        if (currentY > doc.page.height - 180) {
            doc.addPage();
            currentY = 50;
        }

        // Draw Ticket Box Background
        doc.rect(50, currentY, doc.page.width - 100, 110)
           .fillColor(lightGray)
           .fillAndStroke(lightGray, borderColor);

        // Draw Left Accent Line for Ticket Box
        doc.rect(50, currentY, 8, 110).fill(brandColor);

        // Content inside ticket box
        doc.fillColor(darkGray)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(item.name, 75, currentY + 20);

        doc.fontSize(11).font('Helvetica').fillColor('#4b5563');
        
        let bookDate = item.booking_date 
            ? new Date(item.booking_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
            : 'Open Date (Valid anytime)';
            
        doc.text(`Booking Date :  ${bookDate}`, 75, currentY + 45);
        doc.text(`Quantity     :  ${item.quantity} Pax`, 75, currentY + 65);
        
        // Price per item / Subtotal inside the box
        doc.font('Helvetica-Bold').fontSize(14).fillColor(brandColor);
        doc.text(`Rp ${parseFloat(item.price).toLocaleString('id-ID')}`, 0, currentY + 80, { align: 'right', width: doc.page.width - 70 });

        currentY += 130; // Spacing for next ticket
    });

    // --- Footer & Total ---
    currentY += 10;
    doc.moveTo(50, currentY).lineTo(doc.page.width - 50, currentY).strokeColor(brandColor).lineWidth(2).stroke();
    
    currentY += 20;
    doc.fillColor(darkGray)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(`GRAND TOTAL: Rp ${parseFloat(order.total_amount).toLocaleString('id-ID')}`, 50, currentY, { align: 'right' });

    // Note at bottom
    currentY += 50;
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#9ca3af');
    doc.text('Please present this E-Ticket (digital or printed) at the entrance gate.', 50, currentY, { align: 'center' });
    doc.text('Thank you for exploring with WanderApp!', 50, currentY + 15, { align: 'center' });
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
