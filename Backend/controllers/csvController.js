const Buyer = require('../models/buyerModel');
const { parseAndValidateCSV, generateCSV } = require('../utils/csvUtils');
const fs = require('fs').promises;
const mongoose = require('mongoose');

// Import buyers from CSV file
exports.importBuyersFromCSV = async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No CSV file uploaded'
    });
  }

  try {
    // Mock owner ID - in a real app would come from authenticated user
    const ownerId = req.body.ownerId || 'user-123';
    
    // Parse and validate the CSV file
    const { validRows, errors } = await parseAndValidateCSV(req.file.path, ownerId);
    
    // If there are no valid rows, return error
    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows found in CSV',
        errors
      });
    }
    
    // Start a transaction to ensure all-or-nothing insertion
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Insert valid rows
      await Buyer.insertMany(validRows, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      // Return success response with counts
      res.status(201).json({
        success: true,
        message: `Successfully imported ${validRows.length} buyers`,
        totalRows: validRows.length + errors.length,
        successCount: validRows.length,
        errorCount: errors.length,
        errors
      });
    } catch (dbError) {
      // If there's an error during insertion, abort transaction
      await session.abortTransaction();
      session.endSession();
      
      throw dbError;
    }
  } catch (error) {
    console.error('CSV import error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing CSV file',
      errors: error.errors || []
    });
  } finally {
    // Clean up: Delete the uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }
  }
};

// Export buyers to CSV
exports.exportBuyersToCSV = async (req, res) => {
  try {
    // Get the same filters as getBuyers
    const { 
      city, 
      propertyType, 
      status, 
      timeline,
      search,
      sortBy = 'updatedAt',
      sortOrder = -1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (city) filter.city = city;
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    if (timeline) filter.timeline = timeline;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all filtered buyers for export (without pagination)
    const buyers = await Buyer.find(filter)
      .sort({ [sortBy]: parseInt(sortOrder) });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `buyers-export-${timestamp}.csv`;
    
    // Stream CSV response
    generateCSV(buyers, res, filename);
  } catch (error) {
    console.error('CSV export error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error generating CSV export'
    });
  }
};