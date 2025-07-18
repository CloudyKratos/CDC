
import { supabase } from "@/integrations/supabase/client";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

class AuthenticationService {
  // Sign in user
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful for user:', data.user?.id);
      return data.user;
    } catch (error) {
      console.error('Authentication service sign in error:', error);
      throw error;
    }
  }

  // Enhanced sign up with better error handling and diagnostics
  async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      // Get the current origin for redirect URL
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${currentOrigin}/verify-email`;
      
      console.log('Starting signup process...');
      console.log('Email:', email);
      console.log('Full name:', fullName);
      console.log('Redirect URL:', redirectUrl);
      console.log('Current origin:', currentOrigin);
      
      // Validate inputs before making the request
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Please enter your full name (at least 2 characters)');
      }

      const signUpPayload = {
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: redirectUrl
        },
      };

      console.log('Sending signup request to Supabase...', {
        email: signUpPayload.email,
        redirectTo: redirectUrl,
        userData: signUpPayload.options.data
      });
      
      const { data, error } = await supabase.auth.signUp(signUpPayload);

      if (error) {
        console.error('Supabase sign up error:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Enhanced error handling with specific user-friendly messages
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (error.message.includes('signup is disabled')) {
          throw new Error('Account registration is currently disabled. Please contact support.');
        } else if (error.message.includes('email rate limit')) {
          throw new Error('Too many signup attempts. Please wait a few minutes before trying again.');
        } else if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('config')) {
          throw new Error('Email service is temporarily unavailable. Please try again in a few minutes or contact support.');
        } else {
          // Log the raw error for debugging
          console.error('Unhandled signup error:', error);
          throw new Error(`Signup failed: ${error.message}`);
        }
      }

      console.log('Signup response received:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          createdAt: data.user.created_at
        } : null,
        session: data.session ? 'Session created' : 'No session'
      });

      if (data.user) {
        console.log('User created successfully:', {
          id: data.user.id,
          email: data.user.email,
          emailConfirmationRequired: !data.user.email_confirmed_at
        });
        
        if (!data.user.email_confirmed_at) {
          console.log('Email confirmation required - user should check their email');
        }
      }

      return data.user;
    } catch (error) {
      console.error('Authentication service sign up error:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Authentication service sign out error:', error);
      throw error;
    }
  }

  // Get current session
  async getCurrentSession(): Promise<{ data: { session: Session | null } }> {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ data: { user: User | null } }> {
    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(updates: { name?: string; avatar_url?: string }): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          avatar_url: updates.avatar_url,
        },
      });

      if (error) {
        console.error('Update profile error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication service update profile error:', error);
      return false;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<boolean> {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Reset password error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication service reset password error:', error);
      return false;
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication service update password error:', error);
      return false;
    }
  }

  // Enhanced resend verification email with better error handling
  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      const redirectUrl = `${window.location.origin}/verify-email`;
      
      console.log('Resending verification email to:', email);
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        
        if (error.message.includes('rate limit')) {
          throw new Error('Please wait a few minutes before requesting another verification email.');
        } else if (error.message.includes('not found')) {
          throw new Error('No account found with this email address. Please sign up first.');
        } else {
          throw new Error(`Failed to resend verification email: ${error.message}`);
        }
      }

      console.log('Verification email resent successfully');
      return true;
    } catch (error) {
      console.error('Authentication service resend verification error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to resend verification email');
    }
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        console.error('Verify email error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication service verify email error:', error);
      return false;
    }
  }

  // Subscribe to auth changes
  subscribeToAuthChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // New method to check Supabase configuration health
  async checkConfigurationHealth(): Promise<{ isHealthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test basic connectivity
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        issues.push(`Supabase connection error: ${error.message}`);
      }
      
      // Check if we can make auth requests
      const testSignUp = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });
      
      if (testSignUp.error && !testSignUp.error.message.includes('User already registered')) {
        issues.push(`Auth configuration issue: ${testSignUp.error.message}`);
      }
      
      return {
        isHealthy: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isHealthy: false,
        issues
      };
    }
  }
}

export default new AuthenticationService();
