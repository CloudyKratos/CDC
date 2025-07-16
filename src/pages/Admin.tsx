
import React from 'react';
import EnhancedAdminPanel from '@/components/admin/EnhancedAdminPanel';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const Admin = () => {
  return (
    <RoleProtectedRoute requiredRole="admin" requireCDCAdmin={true}>
      <div className="container mx-auto px-4 py-8">
        <EnhancedAdminPanel />
      </div>
    </RoleProtectedRoute>
  );
};

export default Admin;
