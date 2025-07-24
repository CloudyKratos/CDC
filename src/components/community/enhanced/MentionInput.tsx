
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface MentionInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isConnected?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  users?: User[];
}

export const MentionInput: React.FC<MentionInputProps> = ({
  onSendMessage,
  isConnected = true,
  isLoading = false,
  placeholder = "Type a message...",
  users = []
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !isConnected) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setMessage(value);
    setCursorPosition(position);

    // Check for @ mention
    const beforeCursor = value.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (user: User) => {
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    
    // Remove the partial @ mention
    const beforeMention = beforeCursor.replace(/@\w*$/, '');
    const newMessage = `${beforeMention}@${user.username} ${afterCursor}`;
    
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = beforeMention.length + user.username.length + 2;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const isDisabled = !isConnected || isSending || isLoading;

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end p-4 border-t border-border bg-background">
        <div className="flex-1 relative">
          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverTrigger asChild>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={isDisabled ? "Connecting..." : placeholder}
                disabled={isDisabled}
                className="min-h-[40px] max-h-[120px] resize-none pr-12"
                rows={1}
              />
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0" 
              align="start"
              side="top"
              sideOffset={5}
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {filteredUsers.length > 0 ? (
                    <CommandGroup heading="Mention user">
                      {filteredUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => insertMention(user)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>No users found.</CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || isDisabled}
          size="sm"
          className="shrink-0"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {!isConnected && (
        <div className="absolute bottom-0 left-0 right-0 bg-destructive/10 text-destructive text-xs p-2 border-t border-destructive/20">
          Reconnecting...
        </div>
      )}
    </div>
  );
};
