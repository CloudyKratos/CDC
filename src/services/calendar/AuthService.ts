
import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async getCurrentUser(): Promise<string> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ AuthService: Error getting current user:', error);
        throw new Error(`Authentication error: ${error.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      return user.id;
    } catch (error) {
      console.error('💥 AuthService: Exception in getCurrentUser:', error);
      throw error;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('💥 AuthService: Exception in isAuthenticated:', error);
      return false;
    }
  }
}
