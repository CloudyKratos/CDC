
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

class AuthenticationService {
  async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('Error during signup:', error);
        throw error;
      }
      
      return data.user;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error during signin:', error);
        throw error;
      }
      
      return data.user;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signout:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password?token=true'
      });
      
      if (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
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

  // Add method to update user metadata
  async updateUserProfile(userData: { name?: string, avatar_url?: string }): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }
}

export default new AuthenticationService();
