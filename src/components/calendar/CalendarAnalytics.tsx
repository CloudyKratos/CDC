
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users, Clock, Award } from 'lucide-react';

const CalendarAnalytics = () => {
  // Sample data - replace with real data from your analytics service
  const eventsByMonth = [
    { month: 'Jan', events: 12, attendance: 85 },
    { month: 'Feb', events: 19, attendance: 78 },
    { month: 'Mar', events: 15, attendance: 92 },
    { month: 'Apr', events: 22, attendance: 88 },
    { month: 'May', events: 18, attendance: 95 },
    { month: 'Jun', events: 25, attendance: 89 },
  ];

  const eventTypes = [
    { name: 'Mission Calls', value: 45, color: '#3B82F6' },
    { name: 'Workshops', value: 30, color: '#10B981' },
    { name: 'Meetings', value: 15, color: '#F59E0B' },
    { name: 'Training', value: 10, color: '#EF4444' },
  ];

  const topPerformers = [
    { name: 'Mission Call: Web Dev', attendance: 156, rating: 4.8 },
    { name: 'Workshop: React Basics', attendance: 142, rating: 4.7 },
    { name: 'Training: Leadership', attendance: 128, rating: 4.9 },
    { name: 'Meeting: Q4 Planning', attendance: 98, rating: 4.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">156</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last month
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold">89%</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs last month
                </div>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">45m</p>
                <div className="flex items-center text-red-600 text-sm">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3m vs last month
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">4.7/5</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.2 vs last month
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events and Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Events & Attendance Trend</CardTitle>
            <CardDescription>Monthly events count and average attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="events" fill="#3B82F6" name="Events" />
                <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types Distribution</CardTitle>
            <CardDescription>Breakdown of events by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>Events with highest attendance and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-gray-500">{event.attendance} attendees</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{event.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">rating</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mission Call: Advanced React</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Workshop: Team Building</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Leadership Training</span>
                <span className="text-xs text-gray-500">2:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Q4 Review Meeting</span>
                <span className="text-xs text-gray-500">4:30 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacity Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Web Dev Workshop</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">98% Full</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Design Sprint</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">85% Full</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarAnalytics;
