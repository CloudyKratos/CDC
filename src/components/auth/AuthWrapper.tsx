
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DatabaseConnectionCheck from '@/components/database/DatabaseConnectionCheck';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this feature.</p>
          <DatabaseConnectionCheck />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
