
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Webhook, Settings, Trash2, Plus, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface WebhookData {
  id: string;
  channel_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_key?: string;
  created_at: string;
  last_triggered_at?: string;
  channels?: {
    name: string;
  };
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status?: number;
  response_body?: string;
  created_at: string;
}

const WEBHOOK_EVENTS = [
  'message.created',
  'message.updated',
  'message.deleted',
  'user.joined',
  'user.left',
  'channel.created',
  'poll.created',
  'poll.voted'
];

export const WebhookManager: React.FC = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    channel_id: '',
    events: [] as string[],
    secret_key: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load channels
      const { data: channelsData } = await supabase
        .from('channels')
        .select('id, name')
        .eq('type', 'public');

      // Load webhooks
      const { data: webhooksData } = await supabase
        .from('webhooks')
        .select(`
          *,
          channels (name)
        `)
        .order('created_at', { ascending: false });

      // Load recent logs
      const { data: logsData } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setChannels(channelsData || []);
      setWebhooks(webhooksData || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading webhook data:', error);
      toast.error('Failed to load webhook data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!formData.name || !formData.url || !formData.channel_id || formData.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .insert({
          name: formData.name,
          url: formData.url,
          channel_id: formData.channel_id,
          events: formData.events,
          secret_key: formData.secret_key || null,
          created_by: user?.id,
          is_active: true
        });

      if (error) throw error;

      toast.success('Webhook created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        url: '',
        channel_id: '',
        events: [],
        secret_key: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: isActive })
        .eq('id', webhookId);

      if (error) throw error;

      toast.success(`Webhook ${isActive ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Webhook Manager</h2>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          {showCreateForm && <TabsTrigger value="create">Create New</TabsTrigger>}
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{webhook.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">URL</p>
                    <p className="text-sm text-gray-600 font-mono">{webhook.url}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Channel</p>
                    <p className="text-sm text-gray-600">{webhook.channels?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Events</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {webhook.last_triggered_at && (
                    <div>
                      <p className="text-sm font-medium">Last Triggered</p>
                      <p className="text-sm text-gray-600">
                        {new Date(webhook.last_triggered_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {webhooks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No webhooks configured</p>
                <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                  Create Your First Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Webhook Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{log.event_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={log.response_status && log.response_status < 300 ? "default" : "destructive"}>
                      {log.response_status || 'Pending'}
                    </Badge>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No webhook logs yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showCreateForm && (
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="My Webhook"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-url">URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhooks"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-channel">Channel</Label>
                  <Select value={formData.channel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, channel_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {WEBHOOK_EVENTS.map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          checked={formData.events.includes(event)}
                          onChange={() => handleEventToggle(event)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={event} className="text-sm">
                          {event}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Secret Key (optional)</Label>
                  <Input
                    id="webhook-secret"
                    placeholder="Your secret key for webhook verification"
                    value={formData.secret_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWebhook}>Create Webhook</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
