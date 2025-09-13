import { NextRequest, NextResponse } from 'next/server';
import { getBuyerById, updateBuyer, deleteBuyer } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth-server';
import { updateBuyerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await createDemoUser();
    const { id } = await params;
    const buyer = await getBuyerById(id, user.id);

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitKey = `update:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.UPDATE_BUYER);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.UPDATE_BUYER.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const user = await createDemoUser();
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateBuyerSchema.parse(body);
    const updatedBuyer = await updateBuyer(id, validatedData, user.id);

    if (!updatedBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBuyer, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.UPDATE_BUYER.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('Error updating buyer:', error);
    
    if (error instanceof Error && error.message.includes('Record has been modified')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await createDemoUser();
    const { id } = await params;
    const success = await deleteBuyer(id, user.id);

    if (!success) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
