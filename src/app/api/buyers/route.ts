import { NextRequest, NextResponse } from 'next/server';
import { createBuyer } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth-server';
import { createBuyerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { withDatabase } from '@/lib/db/build-init';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP();
    const rateLimitKey = `create:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.CREATE_BUYER);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.CREATE_BUYER.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const user = await createDemoUser();
    const body = await request.json();
    
    const validatedData = createBuyerSchema.parse(body);
    const buyer = await withDatabase(() => createBuyer(validatedData, user.id));

    return NextResponse.json(buyer, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.CREATE_BUYER.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('Error creating buyer:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
