import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../src/lib/db/schema';

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // Create database connection using libsql
    const client = createClient({
      url: process.env.DATABASE_URL || 'file:./local.db',
    });
    const db = drizzle(client, { schema });

    // Run migrations
    console.log('📋 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });

    // Create demo user
    console.log('👤 Creating demo user...');
    const demoUserId = process.env.DEMO_USER_ID || 'demo-user-1';
    const demoUserEmail = process.env.DEMO_USER_EMAIL || 'demo@example.com';
    
    await db.insert(schema.users).values({
      id: demoUserId,
      email: demoUserEmail,
      name: 'Demo User',
    }).onConflictDoNothing();

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
