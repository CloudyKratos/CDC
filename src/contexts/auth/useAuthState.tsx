
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
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              handleUserSession(session);
              toast.success('Successfully signed in!');
            }
            break;
          
          case 'SIGNED_OUT':
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            toast.success('Successfully signed out');
            break;
          
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              handleUserSession(session);
            }
            break;
            
          default:
            // Handle any other auth events including signup
            if (session?.user) {
              console.log('User auth event:', event, 'Email confirmed:', session.user.email_confirmed_at);
              if (session.user.email_confirmed_at) {
                handleUserSession(session);
                toast.success('Account verified and signed in!');
              } else {
                // User needs to verify email
                setAuthState(prev => ({
                  ...prev,
                  isLoading: false,
                  error: null,
                }));
              }
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
      name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '',
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

  // Login function with enhanced error handling
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthenticationService.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      // Enhanced error messages
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('Please verify your email before signing in');
      } else if (errorMessage.includes('Too many sign-in attempts')) {
        toast.error('Too many attempts. Please try again in 15 minutes.');
      } else if (errorMessage.includes('User not found')) {
        toast.error('No account found with this email');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      
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
      toast.error('Failed to sign out');
    }
  };

  // Signup function with enhanced error handling
  const signup = async (email: string, password: string, fullName: string): Promise<User | null> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthenticationService.signUp(email, password, fullName);
      
      if (user && !user.email_confirmed_at) {
        toast.success('Account created!', {
          description: 'Please check your email to verify your account.',
        });
      } else if (user && user.email_confirmed_at) {
        toast.success('Account created and verified!');
      }
      
      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || "Sign up failed";
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      // Enhanced error handling with user-friendly messages
      if (errorMessage.includes('User already registered') || 
          errorMessage.includes('already been registered')) {
        toast.error('Email already in use', {
          description: 'This email is already registered. Try signing in instead.'
        });
      } else if (errorMessage.includes('Password should be at least') ||
                 errorMessage.includes('Password must be at least')) {
        toast.error('Password too weak', {
          description: 'Password must be at least 6 characters long.'
        });
      } else if (errorMessage.includes('Unable to validate email address') ||
                 errorMessage.includes('valid email address')) {
        toast.error('Invalid email address', {
          description: 'Please enter a valid email address.'
        });
      } else if (errorMessage.includes('Too many sign-up attempts')) {
        toast.error('Too many attempts', {
          description: 'Please try again in 15 minutes.'
        });
      } else if (errorMessage.includes('Signup is disabled')) {
        toast.error('Sign up currently disabled', {
          description: 'Please contact support for assistance.'
        });
      } else {
        toast.error('Sign up failed', {
          description: errorMessage
        });
      }
      
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

  // Reset password with enhanced error handling
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await AuthenticationService.resetPassword(email);
      
      if (result) {
        toast.success('Password reset email sent!', {
          description: 'Please check your inbox and spam folder.'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      if (errorMessage.includes('Too many')) {
        toast.error('Too many attempts', {
          description: 'Please try again in 15 minutes.'
        });
      } else {
        toast.error('Failed to send reset email');
      }
      
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await AuthenticationService.updatePassword(newPassword);
      
      if (result) {
        toast.success('Password updated successfully!');
      }
      
      return result;
    } catch (error) {
      console.error('Password update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      if (errorMessage.includes('at least 6 characters')) {
        toast.error('Password too short', {
          description: 'Password must be at least 6 characters long.'
        });
      } else {
        toast.error('Failed to update password');
      }
      
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await AuthenticationService.resendVerificationEmail(email);
      
      if (result) {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox and spam folder.'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      if (errorMessage.includes('Too many')) {
        toast.error('Too many attempts', {
          description: 'Please try again in 15 minutes.'
        });
      } else {
        toast.error('Failed to resend verification email');
      }
      
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Verify email
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await AuthenticationService.verifyEmail(token);
      
      if (result) {
        toast.success('Email verified successfully!');
      }
      
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to verify email',
      }));
      
      toast.error('Failed to verify email', {
        description: 'The verification link may be expired or invalid.'
      });
      
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<AppUser>): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (userData.name || userData.avatar) {
        const result = await AuthenticationService.updateUserProfile({
          name: userData.name,
          avatar_url: userData.avatar
        });
        
        if (!result) return false;
      }
      
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

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const signUp = signup;
  const signOut = logout;

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
    signUp,
    signOut,
    updateUser
  };
};
