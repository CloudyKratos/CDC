
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Ban, MessageSquareX, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ActionType = 'ban' | 'kick' | 'mute' | 'warn' | 'timeout';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

interface ModerationAction {
  id: string;
  moderator_id: string;
  target_user_id: string;
  channel_id?: string;
  action_type: ActionType;
  reason?: string;
  duration_minutes?: number;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
  target_user?: {
    full_name?: string;
    username?: string;
  };
}

interface MessageReport {
  id: string;
  reporter_id: string;
  message_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  community_messages?: {
    content: string;
    sender?: {
      full_name?: string;
      username?: string;
    };
  };
}

export const ModerationPanel: React.FC = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [actionType, setActionType] = useState<ActionType>('warn');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      // Load moderation actions with proper join to profiles table
      const { data: actionsData, error: actionsError } = await supabase
        .from('moderation_actions')
        .select(`
          id,
          moderator_id,
          target_user_id,
          channel_id,
          action_type,
          reason,
          duration_minutes,
          expires_at,
          created_at,
          is_active
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;

      // Load message reports with proper join
      const { data: reportsData, error: reportsError } = await supabase
        .from('message_reports')
        .select(`
          id,
          reporter_id,
          message_id,
          reason,
          status,
          created_at,
          community_messages (
            content
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportsError) throw reportsError;

      // Get user profiles for actions
      if (actionsData && actionsData.length > 0) {
        const userIds = [...new Set(actionsData.map(action => action.target_user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const actionsWithProfiles = actionsData.map(action => ({
          ...action,
          action_type: action.action_type as ActionType,
          target_user: profilesMap.get(action.target_user_id)
        }));

        setActions(actionsWithProfiles);
      } else {
        setActions([]);
      }

      // Process reports data
      const processedReports = (reportsData || []).map(report => ({
        ...report,
        status: report.status as ReportStatus
      }));
      
      setReports(processedReports);
      
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async () => {
    if (!selectedUser || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const actionData: any = {
        moderator_id: user?.id,
        target_user_id: selectedUser,
        action_type: actionType,
        reason: reason.trim(),
        is_active: true
      };

      if (actionType === 'timeout' && duration) {
        const durationMinutes = parseInt(duration);
        actionData.duration_minutes = durationMinutes;
        actionData.expires_at = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('moderation_actions')
        .insert(actionData);

      if (error) throw error;

      toast.success(`${actionType} action applied successfully`);
      setSelectedUser('');
      setReason('');
      setDuration('');
      loadModerationData();
    } catch (error) {
      console.error('Error applying moderation action:', error);
      toast.error('Failed to apply moderation action');
    }
  };

  const handleReportReview = async (reportId: string, status: ReportStatus) => {
    try {
      const { error } = await supabase
        .from('message_reports')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report marked as ${status}`);
      loadModerationData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading moderation panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Moderation Panel</h2>
      </div>

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="new-action">New Action</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-red-100">
                        {action.action_type === 'ban' && <Ban className="h-4 w-4 text-red-600" />}
                        {action.action_type === 'mute' && <MessageSquareX className="h-4 w-4 text-orange-600" />}
                        {action.action_type === 'warn' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                        {action.action_type === 'timeout' && <Clock className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {action.target_user?.full_name || action.target_user?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">{action.reason}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(action.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={action.is_active ? "destructive" : "secondary"}>
                      {action.action_type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
                {actions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No moderation actions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={report.status === 'pending' ? "destructive" : "secondary"}>
                        {report.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Reported Message:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        "{report.community_messages?.content}"
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Reason:</p>
                      <p className="text-sm text-gray-600">{report.reason}</p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportReview(report.id, 'reviewed')}
                        >
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportReview(report.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportReview(report.id, 'dismissed')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No reports to review</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-action" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apply Moderation Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  placeholder="Enter user ID"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Action Type</label>
                <Select value={actionType} onValueChange={(value: ActionType) => setActionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="mute">Mute</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                    <SelectItem value="kick">Kick</SelectItem>
                    <SelectItem value="ban">Ban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {actionType === 'timeout' && (
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  placeholder="Enter reason for this action"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button onClick={handleModerationAction} className="w-full">
                Apply Action
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
