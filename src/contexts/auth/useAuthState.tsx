import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthState, User as AppUser } from '@/types/workspace';
import AuthenticationService from '@/services/AuthenticationService';

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = AuthenticationService.subscribeToAuthChanges(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              handleUserSession(session);
            }
            break;
          
          case 'SIGNED_OUT':
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            break;
          
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              handleUserSession(session);
            }
            break;
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await AuthenticationService.getCurrentSession();
        
        if (session) {
          handleUserSession(session);
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to handle user session
  const handleUserSession = (session: Session) => {
    const userProfile: AppUser = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata.full_name || '',
      role: 'user',
      permissions: [],
      avatar: session.user.user_metadata.avatar_url,
    };

    setAuthState({
      user: userProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  };

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthenticationService.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to login',
      }));
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await AuthenticationService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      }));
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string): Promise<User | null> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthenticationService.signUp(email, password, fullName);
      
      if (user && !user.email_confirmed_at) {
        toast.success('Signup successful!', {
          description: 'Please check your email to verify your account.',
        });
      }
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to signup',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update user profile
  const updateProfile = async (userData: { name?: string; avatar_url?: string }): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await AuthenticationService.updateUserProfile(userData);
      
      if (result) {
        // Update local user state with new profile data
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            name: userData.name || prev.user.name,
            avatar: userData.avatar_url || prev.user.avatar,
          } : null,
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Reset password (send reset email)
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      return await AuthenticationService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      }));
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update password (after reset)
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      return await AuthenticationService.updatePassword(newPassword);
    } catch (error) {
      console.error('Password update error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update password',
      }));
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      return await AuthenticationService.resendVerificationEmail(email);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification email',
      }));
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Verify email
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      return await AuthenticationService.verifyEmail(token);
    } catch (error) {
      console.error('Email verification error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to verify email',
      }));
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Add a updateUser function to match what's used in the components
  const updateUser = async (userData: Partial<AppUser>): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Update the auth profile if name or avatar is changing
      if (userData.name || userData.avatar) {
        const result = await AuthenticationService.updateUserProfile({
          name: userData.name,
          avatar_url: userData.avatar
        });
        
        if (!result) return false;
      }
      
      // Update local user state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...userData } : null,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('User update error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      }));
      return false;
    }
  };

  // Clear error state
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Provide aliases for consistent naming
  const signUp = signup;
  const signOut = logout;

  // Return the auth state and functions
  return {
    ...authState,
    login,
    logout,
    signup,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
    resendVerificationEmail,
    verifyEmail,
    // Aliases
    signUp,
    signOut,
    updateUser
  };
};
