// Environment variable validation and defaults
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'file:local.db',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'demo-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEMO_USER_ID: process.env.DEMO_USER_ID || 'demo-user-1',
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL || 'demo@example.com',
} as const;

// Validate required environment variables in production
if (env.NODE_ENV === 'production') {
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('Using fallback values. This may cause issues in production.');
  }
}
