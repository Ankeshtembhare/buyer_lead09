import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '../env';

// Use libsql for both local development and production
const client = createClient({
  url: env.DATABASE_URL,
});

export const db = drizzle(client, { schema });

// Add connection error handling
client.sync().catch((error) => {
  console.error('Database connection error:', error);
  // In production, you might want to retry or use a fallback
});

export * from './schema';
