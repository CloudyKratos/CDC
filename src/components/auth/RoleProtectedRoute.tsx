
import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/services/RoleService';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  requireCDCAdmin?: boolean;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles = [],
  fallback,
  requireCDCAdmin = false
}) => {
  const { user } = useAuth();
  const { currentRole, isCDCAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if CDC admin access is required
  if (requireCDCAdmin && !isCDCAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-64 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">CDC Admin Access Required</CardTitle>
            <CardDescription>
              This area is restricted to the CDC Admin (cdcofficialeg@gmail.com) only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-600">
              <p>Your email: <span className="font-medium">{user?.email || 'Unknown'}</span></p>
              <p>Required: <span className="font-medium">cdcofficialeg@gmail.com</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Standard role check
  const hasAccess = currentRole === requiredRole || allowedRoles.includes(currentRole as UserRole);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-64 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Restricted</CardTitle>
            <CardDescription>
              You don't have the required permissions to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-600">
              <p>Required role: <span className="font-medium capitalize">{requiredRole}</span></p>
              <p>Your role: <span className="font-medium capitalize">{currentRole || 'None'}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
