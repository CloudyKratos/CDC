
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User as WorkspaceUser } from '@/types/workspace';

// Helper functions to safely access user metadata that might be undefined
export function getUserName(user: SupabaseUser | WorkspaceUser | null): string {
  if (!user) return '';
  
  // Handle WorkspaceUser type (has name property)
  if ('name' in user && user.name) {
    return user.name;
  }
  
  // Handle SupabaseUser type (has user_metadata)
  if ('user_metadata' in user) {
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     '';
    
    // If no name found, use email or fallback
    return fullName || (user.email ? user.email.split('@')[0] : 'User');
  }
  
  // Fallback for any user type with email
  if ('email' in user && user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
}

export function getUserAvatar(user: SupabaseUser | WorkspaceUser | null): string {
  if (!user) return '';
  
  // Handle WorkspaceUser type (has avatar property)
  if ('avatar' in user && user.avatar) {
    return user.avatar;
  }
  
  // Handle SupabaseUser type (has user_metadata)
  if ('user_metadata' in user) {
    return user.user_metadata?.avatar_url || 
           user.user_metadata?.avatar ||
           '';
  }
  
  return '';
}

export function getUserEmail(user: SupabaseUser | WorkspaceUser | null): string {
  return user?.email || '';
}

export function getUserPreferences(user: SupabaseUser | WorkspaceUser | null): Record<string, any> {
  if (!user) return {};
  
  // Handle WorkspaceUser type (has preferences property)
  if ('preferences' in user && user.preferences) {
    return user.preferences;
  }
  
  // Handle SupabaseUser type (has user_metadata)
  if ('user_metadata' in user) {
    return user.user_metadata?.preferences || {};
  }
  
  return {};
}

// Add custom properties to the SupabaseUser type
declare module '@supabase/supabase-js' {
  interface User {
    name: string; 
    avatar: string;
    preferences: Record<string, any>;
  }
}

// Extension method to enhance SupabaseUser object with custom properties
export function enhanceUser(user: SupabaseUser | null): SupabaseUser | null {
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
export function enhanceAuthUser(authContext: { user: SupabaseUser | null }): void {
  if (authContext.user) {
    enhanceUser(authContext.user);
  }
}
