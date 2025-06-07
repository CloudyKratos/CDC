
import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async getCurrentUser(): Promise<string> {
    console.log('🔍 AuthService: Getting current user...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ AuthService: Auth error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    if (!user) {
      console.error('❌ AuthService: No user found');
      throw new Error('No authenticated user found');
    }
    
    console.log('✅ AuthService: User authenticated:', user.id);
    return user.id;
  }
}
