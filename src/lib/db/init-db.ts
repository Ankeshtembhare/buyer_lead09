import { db } from './index';
import { users } from './schema';

export async function initializeDatabase() {
  try {
    // Create demo user if it doesn't exist
    const demoUserId = process.env.DEMO_USER_ID || 'demo-user-1';
    const demoUserEmail = process.env.DEMO_USER_EMAIL || 'demo@example.com';
    
    await db.insert(users).values({
      id: demoUserId,
      email: demoUserEmail,
      name: 'Demo User',
    }).onConflictDoNothing();

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Initialize database when this module is imported
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}
