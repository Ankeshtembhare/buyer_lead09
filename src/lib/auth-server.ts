import { cookies } from 'next/headers';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Server-side authentication functions
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return null;
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function createDemoUser(): Promise<User> {
  const demoUser = {
    id: process.env.DEMO_USER_ID || 'demo-user-1',
    email: process.env.DEMO_USER_EMAIL || 'demo@example.com',
    name: 'Demo User',
  };

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, demoUser.id)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values(demoUser);
    }
    
    return demoUser as User;
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}

export async function setUserSession(userId: string) {
  const cookieStore = cookies();
  cookieStore.set('user-id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearUserSession() {
  const cookieStore = cookies();
  cookieStore.delete('user-id');
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
