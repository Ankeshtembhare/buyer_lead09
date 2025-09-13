import { parseCsvContent, validateCsvRows, convertCsvRowsToBuyers, generateCsvContent } from '@/lib/csv';

describe('CSV Utilities', () => {
  describe('parseCsvContent', () => {
    it('should parse simple CSV content', () => {
      const content = 'name,email,phone\nJohn,john@example.com,1234567890\nJane,jane@example.com,0987654321';
      const result = parseCsvContent(content);
      
      expect(result).toEqual([
        ['name', 'email', 'phone'],
        ['John', 'john@example.com', '1234567890'],
        ['Jane', 'jane@example.com', '0987654321']
      ]);
    });

    it('should handle CSV with quoted values containing commas', () => {
      const content = '"John Doe","john@example.com,work","1234567890"\n"Jane Smith","jane@example.com","0987654321"';
      const result = parseCsvContent(content);
      
      expect(result).toEqual([
        ['John Doe', 'john@example.com,work', '1234567890'],
        ['Jane Smith', 'jane@example.com', '0987654321']
      ]);
    });

    it('should handle empty lines', () => {
      const content = 'name,email,phone\n\nJohn,john@example.com,1234567890\n\n';
      const result = parseCsvContent(content);
      
      expect(result).toEqual([
        ['name', 'email', 'phone'],
        ['John', 'john@example.com', '1234567890']
      ]);
    });
  });

  describe('validateCsvRows', () => {
    const validCsvRows = [
      ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'],
      ['John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', '2', 'Buy', '1000000', '2000000', '0-3m', 'Website', 'Interested', 'premium', 'New']
    ];

    it('should validate correct CSV rows', () => {
      const result = validateCsvRows(validCsvRows);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should report validation errors for invalid rows', () => {
      const invalidCsvRows = [
        ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'],
        ['', 'invalid-email', '123', 'InvalidCity', 'Apartment', '', 'Buy', '1000000', '500000', '0-3m', 'Website', '', '', 'New']
      ];

      const result = validateCsvRows(invalidCsvRows);
      
      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should skip empty rows', () => {
      const csvWithEmptyRows = [
        ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', '2', 'Buy', '1000000', '2000000', '0-3m', 'Website', '', '', 'New']
      ];

      const result = validateCsvRows(csvWithEmptyRows);
      
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });
  });

  describe('convertCsvRowsToBuyers', () => {
    it('should convert valid CSV rows to buyer objects', () => {
      const validCsvRows = [
        ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'],
        ['John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', '2', 'Buy', '1000000', '2000000', '0-3m', 'Website', 'Interested', 'premium,urgent', 'New']
      ];

      const result = convertCsvRowsToBuyers(validCsvRows);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 1000000,
        budgetMax: 2000000,
        timeline: '0-3m',
        source: 'Website',
        notes: 'Interested',
        tags: ['premium', 'urgent'],
        status: 'New'
      });
    });

    it('should skip invalid rows', () => {
      const mixedCsvRows = [
        ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'],
        ['John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', '2', 'Buy', '1000000', '2000000', '0-3m', 'Website', '', '', 'New'],
        ['', 'invalid-email', '123', 'InvalidCity', 'Apartment', '', 'Buy', '1000000', '500000', '0-3m', 'Website', '', '', 'New']
      ];

      const result = convertCsvRowsToBuyers(mixedCsvRows);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('John Doe');
    });
  });

  describe('generateCsvContent', () => {
    it('should generate CSV content from buyer objects', () => {
      const buyers = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          city: 'Chandigarh',
          propertyType: 'Apartment',
          bhk: '2',
          purpose: 'Buy',
          budgetMin: 1000000,
          budgetMax: 2000000,
          timeline: '0-3m',
          source: 'Website',
          notes: 'Interested',
          tags: ['premium', 'urgent'],
          status: 'New'
        }
      ];

      const result = generateCsvContent(buyers);
      
      expect(result).toContain('"fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"');
      expect(result).toContain('"John Doe","john@example.com","9876543210","Chandigarh","Apartment","2","Buy","1000000","2000000","0-3m","Website","Interested","premium,urgent","New"');
    });

    it('should handle empty values and arrays', () => {
      const buyers = [
        {
          fullName: 'John Doe',
          email: '',
          phone: '9876543210',
          city: 'Chandigarh',
          propertyType: 'Office',
          bhk: '',
          purpose: 'Buy',
          budgetMin: null,
          budgetMax: null,
          timeline: '0-3m',
          source: 'Website',
          notes: '',
          tags: [],
          status: 'New'
        }
      ];

      const result = generateCsvContent(buyers);
      
      expect(result).toContain('"John Doe","","9876543210","Chandigarh","Office","","Buy","","","0-3m","Website","","","New"');
    });
  });
});
