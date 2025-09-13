const express = require('express');
const router = express.Router();
const {
  getBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer
} = require('../controllers/buyerController');
const {
  importBuyersFromCSV,
  exportBuyersToCSV
} = require('../controllers/csvController');
const upload = require('../middleware/fileUploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes - require authentication
router.use(protect);

// Get all buyers with filtering, pagination
router.get('/', getBuyers);

// Export buyers as CSV (based on the same filters as getBuyers)
router.get('/export-csv', exportBuyersToCSV);

// Import buyers from CSV
router.post('/import-csv', upload.single('file'), importBuyersFromCSV);

// Get single buyer
router.get('/:id', getBuyerById);

// Create new buyer
router.post('/', createBuyer);

// Update buyer
router.put('/:id', updateBuyer);

// Delete buyer
router.delete('/:id', deleteBuyer);

module.exports = router;