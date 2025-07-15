
import { supabase } from "@/integrations/supabase/client";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

class AuthenticationService {
  // Sign in user
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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

  // Sign up user
  async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

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

  // Reset password
  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

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

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

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
}

export default new AuthenticationService();
