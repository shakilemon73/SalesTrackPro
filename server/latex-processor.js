const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const LaTeX = require('latex.js');

const router = express.Router();

// LaTeX to PDF conversion endpoint
router.post('/api/latex-to-pdf', async (req, res) => {
  const { latex, filename } = req.body;
  
  if (!latex) {
    return res.status(400).json({ error: 'LaTeX source is required' });
  }

  try {
    // Use latex.js for client-side LaTeX processing
    const generator = new LaTeX.HtmlGenerator({ hyphenate: false });
    const { html, css } = await generator.parse(latex);
    
    // Alternative: Use PDFKit for better Bengali support
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      font: 'Times-Roman'
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document.pdf'}"`);

    // Pipe the PDF to response
    doc.pipe(res);

    // Parse LaTeX-like content and convert to PDF
    await convertLatexContentToPDF(doc, latex);

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
});

// Convert LaTeX-like content to PDF using PDFKit
async function convertLatexContentToPDF(doc, latexContent) {
  // Extract content from LaTeX
  const content = parseLatexContent(latexContent);
  
  // Add title
  if (content.title) {
    doc.fontSize(20)
       .fillColor('#2563eb')
       .text(content.title, { align: 'center' });
    doc.moveDown(2);
  }

  // Add subtitle
  if (content.subtitle) {
    doc.fontSize(16)
       .fillColor('#000000')
       .text(content.subtitle, { align: 'center' });
    doc.moveDown(1);
  }

  // Add business info
  if (content.businessInfo) {
    doc.fontSize(12)
       .fillColor('#374151')
       .text(content.businessInfo);
    doc.moveDown(1);
  }

  // Add financial summary table
  if (content.financialSummary) {
    addFinancialSummaryTable(doc, content.financialSummary);
    doc.moveDown(2);
  }

  // Add transactions table
  if (content.transactions && content.transactions.length > 0) {
    addTransactionsTable(doc, content.transactions);
  }

  // Add footer
  if (content.footer) {
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(content.footer, 50, doc.page.height - 100, {
         width: doc.page.width - 100,
         align: 'center'
       });
  }
}

// Parse LaTeX content to extract structured data
function parseLatexContent(latex) {
  const content = {};
  
  // Extract title
  const titleMatch = latex.match(/\\textcolor{white}{\\Huge\\textbf{([^}]+)}}/);
  content.title = titleMatch ? titleMatch[1] : null;

  // Extract business name
  const businessMatch = latex.match(/\\Large ([^\\]+)\\\\$/m);
  content.subtitle = businessMatch ? businessMatch[1] : null;

  // Extract report date
  const dateMatch = latex.match(/প্রতিবেদনের তারিখ: ([^\\]+)/);
  content.businessInfo = dateMatch ? `প্রতিবেদনের তারিখ: ${dateMatch[1]}` : null;

  // Extract financial data (simplified parsing)
  const salesMatch = latex.match(/মোট বিক্রয়[\s\S]*?(\d+(?:\.\d+)?)/);
  const expensesMatch = latex.match(/মোট খরচ[\s\S]*?(\d+(?:\.\d+)?)/);
  const collectionsMatch = latex.match(/মোট আদায়[\s\S]*?(\d+(?:\.\d+)?)/);
  const profitMatch = latex.match(/নিট লাভ\/ক্ষতি[\s\S]*?(\d+(?:\.\d+)?)/);

  if (salesMatch || expensesMatch || collectionsMatch) {
    content.financialSummary = {
      sales: salesMatch ? parseFloat(salesMatch[1]) : 0,
      expenses: expensesMatch ? parseFloat(expensesMatch[1]) : 0,
      collections: collectionsMatch ? parseFloat(collectionsMatch[1]) : 0,
      profit: profitMatch ? parseFloat(profitMatch[1]) : 0
    };
  }

  // Add footer
  content.footer = `তৈরি: ${new Date().toLocaleDateString('bn-BD')} | দোকান হিসাব অ্যাপ`;

  return content;
}

// Add financial summary table to PDF
function addFinancialSummaryTable(doc, summary) {
  const startX = 50;
  const startY = doc.y;
  const colWidth = 150;
  const rowHeight = 30;

  // Table header
  doc.rect(startX, startY, colWidth * 3, rowHeight)
     .fillAndStroke('#e5e7eb', '#9ca3af');
  
  doc.fillColor('#000000')
     .fontSize(12)
     .text('মোট বিক্রয়', startX + 10, startY + 10)
     .text('মোট খরচ', startX + colWidth + 10, startY + 10)
     .text('নিট লাভ', startX + colWidth * 2 + 10, startY + 10);

  // Table data
  const dataY = startY + rowHeight;
  doc.rect(startX, dataY, colWidth * 3, rowHeight)
     .stroke('#d1d5db');

  doc.fontSize(14)
     .fillColor('#059669')
     .text(`৳${summary.sales.toLocaleString()}`, startX + 10, dataY + 10)
     .fillColor('#dc2626')
     .text(`৳${summary.expenses.toLocaleString()}`, startX + colWidth + 10, dataY + 10)
     .fillColor(summary.profit >= 0 ? '#059669' : '#dc2626')
     .text(`৳${Math.abs(summary.profit).toLocaleString()}`, startX + colWidth * 2 + 10, dataY + 10);

  doc.y = dataY + rowHeight + 10;
}

// Add transactions table to PDF
function addTransactionsTable(doc, transactions) {
  doc.fontSize(14)
     .fillColor('#000000')
     .text('বিস্তারিত লেনদেন', { underline: true });
  
  doc.moveDown(1);

  transactions.slice(0, 10).forEach((txn, index) => {
    const y = doc.y;
    
    doc.fontSize(10)
       .fillColor('#374151')
       .text(`${index + 1}. ${txn.description || 'N/A'}`, 50, y)
       .text(`৳${txn.amount.toLocaleString()}`, 300, y)
       .text(txn.type === 'sale' ? 'বিক্রয়' : txn.type === 'expense' ? 'খরচ' : 'আদায়', 400, y)
       .text(new Date(txn.date).toLocaleDateString('bn-BD'), 480, y);
    
    doc.moveDown(0.5);
  });
}

module.exports = router;