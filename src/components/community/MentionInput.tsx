
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MentionInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock users for mentions - in real app, this would come from props or API
  const mockUsers = [
    { id: '1', username: 'john_doe', full_name: 'John Doe' },
    { id: '2', username: 'jane_smith', full_name: 'Jane Smith' },
    { id: '3', username: 'bob_wilson', full_name: 'Bob Wilson' }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    onTyping();

    // Check for mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  }, [onTyping]);

  const insertMention = useCallback((user: typeof mockUsers[0]) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPos);
    const textAfterCursor = message.slice(cursorPos);
    
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const newMessage = `${beforeMention}@${user.username} ${textAfterCursor}`;
      setMessage(newMessage);
      setShowMentions(false);
      setMentionQuery('');
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPos = beforeMention.length + user.username.length + 2;
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }, [message]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || disabled) return;
    
    const success = await onSendMessage(message);
    if (success) {
      setMessage('');
      setShowMentions(false);
      setMentionQuery('');
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="relative">
      {/* Mention suggestions */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => insertMention(user)}
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm">{user.full_name}</div>
                <div className="text-xs text-gray-500">@{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white max-h-32"
            rows={1}
            style={{
              minHeight: '40px',
              height: 'auto'
            }}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="sm"
          className="flex-shrink-0 h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
