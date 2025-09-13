import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/lib/db/schema';

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // Create database connection
    const sqlite = new Database('./local.db');
    const db = drizzle(sqlite, { schema });

    // Run migrations
    console.log('📋 Running database migrations...');
    migrate(db, { migrationsFolder: './drizzle' });

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
    
    // Close connection
    sqlite.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
