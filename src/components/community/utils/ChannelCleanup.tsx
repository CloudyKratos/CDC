import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateChannel {
  name: string;
  count: number;
  channels: Array<{
    id: string;
    created_at: string;
    created_by: string;
  }>;
}

export const ChannelCleanup: React.FC = () => {
  const { user } = useAuth();
  const [duplicates, setDuplicates] = useState<DuplicateChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const scanForDuplicates = async () => {
    if (!user?.id) return;

    setIsScanning(true);
    try {
      console.log('🔍 Scanning for duplicate channels...');
      
      const { data: channels, error } = await supabase
        .from('channels')
        .select('id, name, created_at, created_by')
        .eq('type', 'public')
        .order('name, created_at');

      if (error) {
        throw error;
      }

      // Group channels by name
      const channelGroups = new Map<string, any[]>();
      channels?.forEach(channel => {
        if (!channelGroups.has(channel.name)) {
          channelGroups.set(channel.name, []);
        }
        channelGroups.get(channel.name)!.push(channel);
      });

      // Find duplicates
      const duplicateChannels: DuplicateChannel[] = [];
      channelGroups.forEach((channels, name) => {
        if (channels.length > 1) {
          duplicateChannels.push({
            name,
            count: channels.length,
            channels: channels.map(ch => ({
              id: ch.id,
              created_at: ch.created_at,
              created_by: ch.created_by
            }))
          });
        }
      });

      setDuplicates(duplicateChannels);
      console.log('✅ Found duplicates:', duplicateChannels.length);
      
      if (duplicateChannels.length === 0) {
        toast.success('No duplicate channels found!');
      } else {
        toast.warning(`Found ${duplicateChannels.length} sets of duplicate channels`);
      }
      
    } catch (error) {
      console.error('❌ Error scanning duplicates:', error);
      toast.error('Failed to scan for duplicates');
    } finally {
      setIsScanning(false);
    }
  };

  const cleanupDuplicates = async () => {
    if (!user?.id || duplicates.length === 0) return;

    setIsLoading(true);
    try {
      console.log('🧹 Starting cleanup of duplicate channels...');
      
      let totalRemoved = 0;
      
      for (const duplicate of duplicates) {
        // Keep the oldest channel (first created)
        const sortedChannels = duplicate.channels.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Remove all but the first (oldest) channel
        const channelsToRemove = sortedChannels.slice(1);
        
        for (const channel of channelsToRemove) {
          try {
            // First, delete associated messages
            await supabase
              .from('community_messages')
              .delete()
              .eq('channel_id', channel.id);

            // Then delete channel members
            await supabase
              .from('channel_members')
              .delete()
              .eq('channel_id', channel.id);

            // Finally, delete the channel
            const { error } = await supabase
              .from('channels')
              .delete()
              .eq('id', channel.id);

            if (error) {
              console.error(`❌ Failed to delete channel ${channel.id}:`, error);
            } else {
              console.log(`✅ Deleted duplicate channel: ${channel.id}`);
              totalRemoved++;
            }
          } catch (err) {
            console.error(`❌ Error deleting channel ${channel.id}:`, err);
          }
        }
      }

      setDuplicates([]);
      toast.success(`Successfully removed ${totalRemoved} duplicate channels`);
      console.log('✅ Cleanup completed, removed:', totalRemoved);
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      toast.error('Failed to cleanup duplicates');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.id) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Channel Cleanup Tool
        </CardTitle>
        <CardDescription>
          Scan for and remove duplicate channels that may have been created automatically
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={scanForDuplicates} 
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
          
          {duplicates.length > 0 && (
            <Button 
              onClick={cleanupDuplicates} 
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? 'Cleaning...' : `Clean ${duplicates.length} Duplicates`}
            </Button>
          )}
        </div>

        {duplicates.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Found duplicate channels:</p>
                {duplicates.map((duplicate, index) => (
                  <div key={index} className="text-sm">
                    <strong>"{duplicate.name}"</strong> - {duplicate.count} duplicates
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Cleanup will keep the oldest channel and remove the duplicates along with their messages.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {duplicates.length === 0 && !isScanning && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No duplicate channels detected. Your channel system is clean!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
