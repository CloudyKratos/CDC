
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CommunityPage from "./pages/CommunityPage";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import WarriorSpace from "./pages/WarriorSpace";
import ProfileSettings from "./pages/ProfileSettings";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import CommandRoom from "./pages/CommandRoom";
import Calendar from "./pages/Calendar";
import StageRooms from "./pages/StageRooms";
import NotFound from "./pages/NotFound";
import MobileLayout from "./components/mobile/MobileLayout";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <RoleProvider>
              <WorkspaceProvider>
                <Router>
                  <MobileLayout>
                    <div className="min-h-screen bg-background">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/community" element={<CommunityPage />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/warrior-space" element={<WarriorSpace />} />
                          <Route path="/command-room" element={<CommandRoom />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/stage-rooms" element={<StageRooms />} />
                          <Route path="/profile-settings" element={<ProfileSettings />} />
                          <Route path="/verify-email" element={<VerifyEmail />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      <Toaster />
                    </div>
                  </MobileLayout>
                </Router>
              </WorkspaceProvider>
            </RoleProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
