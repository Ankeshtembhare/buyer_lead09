import { csvRowSchema, type CsvRowInput } from '@/lib/validations';

export interface CsvImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface CsvExportRow {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  source: string;
  notes: string;
  tags: string;
  status: string;
}

export function parseCsvContent(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export function validateCsvRows(rows: string[][]): CsvImportResult {
  const errors: Array<{ row: number; message: string }> = [];
  let imported = 0;

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue; // Skip empty rows
    }

    try {
      const rowData: any = {
        fullName: row[0] || '',
        email: row[1] || '',
        phone: row[2] || '',
        city: row[3] || '',
        propertyType: row[4] || '',
        bhk: row[5] || '',
        purpose: row[6] || '',
        budgetMin: row[7] || '',
        budgetMax: row[8] || '',
        timeline: row[9] || '',
        source: row[10] || '',
        notes: row[11] || '',
        tags: row[12] || '',
        status: row[13] || 'New',
      };

      csvRowSchema.parse(rowData);
      imported++;
    } catch (error: any) {
      errors.push({
        row: i + 1,
        message: error.errors?.[0]?.message || 'Invalid data',
      });
    }
  }

  return {
    success: errors.length === 0,
    imported,
    duplicates: 0, // Validation doesn't check for duplicates, only format
    errors,
  };
}

export function convertCsvRowsToBuyers(rows: string[][]): CsvRowInput[] {
  const buyers: CsvRowInput[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue;
    }

    const rowData: any = {
      fullName: row[0] || '',
      email: row[1] || '',
      phone: row[2] || '',
      city: row[3] || '',
      propertyType: row[4] || '',
      bhk: row[5] || '',
      purpose: row[6] || '',
      budgetMin: row[7] || '',
      budgetMax: row[8] || '',
      timeline: row[9] || '',
      source: row[10] || '',
      notes: row[11] || '',
      tags: row[12] || '',
      status: row[13] || 'New',
    };

    try {
      const validatedData = csvRowSchema.parse(rowData);
      buyers.push(validatedData);
    } catch (error) {
      // Skip invalid rows - they're already validated in validateCsvRows
      continue;
    }
  }

  return buyers;
}

export function generateCsvContent(buyers: any[]): string {
  const headers = [
    'fullName',
    'email', 
    'phone',
    'city',
    'propertyType',
    'bhk',
    'purpose',
    'budgetMin',
    'budgetMax',
    'timeline',
    'source',
    'notes',
    'tags',
    'status'
  ];

  const rows = buyers.map(buyer => [
    buyer.fullName || '',
    buyer.email || '',
    buyer.phone || '',
    buyer.city || '',
    buyer.propertyType || '',
    buyer.bhk || '',
    buyer.purpose || '',
    buyer.budgetMin?.toString() || '',
    buyer.budgetMax?.toString() || '',
    buyer.timeline || '',
    buyer.source || '',
    buyer.notes || '',
    Array.isArray(buyer.tags) ? buyer.tags.join(',') : (buyer.tags || ''),
    buyer.status || 'New'
  ]);

  const csvRows = [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );

  return csvRows.join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
