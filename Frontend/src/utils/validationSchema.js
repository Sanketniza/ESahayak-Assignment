import { z } from 'zod';

// Define Zod validation schema for Buyer form
export const buyerFormSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(80, { message: "Name cannot exceed 80 characters" }),
    
  email: z.string()
    .email({ message: "Invalid email address" })
    .optional()
    .nullable()
    .or(z.literal("")),
    
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number cannot exceed 15 digits" })
    .refine(val => /^\d+$/.test(val), { message: "Phone number must contain only digits" }),
    
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'], {
    errorMap: () => ({ message: "Please select a valid city" })
  }),
  
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail'], {
    errorMap: () => ({ message: "Please select a valid property type" })
  }),
  
  bhk: z.enum(['1', '2', '3', '4', 'Studio'])
    .optional()
    .nullable()
    .or(z.literal("")),
    
  purpose: z.enum(['Buy', 'Rent'], {
    errorMap: () => ({ message: "Please select a valid purpose" })
  }),
  
  budgetMin: z.coerce.number()
    .positive({ message: "Budget must be positive" })
    .optional()
    .nullable()
    .or(z.literal("")),
    
  budgetMax: z.coerce.number()
    .positive({ message: "Budget must be positive" })
    .optional()
    .nullable()
    .or(z.literal("")),
    
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring'], {
    errorMap: () => ({ message: "Please select a valid timeline" })
  }),
  
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other'], {
    errorMap: () => ({ message: "Please select a valid source" })
  }),
  
  notes: z.string()
    .max(1000, { message: "Notes cannot exceed 1000 characters" })
    .optional()
    .nullable()
    .or(z.literal("")),
    
  tags: z.array(z.string())
    .optional()
    .nullable()
})
.refine(
  data => {
    // If property type is Apartment or Villa, bhk is required
    if (['Apartment', 'Villa'].includes(data.propertyType)) {
      return !!data.bhk;
    }
    return true;
  },
  {
    message: "BHK is required for Apartment or Villa property types",
    path: ["bhk"]
  }
)
.refine(
  data => {
    // If both budgetMin and budgetMax are provided, budgetMax must be >= budgetMin
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"]
  }
);