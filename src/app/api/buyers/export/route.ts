import { NextRequest, NextResponse } from 'next/server';
import { getAllBuyersForExport } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth-server';
import { searchFiltersSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const user = await createDemoUser();
    const { searchParams } = new URL(request.url);

    // Helper function to convert empty strings to undefined
    const getParam = (key: string) => {
      const value = searchParams.get(key);
      return value && value !== 'undefined' && value !== '' ? value : undefined;
    };

    const filters = searchFiltersSchema.parse({
      search: getParam('search'),
      city: getParam('city'),
      propertyType: getParam('propertyType'),
      status: getParam('status'),
      timeline: getParam('timeline'),
      sortBy: getParam('sortBy') || 'updatedAt',
      sortOrder: getParam('sortOrder') || 'desc',
    });

    const buyers = await getAllBuyersForExport(filters, user.id);

    return NextResponse.json(buyers);
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
