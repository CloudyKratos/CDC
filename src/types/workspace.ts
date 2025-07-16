
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  lastLogin?: string;
  isDemo?: boolean;
  preferences?: {
    darkMode?: boolean;
    colorTheme?: string;
    emailNotifications?: boolean;
    desktopNotifications?: boolean;
  };
  profile?: {
    bio?: string;
    location?: string;
    timeZone?: string;
    website?: string;
  };
  status?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// Add missing types for AccountabilityTimeBomb and TickBombDemo
export type TaskType = 'morning' | 'daily' | 'weekly' | 'meditation' | 'workout' | 'evening' | 'custom';

export type TimeBombSeverity = 'low' | 'medium' | 'high' | 'critical';

// Additional types for authentication and user management
export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}

export interface AuthResult {
  user?: User;
  error?: AuthError;
  session?: any;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  acceptTerms?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface VerificationData {
  email: string;
  token?: string;
}
