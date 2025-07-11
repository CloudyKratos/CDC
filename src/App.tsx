
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import EnhancedProfileSettings from './pages/EnhancedProfileSettings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Toaster />
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile-settings" element={<EnhancedProfileSettings />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
