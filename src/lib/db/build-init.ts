// Build-time database initialization for Vercel
import { db } from './index';
import { initializeDatabase } from './init-db';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;
  
  try {
    await initializeDatabase();
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Don't throw error during build, just log it
  }
}

// Initialize database on first API call
export async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  await ensureDatabaseInitialized();
  return operation();
}
