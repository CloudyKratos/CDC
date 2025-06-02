import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CDCAdminData {
  email: string;
  name: string;
  isHidden: boolean;
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  moderatorCount: number;
  memberCount: number;
  activeUsers: number;
}

interface PlatformMetrics {
  totalEvents: number;
  activeStages: number;
  totalMessages: number;
  userGrowth: number;
}

class AdminService {
  async createCDCOfficialAccount(): Promise<boolean> {
    try {
      console.log("Setting up CDC Official Team account...");
      
      const cdcEmail = 'cdcofficialeg@gmail.com';
      const cdcPassword = 'CDC2024!SecurePassword';
      
      // First, check if the CDC account already exists by trying to sign in
      const { data: existingSession, error: signInError } = await supabase.auth.signInWithPassword({
        email: cdcEmail,
        password: cdcPassword
      });

      let userId: string;

      if (existingSession?.user) {
        // Account already exists and password is correct
        userId = existingSession.user.id;
        console.log('CDC account already exists with correct credentials:', userId);
        
        // Sign out immediately after verification
        await supabase.auth.signOut();
        
        // Set up the profile and role using our database function
        const { data, error: setupError } = await supabase.rpc('setup_cdc_account', {
          cdc_user_id: userId
        });

        if (setupError) {
          console.error('Error setting up CDC account profile:', setupError);
        }

        toast.success('CDC Official Team account verified and updated');
        return true;
      }

      // Account doesn't exist or has wrong credentials, create it
      console.log('Creating new CDC Official Team account...');
      
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cdcEmail,
        password: cdcPassword,
        options: {
          data: {
            full_name: 'CDC Official Team',
            is_admin: true,
            is_hidden: true,
            account_type: 'system'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating CDC account:', signUpError);
        
        // If user already exists but with different password, we can't fix it easily
        if (signUpError.message.includes('User already registered')) {
          toast.error('CDC account exists but password is incorrect. Please contact system administrator.');
          return false;
        }
        
        toast.error('Failed to create CDC Official Team account');
        return false;
      }

      if (!signUpData.user) {
        console.error('No user returned from signup');
        toast.error('Failed to create CDC account - no user data');
        return false;
      }

      userId = signUpData.user.id;
      console.log('Created new CDC user:', userId);

      // Set up the profile and role using our database function
      const { data, error: setupError } = await supabase.rpc('setup_cdc_account', {
        cdc_user_id: userId
      });

      if (setupError) {
        console.error('Error setting up CDC account profile:', setupError);
        toast.error('CDC account created but failed to set up profile');
        return false;
      }

      console.log('CDC Official Team account setup successfully');
      toast.success('CDC Official Team account created successfully');
      return true;

    } catch (error) {
      console.error('Error in createCDCOfficialAccount:', error);
      toast.error('Failed to setup CDC Official Team account');
      return false;
    }
  }

  async setupCDCAsAdmin(): Promise<boolean> {
    try {
      console.log("Setting up cdcofficialeg@gmail.com as admin account...");
      
      const cdcEmail = 'cdcofficialeg@gmail.com';
      
      // First check if the user exists in the database
      const { data: userAuth, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing users:', authError);
        toast.error('Failed to check for existing user');
        return false;
      }

      const cdcUser = userAuth.users.find(user => user.email === cdcEmail);
      
      if (!cdcUser) {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabase.auth.signUp({
          email: cdcEmail,
          password: 'CDC2024!SecurePassword',
          options: {
            data: {
              full_name: 'CDC Official Team',
              is_admin: true
            }
          }
        });

        if (createError) {
          console.error('Error creating CDC user:', createError);
          toast.error('Failed to create CDC user account');
          return false;
        }

        if (!newUser.user) {
          toast.error('User creation failed');
          return false;
        }

        // Ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', newUser.user.id)
          .single();

        if (!profile) {
          // Create profile
          const { error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
              id: newUser.user.id,
              full_name: 'CDC Official Team',
              username: 'cdc_official'
            });

          if (insertProfileError) {
            console.error('Error creating profile:', insertProfileError);
          }
        }

        // Assign admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: newUser.user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Error assigning admin role:', roleError);
          toast.error('Failed to assign admin role');
          return false;
        }

        toast.success('cdcofficialeg@gmail.com has been created and set up as admin successfully');
        return true;
      }

      // User exists, ensure profile and role are set up correctly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', cdcUser.id)
        .single();

      if (!profile) {
        // Create profile
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: cdcUser.id,
            full_name: 'CDC Official Team',
            username: 'cdc_official'
          });

        if (insertProfileError) {
          console.error('Error creating profile:', insertProfileError);
        }
      }

      // Assign admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: cdcUser.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        toast.error('Failed to assign admin role');
        return false;
      }

      toast.success('cdcofficialeg@gmail.com has been set up as admin successfully');
      return true;

    } catch (error) {
      console.error('Error in setupCDCAsAdmin:', error);
      toast.error('Failed to setup CDC admin account');
      return false;
    }
  }

  async checkCDCAccountExists(): Promise<boolean> {
    try {
      // First check if we can authenticate with the CDC credentials
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email: 'cdcofficialeg@gmail.com',
        password: 'CDC2024!SecurePassword'
      });

      if (session?.user) {
        console.log('CDC account exists and password is correct');
        
        // Sign out immediately after verification
        await supabase.auth.signOut();
        
        // Double-check that the profile and role exist
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', session.user.id)
          .single();

        const { data: role } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        return !!(profile && role);
      }

      return false;
    } catch (error) {
      console.error('Error in checkCDCAccountExists:', error);
      return false;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, user_id');

      if (error) {
        console.error('Error fetching user stats:', error);
        return {
          totalUsers: 0,
          adminCount: 0,
          moderatorCount: 0,
          memberCount: 0,
          activeUsers: 0
        };
      }

      const stats = roles.reduce((acc, curr) => {
        acc.totalUsers++;
        switch (curr.role) {
          case 'admin':
            acc.adminCount++;
            break;
          case 'moderator':
            acc.moderatorCount++;
            break;
          case 'member':
            acc.memberCount++;
            break;
        }
        return acc;
      }, {
        totalUsers: 0,
        adminCount: 0,
        moderatorCount: 0,
        memberCount: 0,
        activeUsers: 0
      });

      // Get active users (users with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUserData } = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      stats.activeUsers = activeUserData?.length || 0;

      return stats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        totalUsers: 0,
        adminCount: 0,
        moderatorCount: 0,
        memberCount: 0,
        activeUsers: 0
      };
    }
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      // Get total events
      const { data: events } = await supabase
        .from('events')
        .select('id');

      // Get active stages
      const { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('status', 'live');

      // Get total messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id');

      // Calculate user growth (new users in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalEvents: events?.length || 0,
        activeStages: stages?.length || 0,
        totalMessages: messages?.length || 0,
        userGrowth: newUsers?.length || 0
      };
    } catch (error) {
      console.error('Error in getPlatformMetrics:', error);
      return {
        totalEvents: 0,
        activeStages: 0,
        totalMessages: 0,
        userGrowth: 0
      };
    }
  }

  async getAllUsersWithRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          assigned_at,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url,
            created_at,
            updated_at
          )
        `);

      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }

      return data.map(item => ({
        id: item.user_id,
        role: item.role,
        assignedAt: item.assigned_at,
        profile: item.profiles
      }));
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }

  async assignUserRole(userId: string, role: 'admin' | 'moderator' | 'member') {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error('Error assigning role:', error);
        toast.error('Failed to assign role');
        return false;
      }

      toast.success(`Role assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error in assignUserRole:', error);
      toast.error('Failed to assign role');
      return false;
    }
  }
}

export default new AdminService();
