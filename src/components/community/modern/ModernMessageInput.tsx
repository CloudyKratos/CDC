
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Smile } from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ModernMessageInputProps {
  onSendMessage: (content: string, attachments?: Array<{url: string, name: string, type: string, size: number}>) => Promise<boolean>;
  onStartTyping?: () => void;
  isConnected: boolean;
  isLoading: boolean;
  channelName: string;
  placeholder?: string;
  maxLength?: number;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  isConnected,
  isLoading,
  channelName,
  placeholder = "Type a message...",
  maxLength = 2000
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Array<{url: string, name: string, type: string, size: number}>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && attachments.length === 0) || isSending || !isConnected) {
      return;
    }

    setIsSending(true);
    
    try {
      let content = message.trim();
      
      // If there are attachments, add them to the message content
      if (attachments.length > 0) {
        const attachmentText = attachments.map(att => `[File: ${att.name}](${att.url})`).join('\n');
        content = content ? `${content}\n\n${attachmentText}` : attachmentText;
      }
      
      const success = await onSendMessage(content, attachments);
      
      if (success) {
        setMessage('');
        setAttachments([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Call onStartTyping if provided
    if (onStartTyping) {
      onStartTyping();
    }
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string, fileSize: number) => {
    setAttachments(prev => [...prev, { url: fileUrl, name: fileName, type: fileType, size: fileSize }]);
    toast.success(`File "${fileName}" attached`);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
              <span className="truncate max-w-32">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={!isConnected ? "Disconnected..." : placeholder}
            disabled={!isConnected || isSending}
            maxLength={maxLength}
            className="min-h-[44px] max-h-[120px] resize-none pr-20"
            rows={1}
          />
          
          {/* Character counter */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-12 text-xs text-gray-500">
              {message.length}/{maxLength}
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-1">
          <FileUploadButton
            onFileUploaded={handleFileUploaded}
            disabled={!isConnected || isSending}
          />
          
          <Button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || !isConnected || isSending}
            size="sm"
            className="h-11"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      {!isConnected && (
        <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Disconnected from {channelName}
        </div>
      )}
    </div>
  );
};
