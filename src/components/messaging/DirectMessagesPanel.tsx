
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import NewConversationModal from './NewConversationModal';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DirectMessagesPanel: React.FC = () => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  const { user } = useAuth();
  const { conversations, isLoading, isConnected, loadConversations } = useDirectMessages();

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Sign in to access messages
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            You need to be signed in to send and receive direct messages.
          </p>
        </div>
      </div>
    );
  }

  const handleNewConversation = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    setShowNewConversation(false);
    loadConversations();
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </h2>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => setShowNewConversation(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedRecipientId={selectedRecipientId}
            onSelectConversation={setSelectedRecipientId}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedRecipientId ? (
          <MessageArea
            recipientId={selectedRecipientId}
            onClose={() => setSelectedRecipientId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Choose a conversation from the sidebar or start a new one.
              </p>
              <Button onClick={() => setShowNewConversation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSelectUser={handleNewConversation}
      />
    </div>
  );
};

export default DirectMessagesPanel;
