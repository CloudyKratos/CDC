
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Code, Link } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormattingToolbarProps {
  onFormatting: (format: string) => void;
  messageLength: number;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ 
  onFormatting, 
  messageLength 
}) => {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFormatting('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Bold</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFormatting('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Italic</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFormatting('code')}
              className="h-8 w-8 p-0"
            >
              <Code size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Inline code</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFormatting('link')}
              className="h-8 w-8 p-0"
            >
              <Link size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Add link</p></TooltipContent>
        </Tooltip>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
        {messageLength}/2000
      </div>
    </div>
  );
};

export default FormattingToolbar;
