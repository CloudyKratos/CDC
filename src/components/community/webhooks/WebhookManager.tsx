import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Settings, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  event: string;
  created_at: string;
}

const WebhookManager: React.FC = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvent, setNewWebhookEvent] = useState('message_created');
  const [newWebhookActive, setNewWebhookActive] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchWebhooks();
  }, [user]);

  const fetchWebhooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setWebhooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast.error('Please provide a name and URL for the webhook');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user?.id,
          name: newWebhookName.trim(),
          url: newWebhookUrl.trim(),
          event: newWebhookEvent,
          active: newWebhookActive
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setWebhooks(prev => [data, ...prev]);
      setNewWebhookName('');
      setNewWebhookUrl('');
      setNewWebhookEvent('message_created');
      setNewWebhookActive(true);
      toast.success('Webhook added successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setWebhooks(prev => prev.filter(wh => wh.id !== id));
      toast.success('Webhook deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ active: !currentActive })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setWebhooks(prev =>
        prev.map(wh => (wh.id === id ? { ...wh, active: !currentActive } : wh))
      );
      toast.success(`Webhook ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Webhook Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Add New Webhook</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="webhook-name">Name</Label>
              <Input
                id="webhook-name"
                value={newWebhookName}
                onChange={e => setNewWebhookName(e.target.value)}
                placeholder="Webhook name"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">URL</Label>
              <Input
                id="webhook-url"
                value={newWebhookUrl}
                onChange={e => setNewWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="webhook-event">Event</Label>
              <Select
                onValueChange={value => setNewWebhookEvent(value)}
                value={newWebhookEvent}
                disabled={loading}
              >
                <SelectTrigger id="webhook-event" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message_created">Message Created</SelectItem>
                  <SelectItem value="message_deleted">Message Deleted</SelectItem>
                  <SelectItem value="user_joined">User Joined</SelectItem>
                  <SelectItem value="user_left">User Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="webhook-active">Active</Label>
                <Switch
                  id="webhook-active"
                  checked={newWebhookActive}
                  onCheckedChange={checked => setNewWebhookActive(checked)}
                  disabled={loading}
                />
              </div>
              <Button onClick={handleAddWebhook} disabled={loading} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold mb-4">Your Webhooks</h3>
        {loading && !webhooks.length ? (
          <p>Loading webhooks...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : webhooks.length === 0 ? (
          <p>No webhooks configured yet.</p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {webhooks.map(wh => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{wh.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{wh.url}</span>
                    <Badge variant="outline" className="mt-1">
                      {wh.event.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={wh.active}
                      onCheckedChange={() => handleToggleActive(wh.id, wh.active)}
                      disabled={loading}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWebhook(wh.id)}
                      disabled={loading}
                      aria-label={`Delete webhook ${wh.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookManager;
