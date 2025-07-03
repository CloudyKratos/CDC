
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  allowMultiple: boolean;
  expiresAt?: string;
  createdBy: string;
}

interface PollMessageProps {
  poll: PollData;
  currentUserId: string;
  onVote: (pollId: string, optionId: string) => void;
  className?: string;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  poll,
  currentUserId,
  onVote,
  className = ''
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const userVotes = poll.options.flatMap(opt => 
    opt.voters.includes(currentUserId) ? [opt.id] : []
  );
  const hasVoted = userVotes.length > 0;

  const handleVote = (optionId: string) => {
    if (hasVoted && !poll.allowMultiple) return;
    
    if (poll.allowMultiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(prev => prev.filter(id => id !== optionId));
      } else {
        setSelectedOptions(prev => [...prev, optionId]);
      }
    } else {
      onVote(poll.id, optionId);
    }
  };

  const submitMultipleVotes = () => {
    selectedOptions.forEach(optionId => {
      onVote(poll.id, optionId);
    });
    setSelectedOptions([]);
  };

  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;
  };

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 ${className}`}>
      <div className="flex items-start gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {poll.question}
          </h4>
          
          <div className="space-y-2">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.votes);
              const isSelected = selectedOptions.includes(option.id);
              const hasUserVoted = option.voters.includes(currentUserId);
              
              return (
                <div key={option.id} className="space-y-1">
                  <Button
                    variant={hasUserVoted ? "secondary" : isSelected ? "outline" : "ghost"}
                    className={`w-full justify-between h-auto p-3 text-left ${
                      hasVoted && !hasUserVoted ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleVote(option.id)}
                    disabled={isExpired || (hasVoted && !poll.allowMultiple)}
                  >
                    <span className="flex-1">{option.text}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.votes} votes ({percentage.toFixed(0)}%)
                    </span>
                  </Button>
                  
                  {hasVoted && (
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {poll.allowMultiple && selectedOptions.length > 0 && !hasVoted && (
            <Button 
              onClick={submitMultipleVotes}
              className="mt-3 w-full"
              size="sm"
            >
              Submit Votes ({selectedOptions.length})
            </Button>
          )}
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{poll.totalVotes} total votes</span>
            </div>
            {poll.expiresAt && (
              <span>
                {isExpired ? 'Expired' : `Expires ${new Date(poll.expiresAt).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
