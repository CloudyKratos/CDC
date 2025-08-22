import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Webhook, Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  lastTriggered?: string;
  totalTriggers?: number;
}

interface ChatWebhookManagerProps {
  channelId: string;
  channelName: string;
}

export const ChatWebhookManager: React.FC<ChatWebhookManagerProps> = ({
  channelId,
  channelName
}) => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Available webhook events
  const availableEvents = [
    { id: 'message.created', label: 'New Message', description: 'Triggered when a new message is posted' },
    { id: 'message.deleted', label: 'Message Deleted', description: 'Triggered when a message is deleted' },
    { id: 'user.joined', label: 'User Joined', description: 'Triggered when a user joins the channel' },
    { id: 'user.left', label: 'User Left', description: 'Triggered when a user leaves the channel' }
  ];

  // Add new webhook
  const addWebhook = useCallback(async () => {
    if (!newWebhookUrl.trim() || !newWebhookName.trim()) {
      toast.error('Please enter both name and URL');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to add webhooks');
      return;
    }

    try {
      setIsLoading(true);

      const newWebhook: WebhookConfig = {
        id: `webhook-${Date.now()}`,
        name: newWebhookName.trim(),
        url: newWebhookUrl.trim(),
        events: ['message.created'], // Default to message events
        isActive: true,
        totalTriggers: 0
      };

      // In a real implementation, you would save this to a database
      // For now, we'll store it in local state
      setWebhooks(prev => [...prev, newWebhook]);
      
      setNewWebhookName('');
      setNewWebhookUrl('');
      
      toast.success('Webhook added successfully!');
      console.log('✅ Added webhook:', newWebhook);

      // Test the webhook immediately
      await testWebhook(newWebhook);

    } catch (error) {
      console.error('❌ Error adding webhook:', error);
      toast.error('Failed to add webhook');
    } finally {
      setIsLoading(false);
    }
  }, [newWebhookUrl, newWebhookName, user?.id]);

  // Test webhook by sending a test payload
  const testWebhook = useCallback(async (webhook: WebhookConfig) => {
    try {
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        channel: {
          id: channelId,
          name: channelName
        },
        data: {
          message: 'This is a test webhook from your chat application',
          user: {
            id: user?.id,
            name: user?.name || user?.email?.split('@')[0]
          }
        }
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChatApp-Webhook/1.0',
          ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret })
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload)
      });

      console.log('🎯 Webhook test sent to:', webhook.url);
      toast.success('Test webhook sent successfully!');
      
      // Update last triggered time
      setWebhooks(prev => 
        prev.map(w => 
          w.id === webhook.id 
            ? { ...w, lastTriggered: new Date().toISOString(), totalTriggers: (w.totalTriggers || 0) + 1 }
            : w
        )
      );

    } catch (error) {
      console.error('❌ Error testing webhook:', error);
      toast.error('Failed to test webhook. Please check the URL.');
    }
  }, [channelId, channelName, user]);

  // Toggle webhook active state
  const toggleWebhook = useCallback((webhookId: string) => {
    setWebhooks(prev =>
      prev.map(webhook =>
        webhook.id === webhookId
          ? { ...webhook, isActive: !webhook.isActive }
          : webhook
      )
    );
    toast.success('Webhook status updated');
  }, []);

  // Remove webhook
  const removeWebhook = useCallback((webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
    toast.success('Webhook removed');
  }, []);

  // Trigger webhook for real events
  const triggerWebhooks = useCallback(async (eventType: string, eventData: any) => {
    const activeWebhooks = webhooks.filter(w => w.isActive && w.events.includes(eventType));
    
    if (activeWebhooks.length === 0) return;

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      channel: {
        id: channelId,
        name: channelName
      },
      data: eventData
    };

    console.log(`🔗 Triggering ${activeWebhooks.length} webhooks for event:`, eventType);

    for (const webhook of activeWebhooks) {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ChatApp-Webhook/1.0',
            ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret })
          },
          mode: 'no-cors',
          body: JSON.stringify(payload)
        });

        // Update webhook stats
        setWebhooks(prev =>
          prev.map(w =>
            w.id === webhook.id
              ? { 
                  ...w, 
                  lastTriggered: new Date().toISOString(), 
                  totalTriggers: (w.totalTriggers || 0) + 1 
                }
              : w
          )
        );

        console.log('✅ Webhook triggered successfully:', webhook.name);
      } catch (error) {
        console.error(`❌ Failed to trigger webhook ${webhook.name}:`, error);
      }
    }
  }, [webhooks, channelId, channelName]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <span>Chat Webhooks</span>
          </CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications about chat events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new webhook */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Add New Webhook</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Webhook name"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
              />
              <Input
                placeholder="https://your-server.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={addWebhook}
              disabled={isLoading || !newWebhookUrl.trim() || !newWebhookName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {/* Webhook list */}
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No webhooks configured</p>
              <p className="text-sm">Add a webhook to get started with real-time notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium">{webhook.name}</h5>
                          <Badge variant={webhook.isActive ? "default" : "secondary"}>
                            {webhook.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-mono text-xs">{webhook.url}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {webhook.lastTriggered && (
                            <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                          )}
                          {webhook.totalTriggers !== undefined && (
                            <span>Total triggers: {webhook.totalTriggers}</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {availableEvents.find(e => e.id === event)?.label || event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={() => toggleWebhook(webhook.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(webhook)}
                          disabled={!webhook.isActive}
                        >
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Available events info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Available Events</h5>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    {availableEvents.map(event => (
                      <div key={event.id}>
                        <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                          {event.id}
                        </code>
                        {' - '}{event.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};