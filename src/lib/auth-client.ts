// Client-side authentication utilities

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Simple client-side auth state management
export function getCurrentUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('current-user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setCurrentUserInStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('current-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('current-user');
  }
}

export function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('current-user');
}
