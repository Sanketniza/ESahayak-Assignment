// Test script to validate the Buyer model

const { validateBuyer } = require('./validators/buyerValidator');

// Sample buyer data
const sampleBuyer = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "9876543210",
  city: "Mohali",
  propertyType: "Apartment",
  bhk: "2",
  purpose: "Buy",
  budgetMin: 2000000,
  budgetMax: 3000000,
  timeline: "3-6m",
  source: "Website",
  status: "New",
  notes: "Interested in a 2 BHK apartment in Mohali",
  tags: ["Urgent", "First-time buyer"],
  ownerId: "test-owner-123"
};

// Test the validation
try {
  console.log("Validating buyer data...");
  const validatedBuyer = validateBuyer(sampleBuyer);
  console.log("Validation successful!");
  console.log(validatedBuyer);
} catch (error) {
  console.error("Validation failed:", error);
}

// Test validation with invalid data (BHK for non-residential property)
const invalidBuyer = {
  ...sampleBuyer,
  propertyType: "Office", // Non-residential
  bhk: "2" // Should be null/undefined for non-residential
};

try {
  console.log("\nValidating invalid buyer data...");
  const validatedInvalidBuyer = validateBuyer(invalidBuyer);
  console.log("Validation successful (should not happen)!");
  console.log(validatedInvalidBuyer);
} catch (error) {
  console.error("Validation failed (expected):", error.message);
}

console.log("\nTest completed.");