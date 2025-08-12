import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Secure Authentication Service
 * 
 * SECURITY: All hardcoded credentials have been removed.
 * Authentication now uses Supabase's secure auth system.
 */
class AuthService {
  
  /**
   * Attempts to login a user with the provided credentials
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        toast.success("Successfully logged in");
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred during login");
      return null;
    }
  }
  
  /**
   * Registers a new user
   */
  async signup(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
        return null;
      }

      if (data.user) {
        toast.success("Account created successfully! Please check your email for verification.");
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred during signup");
      return null;
    }
  }
  
  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Error logging out");
        return;
      }

      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred during logout");
    }
  }
  
  /**
   * Returns the currently logged in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error getting current user:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message);
        return false;
      }

      toast.success("Password reset email sent");
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        toast.error(error.message);
        return false;
      }

      toast.success("Password updated successfully");
      return true;
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  }

  /**
   * Check if a user has specific permission (to be used with role service)
   */
  async hasPermission(permission: string): Promise<boolean> {
    // This would integrate with RoleService for actual permission checking
    const user = await this.getCurrentUser();
    return !!user; // Basic check - extend with role-based permissions
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
export default authService;