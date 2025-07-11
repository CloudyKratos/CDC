import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { QueryClient } from 'react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import CommandRoom from './pages/CommandRoom';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import EmailVerification from './pages/EmailVerification';
import EnhancedProfileSettings from './pages/EnhancedProfileSettings';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <RoleProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Toaster />
            <Router>
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/email-verification/:token" element={<PublicRoute><EmailVerification /></PublicRoute>} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/command-room" element={<PrivateRoute><CommandRoom /></PrivateRoute>} />
                <Route path="/admin-panel" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
                
                <Route path="/profile-settings" element={<EnhancedProfileSettings />} />
                
              </Routes>
            </Router>
          </ThemeProvider>
        </RoleProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
