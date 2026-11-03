const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const FinancialData = require('../models/FinancialData');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
    }
  }
});

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
};

const parseJSON = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const validateFinancialData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  // Normalize keys to lowercase and trim whitespace
  const normalizedData = data.map(row => {
    const normalizedRow = {};
    for (const key in row) {
      normalizedRow[key.toLowerCase().trim()] = row[key];
    }
    return normalizedRow;
  });

  const requiredFields = ['date', 'amount'];
  const firstRow = normalizedData[0];
  const availableFields = Object.keys(firstRow).join(', ');
  
  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      throw new Error(`Missing required field: ${field}. Available fields: ${availableFields}`);
    }
  }

  return normalizedData;
};

exports.uploadData = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      let parsedData;

      // Parse file based on type
      switch (fileExt) {
        case '.csv':
          parsedData = await parseCSV(filePath);
          break;
        case '.xlsx':
        case '.xls':
          parsedData = parseExcel(filePath);
          break;
        case '.json':
          parsedData = parseJSON(filePath);
          break;
        default:
          return res.status(400).json({ message: 'Unsupported file type' });
      }

      // Validate data
      validateFinancialData(parsedData);

      // Store in database
      const financialData = await FinancialData.create({
        user_id: req.user.id,
        file_name: req.file.originalname,
        file_type: fileExt.replace('.', ''),
        data: parsedData,
        metadata: {
          record_count: parsedData.length,
          upload_date: new Date().toISOString()
        }
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.status(201).json({
        message: 'Data uploaded successfully',
        data: financialData
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        message: 'Error processing file',
        error: error.message 
      });
    }
  }
];

exports.getData = async (req, res) => {
  try {
    const data = await FinancialData.findByUserId(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching data' });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const data = await FinancialData.findById(req.params.id);
    
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.user_id !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(data);
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching data' });
  }
};

exports.deleteData = async (req, res) => {
  try {
    const data = await FinancialData.findById(req.params.id);
    
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.user_id !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await FinancialData.delete(req.params.id);
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Data deletion error:', error);
    res.status(500).json({ message: 'Server error deleting data' });
  }
};
