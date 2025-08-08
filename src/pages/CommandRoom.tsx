import React from 'react';
import { Navigate } from 'react-router-dom';

const CommandRoom: React.FC = () => {
  // Redirect to dashboard with command-room tab
  return <Navigate to="/dashboard?tab=command-room" replace />;
};

export default CommandRoom;