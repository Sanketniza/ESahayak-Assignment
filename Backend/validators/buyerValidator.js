const { z } = require('zod');

// Define Zod validation schema for Buyer
const BuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).max(15),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional().nullable(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().int().positive().optional().nullable(),
  budgetMax: z.number().int().positive().optional().nullable(),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).default('New'),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  ownerId: z.string(),
}).refine(data => {
  // If bhk is provided, propertyType must be Apartment or Villa
  if (data.bhk && !['Apartment', 'Villa'].includes(data.propertyType)) {
    return false;
  }
  return true;
}, {
  message: "BHK is only valid for Apartment or Villa property types",
  path: ["bhk"]
}).refine(data => {
  // If both budgetMin and budgetMax are provided, budgetMax must be greater than or equal to budgetMin
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"]
});

// Validation for creating a new buyer
const validateBuyer = (buyerData) => {
  try {
    return BuyerSchema.parse(buyerData);
  } catch (error) {
    throw {
      statusCode: 400,
      message: 'Invalid buyer data',
      errors: error.errors || error.message
    };
  }
};

module.exports = {
  BuyerSchema,
  validateBuyer
};