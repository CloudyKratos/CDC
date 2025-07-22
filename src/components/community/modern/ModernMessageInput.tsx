
import React from 'react';
import { Send, Loader2 } from 'lucide-react';
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
    <div className="flex items-end gap-4 p-6 bg-gradient-to-r from-background via-background to-background border-t border-border backdrop-blur-sm">
      <div className="flex-1 relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-5 py-4 pr-14 bg-muted/50 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-muted-foreground min-h-[52px] max-h-36 transition-all duration-300 shadow-sm focus:shadow-md hover:bg-muted/70 backdrop-blur-sm font-medium text-sm leading-relaxed"
          style={{
            height: 'auto',
            minHeight: '52px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 144) + 'px';
          }}
        />
        
        {/* Subtle gradient overlay for enhanced visual appeal */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
      </div>
      
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim() || isLoading}
        size="sm"
        className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 flex-shrink-0 hover-scale"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};
