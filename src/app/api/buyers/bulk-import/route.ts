import { NextRequest, NextResponse } from 'next/server';
import { createBuyer } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth-server';
import { createBuyerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit for bulk import
    const clientIP = getClientIP(request);
    const rateLimitKey = `bulk-import:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.CSV_IMPORT);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.CSV_IMPORT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const user = await createDemoUser();
    const body = await request.json();
    
    // Expect an array of buyer data
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected an array of buyer data' }, { status: 400 });
    }

    const results = {
      successful: [] as any[],
      failed: [] as { data: any; error: string }[],
      duplicates: [] as { data: any; existingBuyer: any }[],
    };

    // Process each buyer
    for (const buyerData of body) {
      try {
        const validatedData = createBuyerSchema.parse(buyerData);
        const buyer = await createBuyer(validatedData, user.id);
        results.successful.push(buyer);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a duplicate error
        if (errorMessage.includes('Duplicate buyer found')) {
          // Extract existing buyer info from error message
          const existingBuyer = {
            fullName: buyerData.fullName,
            phone: buyerData.phone,
            email: buyerData.email,
          };
          results.duplicates.push({
            data: buyerData,
            existingBuyer,
          });
        } else {
          results.failed.push({
            data: buyerData,
            error: errorMessage,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.successful.length,
      failed: results.failed.length,
      duplicates: results.duplicates.length,
      results,
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.CSV_IMPORT.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
