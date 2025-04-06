
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '@/types/workspace';
import authService from '@/services/AuthService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshSession: () => void;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
  signOut: () => Promise<void>; // Add signOut method for Sidebar compatibility
}

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
  refreshSession: () => {},
  hasPermission: () => false,
  clearError: () => {},
  signOut: async () => {}, // Default implementation
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  
  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
    
    // Set up session refresh interval
    const refreshInterval = setInterval(() => {
      const sessionTimeRemaining = authService.getSessionTimeRemaining();
      
      // If less than 5 minutes left, show warning
      if (sessionTimeRemaining > 0 && sessionTimeRemaining <= 5) {
        toast.warning("Your session will expire soon", {
          description: "You'll be logged out in a few minutes",
          action: {
            label: "Extend",
            onClick: () => refreshSession(),
          },
        });
      }
    }, 60000); // Check every minute
    
    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.full_name || 'User',
            role: session.user.user_metadata.role || 'user',
            avatar: session.user.user_metadata.avatar_url,
            permissions: ['read', 'comment'],
            lastLogin: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    });
    
    return () => {
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, []);
  
  // Initialize authentication state
  const initializeAuth = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.full_name || 'User',
            role: session.user.user_metadata.role || 'user',
            avatar: session.user.user_metadata.avatar_url,
            permissions: ['read', 'comment'],
            lastLogin: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        const localUser = authService.getCurrentUser();
        
        setAuthState({
          user: localUser,
          isAuthenticated: !!localUser,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to restore authentication state"
      });
    }
  };
  
  // Login handler
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Fall back to demo auth if Supabase fails
        const user = await authService.login(email, password);
        
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return true;
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: "Invalid email or password"
          }));
          return false;
        }
      }
      
      if (data?.user) {
        // Supabase login successful
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata.full_name || 'User',
            role: data.user.user_metadata.role || 'user',
            avatar: data.user.user_metadata.avatar_url,
            permissions: ['read', 'comment'],
            lastLogin: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "An error occurred during login"
      }));
      return false;
    }
  };
  
  // Logout handler
  const logout = () => {
    // Log out from Supabase
    supabase.auth.signOut();
    
    // Also clear local auth
    authService.logout();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  // Additional signOut method for compatibility with existing code
  const signOut = async () => {
    logout();
  };
  
  // Update user data
  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = { ...authState.user, ...userData };
    
    try {
      // Update Supabase user metadata if we're using Supabase auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        await supabase.auth.updateUser({
          data: {
            full_name: updatedUser.name,
            avatar_url: updatedUser.avatar,
            role: updatedUser.role
          }
        });
        
        // Update profile in database if available
        const { error } = await supabase.from('profiles').upsert({
          id: updatedUser.id,
          full_name: updatedUser.name,
          avatar_url: updatedUser.avatar,
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.error("Error updating profile:", error);
        }
      }
      
      // Update in state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      // Update in localStorage for backup
      authService.logout(); // Clear first
      authService.login(updatedUser.email, "password"); // Re-save with updated data
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update profile");
    }
  };
  
  // Refresh user session
  const refreshSession = () => {
    const refreshedUser = authService.refreshSession();
    
    if (refreshedUser) {
      setAuthState(prev => ({
        ...prev,
        user: refreshedUser
      }));
      
      toast.success("Session extended", {
        description: "Your session has been extended"
      });
    }
  };
  
  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };
  
  // Clear any authentication errors
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };
  
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        refreshSession,
        hasPermission,
        clearError,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = () => useContext(AuthContext);
