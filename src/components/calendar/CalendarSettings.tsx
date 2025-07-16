
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Settings, Bell, Calendar, Users, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

const CalendarSettings = () => {
  const [settings, setSettings] = useState({
    defaultEventDuration: '60',
    defaultMaxAttendees: '50',
    autoApproval: true,
    allowPublicEvents: true,
    requireDescription: true,
    enableNotifications: true,
    reminderDefaults: '24,1',
    timeZone: 'UTC',
    workingHours: { start: '09:00', end: '17:00' },
    blackoutDates: ['2024-12-25', '2024-01-01'],
    eventTemplates: [
      { name: 'Mission Call', duration: 60, type: 'mission_call' },
      { name: 'Workshop', duration: 120, type: 'workshop' },
      { name: 'Team Meeting', duration: 30, type: 'meeting' }
    ]
  });

  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newTemplate, setNewTemplate] = useState({ name: '', duration: '', type: '' });

  const handleSaveSettings = async () => {
    try {
      // Here you would save settings to your backend
      console.log('Saving settings:', settings);
      toast.success('Calendar settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const addBlackoutDate = () => {
    if (newBlackoutDate && !settings.blackoutDates.includes(newBlackoutDate)) {
      setSettings({
        ...settings,
        blackoutDates: [...settings.blackoutDates, newBlackoutDate]
      });
      setNewBlackoutDate('');
    }
  };

  const removeBlackoutDate = (date: string) => {
    setSettings({
      ...settings,
      blackoutDates: settings.blackoutDates.filter(d => d !== date)
    });
  };

  const addTemplate = () => {
    if (newTemplate.name && newTemplate.duration && newTemplate.type) {
      setSettings({
        ...settings,
        eventTemplates: [...settings.eventTemplates, { ...newTemplate, duration: parseInt(newTemplate.duration) }]
      });
      setNewTemplate({ name: '', duration: '', type: '' });
    }
  };

  const removeTemplate = (index: number) => {
    setSettings({
      ...settings,
      eventTemplates: settings.eventTemplates.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure default calendar behavior and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default Event Duration (minutes)</Label>
              <Input
                id="defaultDuration"
                type="number"
                value={settings.defaultEventDuration}
                onChange={(e) => setSettings({ ...settings, defaultEventDuration: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultAttendees">Default Max Attendees</Label>
              <Input
                id="defaultAttendees"
                type="number"
                value={settings.defaultMaxAttendees}
                onChange={(e) => setSettings({ ...settings, defaultMaxAttendees: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={settings.timeZone} onValueChange={(value) => setSettings({ ...settings, timeZone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminders">Default Reminders (hours before)</Label>
              <Input
                id="reminders"
                value={settings.reminderDefaults}
                onChange={(e) => setSettings({ ...settings, reminderDefaults: e.target.value })}
                placeholder="24,1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApproval">Auto-approve Events</Label>
                <p className="text-sm text-gray-500">Automatically approve new events without manual review</p>
              </div>
              <Switch
                id="autoApproval"
                checked={settings.autoApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproval: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="publicEvents">Allow Public Events</Label>
                <p className="text-sm text-gray-500">Enable users to create public events visible to all</p>
              </div>
              <Switch
                id="publicEvents"
                checked={settings.allowPublicEvents}
                onCheckedChange={(checked) => setSettings({ ...settings, allowPublicEvents: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireDesc">Require Description</Label>
                <p className="text-sm text-gray-500">Make event description mandatory</p>
              </div>
              <Switch
                id="requireDesc"
                checked={settings.requireDescription}
                onCheckedChange={(checked) => setSettings({ ...settings, requireDescription: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-gray-500">Send email and push notifications for events</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>Set default working hours for event scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, start: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, end: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blackout Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blackout Dates
          </CardTitle>
          <CardDescription>Dates when no events can be scheduled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              placeholder="Select date"
            />
            <Button onClick={addBlackoutDate}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.blackoutDates.map((date) => (
              <Badge key={date} variant="secondary" className="flex items-center gap-1">
                {date}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeBlackoutDate(date)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Templates
          </CardTitle>
          <CardDescription>Pre-configured event templates for quick creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Template name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Duration (min)"
              value={newTemplate.duration}
              onChange={(e) => setNewTemplate({ ...newTemplate, duration: e.target.value })}
            />
            <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mission_call">Mission Call</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {settings.eventTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{template.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {template.duration}min • {template.type}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTemplate(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default CalendarSettings;
