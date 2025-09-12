const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const buyerSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    minLength: 2,
    maxLength: 80
  },
  email: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minLength: 10,
    maxLength: 15
  },
  city: {
    type: String,
    enum: ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'],
    required: [true, 'City is required']
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'],
    required: [true, 'Property type is required']
  },
  bhk: {
    type: String,
    enum: ['1', '2', '3', '4', 'Studio'],
    default: null
  },
  purpose: {
    type: String,
    enum: ['Buy', 'Rent'],
    required: [true, 'Purpose is required']
  },
  budgetMin: {
    type: Number,
    default: null
  },
  budgetMax: {
    type: Number,
    default: null
  },
  timeline: {
    type: String,
    enum: ['0-3m', '3-6m', '>6m', 'Exploring'],
    required: [true, 'Timeline is required']
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Walk-in', 'Call', 'Other'],
    required: [true, 'Source is required']
  },
  status: {
    type: String,
    enum: ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'],
    default: 'New'
  },
  notes: {
    type: String,
    maxLength: 1000,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  ownerId: {
    type: String,
    required: [true, 'Owner ID is required']
  },
}, {
  timestamps: true, // Creates createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save validation
buyerSchema.pre('save', function(next) {
  // BHK validation for Apartment or Villa
  if (this.bhk && !['Apartment', 'Villa'].includes(this.propertyType)) {
    return next(new Error('BHK is only valid for Apartment or Villa property types'));
  }

  // Budget validation
  if (this.budgetMin && this.budgetMax && this.budgetMax < this.budgetMin) {
    return next(new Error('Maximum budget must be greater than or equal to minimum budget'));
  }

  next();
});

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;