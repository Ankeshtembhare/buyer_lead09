import { CsvImportExport } from '@/components/csv/csv-import-export';

export default function ImportExportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import & Export</h1>
        <p className="mt-2 text-gray-600">
          Import leads from CSV files or export your current filtered list
        </p>
      </div>

      <CsvImportExport />
    </div>
  );
}
