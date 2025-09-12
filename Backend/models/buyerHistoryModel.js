const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const buyerHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  buyerId: {
    type: String,
    ref: 'Buyer',
    required: [true, 'Buyer ID is required']
  },
  changedBy: {
    type: String,
    required: [true, 'User ID who made changes is required']
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  diff: {
    type: Object,
    required: [true, 'Changes diff is required']
  }
}, {
  timestamps: true
});

const BuyerHistory = mongoose.model('BuyerHistory', buyerHistorySchema);

module.exports = BuyerHistory;