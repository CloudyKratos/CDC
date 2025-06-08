
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Mic } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SendButtonProps {
  hasMessage: boolean;
  isLoading: boolean;
  onClick: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({ 
  hasMessage, 
  isLoading, 
  onClick 
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="submit"
          size="icon"
          className={`flex-shrink-0 h-12 w-12 rounded-full transition-all duration-200 ${
            hasMessage 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
          disabled={!hasMessage || isLoading}
          onClick={onClick}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : hasMessage ? (
            <Send size={20} />
          ) : (
            <Mic size={20} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{hasMessage ? 'Send message (Enter)' : 'Voice message'}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SendButton;
