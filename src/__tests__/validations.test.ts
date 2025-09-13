import { createBuyerSchema, csvRowSchema } from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('createBuyerSchema', () => {
    it('should validate a valid buyer with all required fields', () => {
      const validBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should require BHK for Apartment property type', () => {
      const buyerWithoutBHK = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithoutBHK);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['bhk']);
      }
    });

    it('should require BHK for Villa property type', () => {
      const buyerWithoutBHK = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Villa',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithoutBHK);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['bhk']);
      }
    });

    it('should not require BHK for non-residential property types', () => {
      const buyerWithoutBHK = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Office',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithoutBHK);
      expect(result.success).toBe(true);
    });

    it('should validate budget constraints', () => {
      const buyerWithInvalidBudget = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 1000000,
        budgetMax: 500000, // Less than min
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithInvalidBudget);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['budgetMax']);
      }
    });

    it('should validate phone number format', () => {
      const buyerWithInvalidPhone = {
        fullName: 'John Doe',
        phone: '123', // Too short
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithInvalidPhone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['phone']);
      }
    });

    it('should validate full name length', () => {
      const buyerWithShortName = {
        fullName: 'J', // Too short
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(buyerWithShortName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['fullName']);
      }
    });
  });

  describe('csvRowSchema', () => {
    it('should validate CSV row with string values', () => {
      const csvRow = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '1000000',
        budgetMax: '2000000',
        timeline: '0-3m',
        source: 'Website',
        notes: 'Interested buyer',
        tags: 'premium,urgent',
        status: 'New',
      };

      const result = csvRowSchema.safeParse(csvRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budgetMin).toBe(1000000);
        expect(result.data.budgetMax).toBe(2000000);
        expect(result.data.tags).toEqual(['premium', 'urgent']);
      }
    });

    it('should handle empty tags in CSV', () => {
      const csvRow = {
        fullName: 'John Doe',
        email: '',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Office',
        bhk: '',
        purpose: 'Buy',
        budgetMin: '',
        budgetMax: '',
        timeline: '0-3m',
        source: 'Website',
        notes: '',
        tags: '',
        status: 'New',
      };

      const result = csvRowSchema.safeParse(csvRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });
  });
});
