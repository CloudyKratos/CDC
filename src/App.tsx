import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient } from 'react-query';

import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import WarriorSpace from '@/pages/WarriorSpace';
import Strategy from '@/pages/Strategy';
import Progress from '@/pages/Progress';
import Events from '@/pages/Events';
import EventDetails from '@/pages/EventDetails';
import StageRoom from '@/pages/StageRoom';
import TickBombDemo from '@/pages/TickBombDemo';
import DirectMessagesPanel from '@/components/messaging/DirectMessagesPanel';
import Profile from '@/pages/Profile';

import Community from '@/pages/Community';

function App() {
  return (
    <QueryClient>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/warrior-space" element={<Layout><WarriorSpace /></Layout>} />
          <Route path="/strategy" element={<Layout><Strategy /></Layout>} />
          <Route path="/progress" element={<Layout><Progress /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/community" element={<Layout><Community /></Layout>} />
          <Route path="/messages" element={<Layout><DirectMessagesPanel /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/event/:id" element={<Layout><EventDetails /></Layout>} />
          <Route path="/stage/:id" element={<Layout><StageRoom /></Layout>} />
          <Route path="/demo" element={<Layout><TickBombDemo /></Layout>} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClient>
  );
}

export default App;
