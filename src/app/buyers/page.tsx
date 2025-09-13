import { Suspense } from 'react';
import { BuyersList } from '@/components/buyers/buyers-list';
import { createDemoUser } from '@/lib/auth-server';
import { searchBuyers } from '@/lib/buyers';
import { searchFiltersSchema } from '@/lib/validations';

interface SearchParams {
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface BuyersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const user = await createDemoUser();

  // Await searchParams as required by Next.js 15
  const params = await searchParams;

  // Parse and validate search parameters
  const filters = searchFiltersSchema.parse({
    search: params.search,
    city: params.city,
    propertyType: params.propertyType,
    status: params.status,
    timeline: params.timeline,
    page: params.page ? parseInt(params.page, 10) : 1,
    sortBy: params.sortBy || 'updatedAt',
    sortOrder: params.sortOrder || 'desc',
  });

  const buyersData = await searchBuyers(filters, user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
        <p className="mt-2 text-gray-600">
          Manage and track all your buyer leads
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <BuyersList initialData={buyersData} />
      </Suspense>
    </div>
  );
}
