
import { User } from "@/types/workspace";
import { toast } from "sonner";

// Test users data - enhanced with proper roles and profiles
const TEST_USERS: User[] = [
  { 
    id: '1', 
    email: 'user@example.com', 
    name: 'Standard User', 
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    permissions: ['read', 'comment'],
    lastLogin: new Date().toISOString(),
    profile: {
      bio: "Product enthusiast and UI/UX Designer based in San Francisco.",
      location: "San Francisco, CA",
      timeZone: "PST (UTC-8)",
      website: "example.com"
    },
    preferences: {
      darkMode: false,
      colorTheme: "blue",
      emailNotifications: true,
      desktopNotifications: true
    },
    status: "active"
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    permissions: ['read', 'write', 'delete', 'moderate', 'admin'],
    lastLogin: new Date().toISOString(),
    profile: {
      bio: "Senior Developer and System Administrator with 10+ years of experience.",
      location: "New York, NY",
      timeZone: "EST (UTC-5)",
      website: "adminuser.dev"
    },
    preferences: {
      darkMode: true,
      colorTheme: "purple",
      emailNotifications: true,
      desktopNotifications: true
    },
    status: "active"
  },
  { 
    id: '3', 
    email: 'demo@example.com', 
    name: "Creator's Hub", 
    role: 'demo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    permissions: ['read', 'comment', 'limited_write'],
    isDemo: true,
    lastLogin: new Date().toISOString(),
    profile: {
      bio: "A hub for creators to connect, collaborate and grow together.",
      location: "Global",
      timeZone: "UTC",
      website: "creatorshub.app"
    },
    preferences: {
      darkMode: false,
      colorTheme: "blue",
      emailNotifications: false,
      desktopNotifications: true
    },
    status: "active"
  }
];

class AuthService {
  private readonly STORAGE_KEY = "nexus_user";
  private readonly SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Attempts to login a user with the provided credentials
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      // For demo purposes, we're accepting any password
      const user = TEST_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return null;
      }
      
      // Update last login time
      const authenticatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      
      // Store in localStorage with expiry
      this.setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }
  
  /**
   * Logs out the current user
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Clear any auth-related cookies if applicable
    document.cookie = "nexus_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  
  /**
   * Returns the currently logged in user
   */
  getCurrentUser(): User | null {
    try {
      const userDataString = localStorage.getItem(this.STORAGE_KEY);
      if (!userDataString) return null;
      
      const userData = JSON.parse(userDataString);
      
      // Check if session is expired
      if (userData.expiry && new Date() > new Date(userData.expiry)) {
        this.logout();
        toast.error("Your session has expired. Please log in again.");
        return null;
      }
      
      return userData.user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
  
  /**
   * Stores user data in localStorage with expiry
   */
  private setUser(user: User): void {
    const expiry = new Date(Date.now() + this.SESSION_EXPIRY);
    const data = {
      user,
      expiry: expiry.toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  
  /**
   * Refreshes the user session
   */
  refreshSession(): User | null {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.setUser(currentUser);
      return currentUser;
    }
    return null;
  }
  
  /**
   * Check if a user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }
  
  /**
   * Get remaining session time in minutes
   */
  getSessionTimeRemaining(): number {
    try {
      const userDataString = localStorage.getItem(this.STORAGE_KEY);
      if (!userDataString) return 0;
      
      const userData = JSON.parse(userDataString);
      if (!userData.expiry) return 0;
      
      const expiry = new Date(userData.expiry).getTime();
      const now = Date.now();
      const diff = expiry - now;
      
      // Return minutes remaining
      return Math.max(0, Math.floor(diff / (60 * 1000)));
    } catch (error) {
      return 0;
    }
  }
}

export const authService = new AuthService();
export default authService;
