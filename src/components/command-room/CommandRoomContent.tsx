
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, Settings, History } from 'lucide-react';
import CourseGrid from '@/components/courses/CourseGrid';
import UnlockHistory from '@/components/courses/UnlockHistory';
import CourseManagement from '@/components/admin/CourseManagement';
import { useAuth } from '@/contexts/AuthContext';

const CommandRoomContent: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
          <TabsList className="bg-white border border-gray-200 p-1 shadow-sm">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 px-6 py-2"
            >
              <BookOpen className="h-4 w-4" />
              Courses & Content
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 px-6 py-2"
            >
              <History className="h-4 w-4" />
              Unlock History
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="admin" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 px-6 py-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="courses" className="m-0">
            <CourseGrid isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="history" className="m-0">
            <UnlockHistory />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="m-0">
              <CourseManagement />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default CommandRoomContent;
