
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '@/types/workspace';
import authService from '@/services/AuthService';
import { toast } from 'sonner';

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
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Initialize authentication state
  const initializeAuth = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = authService.getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      });
    } catch (error) {
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
    } catch (error) {
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
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };
  
  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = { ...authState.user, ...userData };
    
    // Update in state
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
    
    // Update in localStorage
    authService.logout(); // Clear first
    authService.login(updatedUser.email, "password"); // Re-save with updated data
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
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = () => useContext(AuthContext);
