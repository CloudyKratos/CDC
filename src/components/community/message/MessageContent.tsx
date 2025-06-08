
import React from 'react';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return (
    <div className="text-gray-800 dark:text-gray-200 leading-relaxed ml-16">
      <p className="whitespace-pre-line break-words text-base">{content}</p>
    </div>
  );
};

export default MessageContent;
