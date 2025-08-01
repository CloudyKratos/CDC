
import React from 'react';
import { Send, Loader2, Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModernMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = "Type a message...",
  isLoading = false
}) => {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-background via-muted/20 to-background border-t backdrop-blur-sm">
      <div className="flex items-end gap-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-10 w-10 p-0 rounded-xl hover:bg-muted/60 transition-all duration-200 flex-shrink-0"
          title="Add attachment"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Message input container */}
        <div className="flex-1 relative group">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-muted/30 border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-muted-foreground min-h-[48px] max-h-32 transition-all duration-300 shadow-sm hover:bg-muted/40 backdrop-blur-sm font-medium text-sm leading-relaxed"
            style={{
              height: 'auto',
              minHeight: '48px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Enhanced focus ring */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim() || isLoading}
          size="sm"
          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 flex-shrink-0 hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
