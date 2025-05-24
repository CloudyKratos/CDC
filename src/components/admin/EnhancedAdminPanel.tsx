
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Users, Calendar, BarChart3, Settings, AlertTriangle } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import CDCAccountManager from './CDCAccountManager';
import UserManagementPanel from './UserManagementPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import CalendarPanel from '@/components/CalendarPanel';

const EnhancedAdminPanel = () => {
  const { currentRole } = useRole();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-600">Comprehensive platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 hover:bg-red-600">
            <Crown className="h-3 w-3 mr-1" />
            {currentRole}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cdc-account" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            CDC Account
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Quick insights into platform status and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">User Management</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Event Control</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Full calendar and event management</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Analytics</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Platform insights and metrics</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">System Settings</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Platform-wide configuration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Search Path Security</span>
                  <Badge className="bg-green-500">Fixed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RLS Policies</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Function Security</span>
                  <Badge className="bg-green-500">Secured</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Isolation</span>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cdc-account">
          <CDCAccountManager />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarPanel isAdminView={true} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                System-wide configuration and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Authentication Settings</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure OTP expiry and password security settings in Supabase Dashboard
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>OTP Expiry Time</span>
                      <Badge variant="outline">60-300 seconds recommended</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Leaked Password Protection</span>
                      <Badge variant="outline">Enable in Auth Settings</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Security Policies</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Row Level Security</span>
                      <Badge className="bg-green-500">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Function Security</span>
                      <Badge className="bg-green-500">SECURITY DEFINER</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Search Path Protection</span>
                      <Badge className="bg-green-500">Fixed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminPanel;
