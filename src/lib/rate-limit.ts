// Simple in-memory rate limiting for demo purposes
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export function checkRateLimit(
  key: string, 
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    rateLimitStore.delete(key);
  }

  const currentEntry = rateLimitStore.get(key);

  if (!currentEntry) {
    // First request in window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (currentEntry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    };
  }

  // Increment counter
  currentEntry.count++;
  rateLimitStore.set(key, currentEntry);

  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime,
  };
}

export function getClientIP(request: Request): string {
  // In production, you'd get this from headers like X-Forwarded-For
  // For demo purposes, we'll use a simple identifier
  return 'demo-client';
}

// Rate limit configurations
export const RATE_LIMITS = {
  CREATE_BUYER: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests per minute (increased for CSV import)
  UPDATE_BUYER: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
  CSV_IMPORT: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 imports per minute
} as const;
