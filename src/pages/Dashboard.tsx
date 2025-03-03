
import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { WorkspacePanel } from "@/components/WorkspacePanel";

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("chat");
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar onSelectItem={setActiveItem} activeItem={activeItem} />
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {activeItem === "chat" && (
            <>
              <div className="h-full lg:order-1">
                <ChatPanel />
              </div>
              <div className="h-full lg:order-2">
                <WorkspacePanel />
              </div>
            </>
          )}
          
          {activeItem === "home" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white rounded-lg border border-gray-100 p-8 animate-fade-in">
                <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
                <p className="text-gray-600 mb-6">
                  This is your dashboard where you can access all your work and connect with other entrepreneurs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Recent Messages</h3>
                    <p className="text-sm text-gray-500">You have 3 unread messages</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Recent Documents</h3>
                    <p className="text-sm text-gray-500">You edited "Q3 Goals" recently</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Upcoming Events</h3>
                    <p className="text-sm text-gray-500">Meeting with investors tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeItem !== "chat" && activeItem !== "home" && (
            <div className="col-span-1 lg:col-span-2 h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Coming Soon</h2>
                <p className="text-gray-600">This feature is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
