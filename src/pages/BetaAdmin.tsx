
import React, { useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import AdminPanel from "@/components/beta/AdminPanel";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const BetaAdmin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is an admin
    if (user && user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/10 to-gray-900 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Beta Program Management</h1>
            <p className="text-gray-400 mt-2">
              Manage waitlist applications, approve beta testers, and monitor the program
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Export Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="waitlist" className="w-full">
          <TabsList className="bg-gray-900/60 border border-gray-800 mb-8">
            <TabsTrigger value="waitlist">Waitlist & Applications</TabsTrigger>
            <TabsTrigger value="testers">Beta Testers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="waitlist" className="mt-0">
            <AdminPanel />
          </TabsContent>
          
          <TabsContent value="testers">
            <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-800 rounded-lg p-16 text-center">
              <h3 className="text-xl font-medium text-gray-400">Beta Testers Management</h3>
              <p className="text-gray-500 mt-2">This feature is coming soon in the next update</p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-800 rounded-lg p-16 text-center">
              <h3 className="text-xl font-medium text-gray-400">Beta Program Analytics</h3>
              <p className="text-gray-500 mt-2">This feature is coming soon in the next update</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-gray-900/20 backdrop-blur-sm border border-gray-800 rounded-lg p-16 text-center">
              <h3 className="text-xl font-medium text-gray-400">Beta Program Settings</h3>
              <p className="text-gray-500 mt-2">This feature is coming soon in the next update</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BetaAdmin;
