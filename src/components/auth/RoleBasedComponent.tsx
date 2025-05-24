
import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/services/RoleService';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  hideIfNoAccess?: boolean;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  fallback,
  hideIfNoAccess = true
}) => {
  const { currentRole, isLoading } = useRole();

  if (isLoading) {
    return null;
  }

  const hasAccess = currentRole && allowedRoles.includes(currentRole);

  if (!hasAccess) {
    if (hideIfNoAccess) {
      return null;
    }
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default RoleBasedComponent;
