
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MessageSquare, Users, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChannelAnalytics {
  id: string;
  channel_id: string;
  date: string;
  message_count: number;
  active_users: number;
  new_members: number;
  peak_online_users: number;
  channels?: {
    name: string;
  };
}

interface UserActivity {
  id: string;
  user_id: string;
  channel_id: string;
  activity_type: string;
  created_at: string;
  channels?: {
    name: string;
  };
}

export const AnalyticsPanel: React.FC = () => {
  const [channelAnalytics, setChannelAnalytics] = useState<ChannelAnalytics[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedChannel, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
      startDate.setDate(endDate.getDate() - days);

      // Load channel analytics
      let analyticsQuery = supabase
        .from('channel_analytics')
        .select(`
          *,
          channels (name)
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (selectedChannel !== 'all') {
        analyticsQuery = analyticsQuery.eq('channel_id', selectedChannel);
      }

      const { data: analyticsData, error: analyticsError } = await analyticsQuery;
      if (analyticsError) throw analyticsError;

      // Load user activity
      let activityQuery = supabase
        .from('user_activity_logs')
        .select(`
          *,
          channels (name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (selectedChannel !== 'all') {
        activityQuery = activityQuery.eq('channel_id', selectedChannel);
      }

      const { data: activityData, error: activityError } = await activityQuery;
      if (activityError) throw activityError;

      setChannelAnalytics(analyticsData || []);
      setUserActivity(activityData || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChannels = () => {
    const channels = [...new Set(channelAnalytics.map(a => ({ id: a.channel_id, name: a.channels?.name || 'Unknown' })))];
    return channels;
  };

  const getTotalStats = () => {
    const totalMessages = channelAnalytics.reduce((sum, a) => sum + a.message_count, 0);
    const totalActiveUsers = channelAnalytics.reduce((sum, a) => sum + a.active_users, 0);
    const totalNewMembers = channelAnalytics.reduce((sum, a) => sum + a.new_members, 0);
    const avgDailyMessages = Math.round(totalMessages / Math.max(channelAnalytics.length, 1));

    return { totalMessages, totalActiveUsers, totalNewMembers, avgDailyMessages };
  };

  const getActivityByType = () => {
    const activityCounts = userActivity.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(activityCounts).map(([type, count]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: count
    }));
  };

  const getMessageTrend = () => {
    return channelAnalytics.map(a => ({
      date: new Date(a.date).toLocaleDateString(),
      messages: a.message_count,
      users: a.active_users
    }));
  };

  const stats = getTotalStats();
  const activityByType = getActivityByType();
  const messageTrend = getMessageTrend();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Community Analytics</h2>
        </div>
        <div className="flex gap-2">
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {getChannels().map(channel => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.totalActiveUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">New Members</p>
                <p className="text-2xl font-bold">{stats.totalNewMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Daily Messages</p>
                <p className="text-2xl font-bold">{stats.avgDailyMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message & User Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={messageTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="messages" stroke="#8884d8" name="Messages" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Active Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
