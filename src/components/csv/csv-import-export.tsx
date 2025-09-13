'use client';

import { useState, useRef } from 'react';
import { parseCsvContent, validateCsvRows, convertCsvRowsToBuyers, generateCsvContent, downloadCsv, type CsvImportResult } from '@/lib/csv';
import { createBuyer } from '@/lib/buyers';
import { CloudArrowUpIcon, CloudArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CsvImportExportProps {
  onImportComplete?: () => void;
  onExport?: () => void;
}

export function CsvImportExport({ onImportComplete, onExport }: CsvImportExportProps) {
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const rows = parseCsvContent(content);
      
      // Validate rows
      const validation = validateCsvRows(rows);
      
      if (!validation.success) {
        setImportResult(validation);
        setIsImporting(false);
        return;
      }

      // Convert to buyer objects
      const buyers = convertCsvRowsToBuyers(rows);

      // Import all buyers via bulk API
      try {
        const response = await fetch('/api/buyers/bulk-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyers),
        });

        if (response.ok) {
          const result = await response.json();
          const errors: Array<{ row: number; message: string }> = [];
          
          if (result.failed > 0) {
            errors.push({ row: 0, message: `${result.failed} records failed to import` });
          }
          
          if (result.duplicates > 0) {
            errors.push({ row: 0, message: `${result.duplicates} duplicate records skipped` });
          }
          
          setImportResult({
            success: true,
            imported: result.imported,
            duplicates: result.duplicates || 0,
            errors,
          });
        } else {
          const errorData = await response.json();
          setImportResult({
            success: false,
            imported: 0,
            duplicates: 0,
            errors: [{ row: 0, message: errorData.error || 'Import failed' }],
          });
        }
      } catch (error) {
        console.error('Error importing buyers:', error);
        setImportResult({
          success: false,
          imported: 0,
          duplicates: 0,
          errors: [{ row: 0, message: 'Network error during import' }],
        });
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      setImportResult({
        success: false,
        imported: 0,
        duplicates: 0,
        errors: [{ row: 0, message: 'Failed to process CSV file' }],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Get current filters from URL
      const params = new URLSearchParams(window.location.search);
      
      // Helper function to convert empty strings to undefined
      const getParam = (key: string) => {
        const value = params.get(key);
        return value && value !== 'undefined' && value !== '' ? value : undefined;
      };
      
      const filters: Record<string, string> = {};
      
      const search = getParam('search');
      const city = getParam('city');
      const propertyType = getParam('propertyType');
      const status = getParam('status');
      const timeline = getParam('timeline');
      
      if (search) filters.search = search;
      if (city) filters.city = city;
      if (propertyType) filters.propertyType = propertyType;
      if (status) filters.status = status;
      if (timeline) filters.timeline = timeline;

      // Fetch buyers with current filters
      const response = await fetch(`/api/buyers/export?${new URLSearchParams(filters).toString()}`);
      const buyers = await response.json();

      // Generate CSV content
      const csvContent = generateCsvContent(buyers);
      
      // Download CSV
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCsv(csvContent, `buyer-leads-${timestamp}.csv`);

      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const clearImportResult = () => {
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CloudArrowUpIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Import Leads</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="text-sm text-gray-500">
              <p className="font-medium mb-1">CSV Format:</p>
              <p>Headers: fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, notes, tags, status</p>
              <p className="mt-1">Max 200 rows per import</p>
            </div>

            {isImporting && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Processing CSV...
              </div>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CloudArrowDownIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Export Leads</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export your current filtered list of leads as a CSV file.
            </p>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
            <button
              onClick={clearImportResult}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>

          {importResult.success ? (
            <div className="text-green-600">
              <p className="font-medium">Import successful!</p>
              <p className="text-sm">{importResult.imported} leads imported successfully.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Import failed with {importResult.errors.length} errors</span>
              </div>

              {importResult.imported > 0 && (
                <p className="text-sm text-green-600">
                  {importResult.imported} rows were imported successfully before encountering errors.
                </p>
              )}

              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Row
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResult.errors.slice(0, 20).map((error, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {error.row}
                        </td>
                        <td className="px-3 py-2 text-sm text-red-600">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {importResult.errors.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 20 errors. Total errors: {importResult.errors.length}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
