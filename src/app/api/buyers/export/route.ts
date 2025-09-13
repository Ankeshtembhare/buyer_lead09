import { NextRequest, NextResponse } from 'next/server';
import { getAllBuyersForExport } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth';
import { searchFiltersSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const user = await createDemoUser();
    const { searchParams } = new URL(request.url);

    const filters = searchFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const buyers = await getAllBuyersForExport(filters, user.id);

    return NextResponse.json(buyers);
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
