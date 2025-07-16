
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/services/RoleService';
import RoleService from '@/services/RoleService';
import { useAuth } from '@/contexts/auth/AuthContext';

interface RoleContextType {
  currentRole: UserRole | null;
  hasRole: (role: UserRole) => Promise<boolean>;
  canManageCalendar: boolean;
  canManageUsers: boolean;
  canModerateStage: boolean;
  canViewAnalytics: boolean;
  isLoading: boolean;
  refreshRole: () => Promise<void>;
  isCDCAdmin: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentRole: null,
  hasRole: async () => false,
  canManageCalendar: false,
  canManageUsers: false,
  canModerateStage: false,
  canViewAnalytics: false,
  isLoading: true,
  refreshRole: async () => {},
  isCDCAdmin: false,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState({
    canManageCalendar: false,
    canManageUsers: false,
    canModerateStage: false,
    canViewAnalytics: false,
  });
  const [isCDCAdmin, setIsCDCAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshRole = async () => {
    if (!isAuthenticated || !user) {
      setCurrentRole(null);
      setPermissions({
        canManageCalendar: false,
        canManageUsers: false,
        canModerateStage: false,
        canViewAnalytics: false,
      });
      setIsCDCAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const role = await RoleService.getCurrentUserRole();
      setCurrentRole(role);

      // Check if user is CDC admin
      const cdcAdminStatus = await RoleService.isCDCAdmin();
      setIsCDCAdmin(cdcAdminStatus);

      // Check permissions - all now restricted to CDC admin
      const [canManageCalendar, canManageUsers, canModerateStage, canViewAnalytics] = await Promise.all([
        RoleService.canManageCalendar(),
        RoleService.canManageUsers(),
        RoleService.canModerateStage(),
        RoleService.canViewAnalytics(),
      ]);

      setPermissions({
        canManageCalendar,
        canManageUsers,
        canModerateStage,
        canViewAnalytics,
      });
    } catch (error) {
      console.error('Error refreshing role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRole();
  }, [isAuthenticated, user]);

  const hasRole = async (role: UserRole): Promise<boolean> => {
    return await RoleService.hasRole(role);
  };

  return (
    <RoleContext.Provider value={{
      currentRole,
      hasRole,
      ...permissions,
      isLoading,
      refreshRole,
      isCDCAdmin,
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
