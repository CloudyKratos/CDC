
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import WarriorSpace from '@/pages/WarriorSpace';
import DirectMessagesPanel from '@/components/messaging/DirectMessagesPanel';
import Community from '@/pages/Community';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/warrior-space" element={<Layout><WarriorSpace /></Layout>} />
            <Route path="/community" element={<Layout><Community /></Layout>} />
            <Route path="/messages" element={<Layout><DirectMessagesPanel /></Layout>} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
