import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Loading skeleton for a single message
export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => (
  <div className={`flex gap-3 p-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
    <Avatar className="h-8 w-8 flex-shrink-0">
      <AvatarFallback>
        <Skeleton className="h-full w-full rounded-full" />
      </AvatarFallback>
    </Avatar>
    <div className={`flex flex-col gap-2 max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className={`h-10 rounded-lg ${isOwn ? 'bg-primary/20' : 'bg-muted'} w-32`} />
    </div>
  </div>
);

// Loading state for message list
export const MessagesLoadingSkeleton: React.FC = () => (
  <div className="space-y-2 p-2">
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
  </div>
);

// Empty state for no messages
export const EmptyMessagesState: React.FC<{ onStartConversation?: () => void }> = ({ 
  onStartConversation 
}) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-muted-foreground max-w-md px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
      <p className="text-sm mb-4">
        Start the conversation! Send a message to get things going.
      </p>
      {onStartConversation && (
        <button 
          onClick={onStartConversation}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          Send your first message
        </button>
      )}
    </div>
  </div>
);

// Error state for failed message loading
export const MessagesErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void 
}> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-muted-foreground max-w-md px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
      <p className="text-sm mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try again
      </button>
    </div>
  </div>
);