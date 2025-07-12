
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthState, User as AppUser } from '@/types/workspace';
import { useAuthState } from './useAuthState';

// Define the shape of our context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<User | null>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  // Add aliases for consistent naming across the app
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<User | null>;
  updateUser: (user: Partial<AppUser>) => Promise<boolean>;
  // Add missing properties that components expect
  isAuthenticated: boolean;
  loading: boolean;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loading: true,
  error: null,
  login: async () => null,
  logout: async () => {},
  signup: async () => null,
  updateProfile: async () => false,
  resetPassword: async () => false,
  updatePassword: async () => false,
  clearError: () => {},
  resendVerificationEmail: async () => false,
  verifyEmail: async () => false,
  // Aliases
  signOut: async () => {},
  signUp: async () => null,
  updateUser: async () => false,
});

// Provider component that wraps app and provides auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  
  // Create the final context value with all required properties
  const contextValue: AuthContextType = {
    ...authState,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.isLoading,
  };
  
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
