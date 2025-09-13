const { BuyerSchema } = require('../validators/buyerValidator');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

// Expected CSV header fields
const expectedHeaders = [
  'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
  'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 
  'notes', 'tags', 'status'
];

/**
 * Parse and validate a CSV file for buyer data import
 * @param {string} filePath - Path to the uploaded CSV file
 * @param {string} ownerId - ID of the user importing the data
 * @returns {Promise<{validRows: Array, errors: Array}>} - Valid rows and validation errors
 */
const parseAndValidateCSV = (filePath, ownerId) => {
  return new Promise((resolve, reject) => {
    const validRows = [];
    const errors = [];
    let rowNum = 0;
    let headers = [];
    
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
      .on('headers', (headerList) => {
        headers = headerList;
        
        // Validate CSV headers
        const missingHeaders = expectedHeaders.filter(h => !headerList.includes(h));
        if (missingHeaders.length > 0) {
          return reject({
            message: `Missing required headers: ${missingHeaders.join(', ')}`
          });
        }
      })
      .on('error', error => reject(error))
      .on('data', row => {
        rowNum++;

        // Skip if we already have 200 valid rows
        if (validRows.length >= 200) {
          errors.push({ row: rowNum, message: 'Exceeded maximum import limit of 200 rows' });
          return;
        }
        
        try {
          // Format the data for validation
          const buyerData = {
            ...row,
            // Convert string values to appropriate types
            budgetMin: row.budgetMin ? parseInt(row.budgetMin, 10) : null,
            budgetMax: row.budgetMax ? parseInt(row.budgetMax, 10) : null,
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
            ownerId: ownerId
          };
          
          // Validate with Zod schema
          BuyerSchema.parse(buyerData);
          
          // Add to valid rows
          validRows.push(buyerData);
        } catch (error) {
          // Add validation error
          const errorMessage = error.errors && error.errors.length > 0 
            ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            : error.message;
          
          errors.push({ row: rowNum, message: errorMessage });
        }
      })
      .on('end', () => {
        // Check if we have any valid rows
        if (validRows.length === 0 && errors.length > 0) {
          return reject({
            message: 'No valid rows found in CSV',
            errors
          });
        }
        
        resolve({ validRows, errors });
      });
  });
};

/**
 * Generate a CSV from buyer data
 * @param {Array} buyers - Array of buyer objects
 * @param {Object} res - Express response object to stream CSV
 * @param {string} filename - Name for the downloaded file
 */
const generateCSV = (buyers, res, filename) => {
  // Set response headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Format data for CSV export
  const csvData = buyers.map(buyer => {
    return {
      fullName: buyer.fullName || '',
      email: buyer.email || '',
      phone: buyer.phone || '',
      city: buyer.city || '',
      propertyType: buyer.propertyType || '',
      bhk: buyer.bhk || '',
      purpose: buyer.purpose || '',
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline || '',
      source: buyer.source || '',
      notes: buyer.notes || '',
      tags: (buyer.tags || []).join(','),
      status: buyer.status || ''
    };
  });
  
  // Stream CSV to response
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(res);
  
  // Write data to CSV
  csvData.forEach(row => csvStream.write(row));
  
  // End the stream
  csvStream.end();
};

module.exports = {
  parseAndValidateCSV,
  generateCSV
};