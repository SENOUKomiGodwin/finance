const FinancialData = require('../models/FinancialData');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateReport = async (req, res) => {
  try {
    const { format, data_id } = req.query;
    const data = await FinancialData.findById(data_id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.user_id !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    switch (format) {
      case 'excel':
        await generateExcelReport(data, res);
        break;
      case 'pdf':
        await generatePDFReport(data, res);
        break;
      case 'csv':
        await generateCSVReport(data, res);
        break;
      default:
        res.status(400).json({ message: 'Unsupported format. Use: excel, pdf, or csv' });
    }
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

const generateExcelReport = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Financial Data');

  // Add headers
  const headers = Object.keys(data.data[0] || {});
  worksheet.addRow(headers);

  // Add data
  data.data.forEach(row => {
    worksheet.addRow(headers.map(header => row[header]));
  });

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial-report-${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

const generatePDFReport = async (data, res) => {
  const doc = new PDFDocument();
  const fileName = `financial-report-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../uploads', fileName);

  doc.pipe(fs.createWriteStream(filePath));
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  // Add content to PDF
  doc.fontSize(20).text('Financial Analytics Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.fontSize(14).text(`Dataset: ${data.file_name}`);
  doc.moveDown();

  // Add summary statistics
  const amounts = data.data.map(r => parseFloat(r.amount) || 0);
  const total = amounts.reduce((a, b) => a + b, 0);
  const avg = total / amounts.length;

  doc.fontSize(12).text(`Total Records: ${data.data.length}`);
  doc.text(`Total Amount: $${total.toFixed(2)}`);
  doc.text(`Average Amount: $${avg.toFixed(2)}`);
  doc.moveDown();

  // Add table
  doc.fontSize(10);
  const headers = Object.keys(data.data[0] || {});
  let y = doc.y;

  headers.forEach((header, i) => {
    doc.text(header, 50 + (i * 100), y, { width: 90 });
  });
  y += 20;

  data.data.slice(0, 50).forEach(row => {
    headers.forEach((header, i) => {
      doc.text(String(row[header] || ''), 50 + (i * 100), y, { width: 90 });
    });
    y += 15;
  });

  if (data.data.length > 50) {
    doc.text(`... and ${data.data.length - 50} more records`, 50, y + 10);
  }

  doc.end();

  // Stream the file to response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  fileStream.on('end', () => {
    fs.unlinkSync(filePath);
  });
};

const generateCSVReport = async (data, res) => {
  const headers = Object.keys(data.data[0] || {});
  let csvContent = headers.join(',') + '\n';

  data.data.forEach(row => {
    csvContent += headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial-report-${Date.now()}.csv`
  );

  res.send(csvContent);
};
