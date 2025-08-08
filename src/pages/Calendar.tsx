import React from 'react';
import { Navigate } from 'react-router-dom';

const Calendar: React.FC = () => {
  // Redirect to dashboard with calendar tab
  return <Navigate to="/dashboard?tab=calendar" replace />;
};

export default Calendar;