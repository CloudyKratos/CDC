
import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/components/HomePage';
import CalendarPanel from '@/components/CalendarPanel';
import CommunityPanel from '@/components/CommunityPanel';
import StageCallPanel from '@/components/StageCallPanel';
import WorkspacePanel from '@/components/WorkspacePanel';
import WorldMapPanel from '@/components/WorldMapPanel';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "home";
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarPanel />;
      case "community":
        return <CommunityPanel />;
      case "stage":
        return <StageCallPanel />;
      case "worldmap":
        return <WorldMapPanel />;
      case "workspace":
        return <WorkspacePanel />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
