import React from 'react';
import { Navigate } from 'react-router-dom';

const StageRooms: React.FC = () => {
  // Redirect to dashboard with stage tab
  return <Navigate to="/dashboard?tab=stage" replace />;
};

export default StageRooms;