
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Hand, Check, X } from 'lucide-react';
import StageService from '@/services/StageService';
import { ExtendedSpeakerRequest } from '@/types/supabase-extended';
import { toast } from 'sonner';

interface SpeakerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  onApprove: (userId: string) => void;
}

const SpeakerRequestModal: React.FC<SpeakerRequestModalProps> = ({
  isOpen,
  onClose,
  stageId,
  onApprove
}) => {
  const [requests, setRequests] = useState<ExtendedSpeakerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSpeakerRequests();
      setupRealTimeSubscription();
    }
  }, [isOpen, stageId]);

  const loadSpeakerRequests = async () => {
    setIsLoading(true);
    const requestsData = await StageService.getPendingSpeakerRequests(stageId);
    setRequests(requestsData);
    setIsLoading(false);
  };

  const setupRealTimeSubscription = () => {
    const channel = StageService.subscribeToSpeakerRequests(stageId, () => {
      loadSpeakerRequests();
    });

    return () => {
      channel.unsubscribe();
    };
  };

  const handleApprove = async (requestId: string, userId: string) => {
    const success = await StageService.respondToSpeakerRequest(requestId, true);
    if (success) {
      toast.success('Speaker request approved!');
      onApprove(userId);
      loadSpeakerRequests();
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleDeny = async (requestId: string) => {
    const success = await StageService.respondToSpeakerRequest(requestId, false);
    if (success) {
      toast.success('Speaker request denied');
      loadSpeakerRequests();
    } else {
      toast.error('Failed to deny request');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Speaker Requests
          </DialogTitle>
          <DialogDescription>
            Manage requests from audience members who want to speak.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 p-1">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Hand className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user_id}`} />
                      <AvatarFallback>
                        {request.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">
                        User {request.user_id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.requested_at && new Date(request.requested_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeny(request.id)}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(request.id, request.user_id)}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpeakerRequestModal;
