
import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async getCurrentUser(): Promise<string> {
    console.log('🔍 AuthService: Getting current user...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ AuthService: User auth error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!userData.user) {
      console.error('❌ AuthService: No user found');
      throw new Error('User not authenticated');
    }
    
    console.log('✅ AuthService: User authenticated:', userData.user.id);
    return userData.user.id;
  }
}
