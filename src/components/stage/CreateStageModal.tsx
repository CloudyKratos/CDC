
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import StageService from '@/services/StageService';
import StageFormFields from './components/StageFormFields';

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStageCreated: () => void;
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({
  isOpen,
  onClose,
  onStageCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
    maxSpeakers: 10,
    maxAudience: 100,
    allowHandRaising: true,
    recordingEnabled: false,
    startImmediately: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Stage title is required');
      return;
    }

    setIsLoading(true);
    try {
      let scheduled_start_time;
      if (formData.scheduledDate && formData.scheduledTime && !formData.startImmediately) {
        const [hours, minutes] = formData.scheduledTime.split(':');
        scheduled_start_time = new Date(formData.scheduledDate);
        scheduled_start_time.setHours(parseInt(hours), parseInt(minutes));
      }

      await StageService.createStage({
        title: formData.title,
        description: formData.description,
        topic: formData.topic,
        scheduled_start_time: scheduled_start_time?.toISOString(),
        max_speakers: formData.maxSpeakers,
        max_audience: formData.maxAudience,
        allow_hand_raising: formData.allowHandRaising,
        recording_enabled: formData.recordingEnabled
      });

      toast.success('Stage created successfully!');
      onStageCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating stage:', error);
      toast.error('Failed to create stage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      title: '',
      description: '',
      topic: '',
      scheduledDate: undefined,
      scheduledTime: '',
      maxSpeakers: 10,
      maxAudience: 100,
      allowHandRaising: true,
      recordingEnabled: false,
      startImmediately: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Stage</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <StageFormFields formData={formData} setFormData={setFormData} />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : (formData.startImmediately ? 'Create & Start' : 'Schedule Stage')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStageModal;
