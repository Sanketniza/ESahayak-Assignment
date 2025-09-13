const Buyer = require('../models/buyerModel');
const BuyerHistory = require('../models/buyerHistoryModel');
const { validateBuyer } = require('../validators/buyerValidator');

// Get all buyers with filtering, sorting and pagination
exports.getBuyers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      city, 
      propertyType, 
      status, 
      timeline,
      search,
      sortBy = 'updatedAt',
      sortOrder = -1 // -1 for descending, 1 for ascending
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

    // Count total documents for pagination
    const totalCount = await Buyer.countDocuments(filter);
    
    // Get buyers with pagination and sorting
    const buyers = await Buyer.find(filter)
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: buyers.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      data: buyers
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buyers',
      error: error.message
    });
  }
};

// Get single buyer by ID
exports.getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    
    // Get last 5 history entries
    const history = await BuyerHistory.find({ buyerId: req.params.id })
      .sort({ changedAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: buyer,
      history: history
    });
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buyer',
      error: error.message
    });
  }
};

// Create new buyer
exports.createBuyer = async (req, res) => {
  try {
    // Validate request body using Zod
    // Add the current user's ID as the owner
    const buyerData = { 
      ...req.body,
      ownerId: req.user._id 
    };
    
    // Validate request body
    const validatedData = validateBuyer(buyerData);
    
    // Create buyer
    const buyer = await Buyer.create(validatedData);
    
    // Create history entry
    await BuyerHistory.create({
      buyerId: buyer._id,
      changedBy: req.user._id,
      diff: { action: 'created', ...validatedData }
    });
    
    res.status(201).json({
      success: true,
      message: 'Buyer created successfully',
      data: buyer
    });
  } catch (error) {
    console.error('Error creating buyer:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error creating buyer',
      errors: error.errors || null
    });
  }
};

// Update buyer
exports.updateBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    
    // Check ownership - allow update if user is admin or owner
    if (buyer.ownerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this buyer. You can only edit your own leads.'
      });
    }
    
    // Validate request body
    const validatedData = validateBuyer({
      ...buyer.toObject(),
      ...req.body
    });
    
    // Track changes
    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (JSON.stringify(buyer[key]) !== JSON.stringify(req.body[key])) {
        changes[key] = {
          from: buyer[key],
          to: req.body[key]
        };
      }
    });
    
    // If there are changes, update buyer and create history
    if (Object.keys(changes).length > 0) {
      // Update buyer
      const updatedBuyer = await Buyer.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
      );
      
      // Create history entry
      await BuyerHistory.create({
        buyerId: buyer._id,
        changedBy: req.user._id,
        diff: changes
      });
      
      return res.status(200).json({
        success: true,
        message: 'Buyer updated successfully',
        data: updatedBuyer,
        changes: changes
      });
    }
    
    // If no changes were made
    res.status(200).json({
      success: true,
      message: 'No changes made',
      data: buyer
    });
  } catch (error) {
    console.error('Error updating buyer:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error updating buyer',
      errors: error.errors || null
    });
  }
};

// Delete buyer
exports.deleteBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    
    // Check ownership - allow delete if user is admin or owner
    if (buyer.ownerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this buyer. You can only delete your own leads.'
      });
    }
    
    // Delete buyer
    await Buyer.findByIdAndDelete(req.params.id);
    
    // Create history entry for deletion
    await BuyerHistory.create({
      buyerId: buyer._id,
      changedBy: req.user._id,
      diff: { action: 'deleted' }
    });
    
    res.status(200).json({
      success: true,
      message: 'Buyer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting buyer',
      error: error.message
    });
  }
};