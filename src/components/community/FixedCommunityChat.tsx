
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityMessages } from '@/hooks/use-community-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Hash, Wifi, WifiOff, Users, AlertCircle, RefreshCw } from 'lucide-react';

interface FixedCommunityChatProps {
  defaultChannel?: string;
}

const FixedCommunityChat: React.FC<FixedCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage
  } = useCommunityMessages(defaultChannel);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isSending) return;
    if (!user?.id) {
      return;
    }

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const success = await sendMessage(messageToSend);
      if (!success) {
        // Restore message if send failed
        setInputMessage(messageToSend);
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Show error state
  if (error && user?.id) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthenticated state
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to participate in community discussions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold capitalize">{defaultChannel}</h3>
          <span className="text-sm text-gray-500">
            ({messages.length} messages)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Connection Status Alert */}
      {!isConnected && !isLoading && (
        <Alert className="m-4 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Connecting to real-time chat...
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Hash className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No messages yet. Be the first to say hello! 👋</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {message.sender?.username?.[0]?.toUpperCase() || 
                   message.sender?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.sender?.full_name || message.sender?.username || 'Community Member'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed break-words text-gray-700 dark:text-gray-300">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 dark:bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message #${defaultChannel}...`}
            className="flex-1"
            disabled={isSending || !isConnected}
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputMessage.trim() || isSending || !isConnected}
            className="shrink-0"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {inputMessage && (
          <p className="text-xs text-gray-500 mt-1">
            {inputMessage.length}/500 characters
          </p>
        )}
      </div>
    </div>
  );
};

export default FixedCommunityChat;
