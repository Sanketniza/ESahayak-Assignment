const express = require('express');
const router = express.Router();
const {
  getBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer
} = require('../controllers/buyerController');

// Get all buyers with filtering, pagination
router.get('/', getBuyers);

// Get single buyer
router.get('/:id', getBuyerById);

// Create new buyer
router.post('/', createBuyer);

// Update buyer
router.put('/:id', updateBuyer);

// Delete buyer
router.delete('/:id', deleteBuyer);

module.exports = router;