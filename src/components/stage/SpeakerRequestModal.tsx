
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Clock, MessageSquare } from 'lucide-react';

interface SpeakerRequest {
  id: string;
  stage_id: string;
  user_id: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

interface SpeakerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  stageName: string;
}

const SpeakerRequestModal: React.FC<SpeakerRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  stageId, 
  stageName 
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<SpeakerRequest | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      checkExistingRequest();
    }
  }, [isOpen, user, stageId]);

  const checkExistingRequest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('speaker_requests')
        .select('*')
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setExistingRequest(data);
      if (data?.message) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to request speaker access');
      return;
    }

    setIsLoading(true);
    
    try {
      if (existingRequest) {
        // Update existing request
        const { error } = await supabase
          .from('speaker_requests')
          .update({
            message: message.trim() || null,
            updated_at: new Date().toISOString(),
            status: 'pending'
          })
          .eq('id', existingRequest.id);

        if (error) throw error;
        toast.success('Speaker request updated successfully!');
      } else {
        // Create new request
        const { error } = await supabase
          .from('speaker_requests')
          .insert({
            stage_id: stageId,
            user_id: user.id,
            message: message.trim() || null,
            status: 'pending'
          });

        if (error) throw error;
        toast.success('Speaker request submitted successfully!');
      }

      onClose();
      setMessage('');
    } catch (error) {
      console.error('Error submitting speaker request:', error);
      toast.error('Failed to submit speaker request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Speaker Access</DialogTitle>
          <DialogDescription>
            Request to speak on stage: <strong>{stageName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {existingRequest && (
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Status</span>
              <Badge variant={getStatusColor(existingRequest.status)}>
                {existingRequest.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Requested on {new Date(existingRequest.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">
              Message to Host {existingRequest ? '(Optional - Update your request)' : '(Optional)'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the host why you'd like to speak..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                existingRequest ? 'Updating...' : 'Submitting...'
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {existingRequest ? 'Update Request' : 'Submit Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpeakerRequestModal;
