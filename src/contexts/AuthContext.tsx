
// This file now serves as a clean re-export from the main auth context
// All components should import from this file for consistency
export { AuthProvider, useAuth } from './auth/AuthContext';
export type { AuthState, User } from '@/types/workspace';
