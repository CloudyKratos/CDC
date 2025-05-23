
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

class AuthenticationService {
  async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      console.log("Attempting to sign up user:", { email, fullName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });

      if (error) {
        console.error('Error during signup:', error);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      // If we have a user but no session, it means email confirmation is required
      if (data.user && !data.session) {
        console.log("Email confirmation required for:", email);
      }
      
      return data.user;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      console.log("Attempting to sign in user:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error during signin:', error);
        throw error;
      }
      
      console.log("Sign in successful for:", email);
      return data.user;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log("Attempting to sign out user");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signout:', error);
        throw error;
      }
      
      console.log("Sign out successful");
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      console.log("Attempting password reset for:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }
      
      console.log("Password reset email sent to:", email);
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      console.log("Attempting to update password");
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      console.log("Password update successful");
      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return false;
    }
  }

  async getCurrentSession() {
    return await supabase.auth.getSession();
  }

  async getCurrentUser() {
    return await supabase.auth.getUser();
  }

  subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  async updateUserProfile(userData: { name?: string, avatar_url?: string }): Promise<boolean> {
    try {
      console.log("Attempting to update user profile:", userData);
      
      const { error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
      
      console.log("User profile update successful");
      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      console.log("Attempting to resend verification email to:", email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });
      
      if (error) {
        console.error('Error resending verification email:', error);
        return false;
      }
      
      console.log("Verification email resent to:", email);
      return true;
    } catch (error) {
      console.error('Error in resendVerificationEmail:', error);
      return false;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      console.log("Attempting to verify email with token");
      
      // For Supabase email verification via OTP
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      
      if (error) {
        console.error('Error verifying email:', error);
        return false;
      }
      
      console.log("Email verification successful");
      return true;
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      return false;
    }
  }

  // New method to check if email is confirmed
  async checkEmailConfirmation(email: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at !== null;
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      return false;
    }
  }
}

export default new AuthenticationService();
