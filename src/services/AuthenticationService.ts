
import { supabase } from "@/integrations/supabase/client";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

class AuthenticationService {
  // Sign in user with rate limiting
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      // Check rate limiting first
      const canAttempt = await this.checkRateLimit(email, 'signin');
      if (!canAttempt) {
        throw new Error('Too many sign-in attempts. Please try again in 15 minutes.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Log the attempt
      await this.logAuthAttempt(email, 'signin', !error);

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      return data.user;
    } catch (error) {
      console.error('Authentication service sign in error:', error);
      throw error;
    }
  }

  // Sign up user with enhanced email redirect
  async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      // Check rate limiting first
      const canAttempt = await this.checkRateLimit(email, 'signup');
      if (!canAttempt) {
        throw new Error('Too many sign-up attempts. Please try again in 15 minutes.');
      }

      // Enhanced email validation
      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const redirectUrl = `${window.location.origin}/verify-email`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      // Log the attempt
      await this.logAuthAttempt(email, 'signup', !error);

      if (error) {
        console.error('Sign up error:', error);
        throw error;
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

  // Reset password with rate limiting
  async resetPassword(email: string): Promise<boolean> {
    try {
      // Check rate limiting first
      const canAttempt = await this.checkRateLimit(email, 'reset');
      if (!canAttempt) {
        throw new Error('Too many password reset attempts. Please try again in 15 minutes.');
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      // Log the attempt
      await this.logAuthAttempt(email, 'reset', !error);

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
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

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

  // Resend verification email with rate limiting
  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      // Check rate limiting first
      const canAttempt = await this.checkRateLimit(email, 'resend');
      if (!canAttempt) {
        throw new Error('Too many resend attempts. Please try again in 15 minutes.');
      }

      const redirectUrl = `${window.location.origin}/verify-email`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      // Log the attempt
      await this.logAuthAttempt(email, 'resend', !error);

      if (error) {
        console.error('Resend verification error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication service resend verification error:', error);
      return false;
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

  // Enhanced email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'protonmail.com', 'company.com'
    ];
    
    if (!emailRegex.test(email)) {
      return false;
    }

    // Basic domain validation (you can expand this)
    const domain = email.split('@')[1];
    return domain.length > 2 && domain.includes('.');
  }

  // Rate limiting check
  private async checkRateLimit(email: string, attemptType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_auth_rate_limit', {
        p_email: email,
        p_attempt_type: attemptType,
        p_limit: 5,
        p_window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to not block users
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to not block users
    }
  }

  // Log authentication attempts
  private async logAuthAttempt(email: string, attemptType: string, success: boolean): Promise<void> {
    try {
      await supabase.rpc('log_auth_attempt', {
        p_email: email,
        p_attempt_type: attemptType,
        p_success: success,
        p_ip_address: null, // Could be enhanced to get real IP
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging auth attempt:', error);
      // Don't throw here to not break the main flow
    }
  }
}

export default new AuthenticationService();
