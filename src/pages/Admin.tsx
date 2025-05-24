
import React from 'react';
import AdminPanel from '@/components/admin/AdminPanel';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const Admin = () => {
  return (
    <RoleProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <AdminPanel />
      </div>
    </RoleProtectedRoute>
  );
};

export default Admin;
