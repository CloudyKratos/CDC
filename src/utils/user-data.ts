
import { User } from '@supabase/supabase-js';

// Helper functions to safely access user metadata that might be undefined
export function getUserName(user: User | null): string {
  if (!user) return '';
  
  // Try to get name from metadata
  const fullName = user.user_metadata?.full_name || 
                   user.user_metadata?.name ||
                   '';
  
  // If no name found, use email or fallback
  return fullName || user.email || 'User';
}

export function getUserAvatar(user: User | null): string {
  if (!user) return '';
  
  // Try to get avatar from metadata
  return user.user_metadata?.avatar_url || 
         user.user_metadata?.avatar ||
         '';
}

export function getUserPreferences(user: User | null): Record<string, any> {
  if (!user) return {};
  
  // Try to get preferences from metadata
  return user.user_metadata?.preferences || {};
}

// Add custom properties to the User type
declare module '@supabase/supabase-js' {
  interface User {
    name: string; 
    avatar: string;
    preferences: Record<string, any>;
  }
}

// Extension method to enhance User object with custom properties
export function enhanceUser(user: User | null): User | null {
  if (!user) return null;
  
  // Add virtual properties to user object
  Object.defineProperties(user, {
    name: {
      get() { return getUserName(this); },
      enumerable: true
    },
    avatar: {
      get() { return getUserAvatar(this); },
      enumerable: true
    },
    preferences: {
      get() { return getUserPreferences(this); },
      enumerable: true
    }
  });
  
  return user;
}

// Use this in the auth context to enhance the user object
export function enhanceAuthUser(authContext: { user: User | null }): void {
  if (authContext.user) {
    enhanceUser(authContext.user);
  }
}
