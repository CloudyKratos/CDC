
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthenticationService from "@/services/AuthenticationService";
import { toast } from "sonner";
import { enhanceUser } from "@/utils/user-data";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  updateUser: (userData: any) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession) => {
        console.log("Auth state change event:", event);
        setSession(newSession);
        // Enhance the user object with our custom properties
        setUser(enhanceUser(newSession?.user ?? null));
        setIsAuthenticated(!!newSession);
        
        // Handle various authentication events with toast notifications
        switch (event) {
          case 'SIGNED_IN':
            toast.success("Successfully signed in!");
            break;
          case 'SIGNED_OUT':
            toast.success("Signed out successfully");
            break;
          case 'USER_UPDATED':
            toast.success("User profile updated");
            break;
          case 'PASSWORD_RECOVERY':
            toast.info("Password recovery initiated");
            break;
          case 'TOKEN_REFRESHED':
            console.log("Auth token refreshed");
            break;
          case 'USER_DELETED':
            toast.info("User account deleted");
            break;
        }
      }
    );

    // THEN check for existing session
    const initialSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await AuthenticationService.getCurrentSession();
        setSession(data.session);
        // Enhance the user object with our custom properties
        setUser(enhanceUser(data.session?.user ?? null));
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Clear error helper
  const clearError = () => setError(null);

  // Login method (alias for signIn for backward compatibility)
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    try {
      console.log("Attempting login with:", email);
      const user = await AuthenticationService.signIn(email, password);
      console.log("Login response:", user);
      return !!user;
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message || "Failed to sign in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Existing signIn method kept for API consistency
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();
    try {
      const user = await AuthenticationService.signIn(email, password);
      if (!user) {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message || "Failed to sign in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<User | null> => {
    setIsLoading(true);
    clearError();
    try {
      console.log("Sign up params:", { email, fullName });
      const user = await AuthenticationService.signUp(email, password, fullName);
      console.log("Sign up response:", user);
      return user;
    } catch (error: any) {
      console.error("Error signing up:", error);
      setError(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method (alias for signOut for backward compatibility)
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    clearError();
    try {
      await AuthenticationService.signOut();
      // State will be updated by onAuthStateChange
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError(error.message || "Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    clearError();
    try {
      await AuthenticationService.signOut();
      // State will be updated by onAuthStateChange
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError(error.message || "Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    clearError();
    try {
      const result = await AuthenticationService.resetPassword(email);
      if (result) {
        toast.success("Password reset instructions sent to your email");
      } else {
        toast.error("Failed to send reset instructions");
      }
      return result;
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to send reset instructions");
      return false;
    }
  };

  const updatePassword = async (newPassword: string) => {
    clearError();
    try {
      const result = await AuthenticationService.updatePassword(newPassword);
      if (result) {
        toast.success("Password updated successfully");
      } else {
        toast.error("Failed to update password");
      }
      return result;
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError(error.message || "Failed to update password");
      return false;
    }
  };

  // Add user profile update function
  const updateUser = async (userData: any): Promise<boolean> => {
    clearError();
    try {
      const result = await AuthenticationService.updateUserProfile(userData);
      if (result) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
      return result;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      setError(error.message || "Failed to update profile");
      return false;
    }
  };

  // Add email verification method
  const verifyEmail = async (token: string): Promise<boolean> => {
    clearError();
    try {
      const result = await AuthenticationService.verifyEmail(token);
      if (result) {
        toast.success("Email verified successfully! You can now log in.");
      } else {
        toast.error("Failed to verify email. Please try again or request a new verification email.");
      }
      return result;
    } catch (error: any) {
      console.error("Error verifying email:", error);
      setError(error.message || "Failed to verify email");
      return false;
    }
  };

  // Add resend verification email method
  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    clearError();
    try {
      const result = await AuthenticationService.resendVerificationEmail(email);
      if (result) {
        toast.success("Verification email has been resent. Please check your inbox.");
      } else {
        toast.error("Failed to resend verification email. Please try again later.");
      }
      return result;
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      setError(error.message || "Failed to resend verification email");
      return false;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    login,
    logout,
    error,
    clearError,
    updateUser,
    verifyEmail,
    resendVerificationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
