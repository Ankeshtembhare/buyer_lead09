import { z } from 'zod';

// City enum
export const cityEnum = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);

// Property type enum
export const propertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);

// BHK enum
export const bhkEnum = z.enum(['1', '2', '3', '4', 'Studio']);

// Purpose enum
export const purposeEnum = z.enum(['Buy', 'Rent']);

// Timeline enum
export const timelineEnum = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);

// Source enum
export const sourceEnum = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);

// Status enum
export const statusEnum = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// Base buyer schema
export const buyerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits').min(10).max(15),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional(),
  purpose: purposeEnum,
  budgetMin: z.number().int().min(0, 'Budget must be positive').optional(),
  budgetMax: z.number().int().min(0, 'Budget must be positive').optional(),
  timeline: timelineEnum,
  source: sourceEnum,
  status: statusEnum.default('New'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa properties',
  path: ['bhk'],
}).refine((data) => {
  // Budget max must be >= budget min if both are present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

// Schema for creating a new buyer
export const createBuyerSchema = buyerSchema;

// Schema for updating a buyer (all fields optional except id)
export const updateBuyerSchema = buyerSchema.partial().extend({
  id: z.string(),
  updatedAt: z.date().optional(),
});

// CSV row validation schema
export const csvRowSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional().or(z.literal('')),
  purpose: purposeEnum,
  budgetMin: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).pipe(z.number().int().min(0).optional()),
  budgetMax: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).pipe(z.number().int().min(0).optional()),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().optional().or(z.literal('')),
  tags: z.string().optional().transform((val) => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  status: statusEnum.default('New'),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa properties',
  path: ['bhk'],
}).refine((data) => {
  // Budget max must be >= budget min if both are present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

// Search and filter schema
export const searchFiltersSchema = z.object({
  search: z.string().optional(),
  city: cityEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  status: statusEnum.optional(),
  timeline: timelineEnum.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['updatedAt', 'createdAt', 'fullName']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BuyerInput = z.infer<typeof buyerSchema>;
export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
export type CsvRowInput = z.infer<typeof csvRowSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
