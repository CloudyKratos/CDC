
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Users, Calendar, BarChart3, Settings, AlertTriangle } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import CDCAccountManager from './CDCAccountManager';
import CDCSetupPanel from './CDCSetupPanel';
import UserManagementPanel from './UserManagementPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import EnhancedAdminCalendar from '@/components/calendar/EnhancedAdminCalendar';

const EnhancedAdminPanel = () => {
  const { currentRole, isLoading } = useRole();
  const [activeTab, setActiveTab] = useState('overview');

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show CDC setup if user doesn't have admin role
  if (currentRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup Required</h1>
          <p className="text-gray-600">Set up the CDC admin account to access the admin panel</p>
        </div>
        <CDCSetupPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Control Panel</h1>
          <p className="text-gray-600">Comprehensive platform management with advanced features</p>
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
            Enhanced Calendar
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
                <CardTitle>Enhanced Platform Overview</CardTitle>
                <CardDescription>Advanced insights into platform status and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Advanced User Management</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Enhanced role management and permissions</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Enhanced Calendar</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Advanced event management with analytics</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Advanced Analytics</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Deep insights and performance metrics</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Enhanced Settings</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Advanced platform configuration options</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Recent Enhancements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Enhanced calendar with advanced event management and analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Real-time event monitoring and bulk operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Advanced event templates and scheduling controls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Comprehensive calendar settings and permissions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Enhanced Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Search Path Security</span>
                  <Badge className="bg-green-500">Enhanced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RLS Policies</span>
                  <Badge className="bg-green-500">Advanced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Function Security</span>
                  <Badge className="bg-green-500">Hardened</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Isolation</span>
                  <Badge className="bg-green-500">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calendar Security</span>
                  <Badge className="bg-green-500">Enhanced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Event Management</span>
                  <Badge className="bg-green-500">Protected</Badge>
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
          <EnhancedAdminCalendar />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Platform Settings</CardTitle>
              <CardDescription>
                Advanced system-wide configuration and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Enhanced Authentication Settings</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Advanced security configurations with enhanced monitoring
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Multi-Factor Authentication</span>
                      <Badge variant="outline">Recommended</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Session Management</span>
                      <Badge variant="outline">Enhanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>OAuth Integration</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Enhanced Security Policies</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Enhanced Row Level Security</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Advanced Function Security</span>
                      <Badge className="bg-green-500">SECURITY DEFINER+</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enhanced Search Path Protection</span>
                      <Badge className="bg-green-500">Hardened</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Calendar Event Protection</span>
                      <Badge className="bg-green-500">Enhanced</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Performance & Monitoring</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Connection Monitoring</span>
                      <Badge className="bg-blue-500">Enhanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance Analytics</span>
                      <Badge className="bg-blue-500">Real-time</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Error Tracking</span>
                      <Badge className="bg-blue-500">Advanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Calendar Analytics</span>
                      <Badge className="bg-blue-500">Comprehensive</Badge>
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
