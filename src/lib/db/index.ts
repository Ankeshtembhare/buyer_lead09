import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Use libsql for both local development and production
const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  // For production, use the connection string from Vercel/Neon
  // For local development, use file:local.db
});

export const db = drizzle(client, { schema });

export * from './schema';
