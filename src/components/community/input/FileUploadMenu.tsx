
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Image,
  Gift,
  Paperclip
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

interface FileUploadMenuProps {
  onFileUpload: (files: FileList) => void;
}

const FileUploadMenu: React.FC<FileUploadMenuProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (onFileUpload) {
        onFileUpload(files);
      } else {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        toast.success(`Files selected: ${fileNames}`, {
          description: "File sharing feature coming soon!"
        });
      }
    }
    if (e.target) e.target.value = '';
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-12 w-12 rounded-full"
          >
            <PlusCircle size={22} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleFileUpload}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => toast.info("Image upload coming soon!")}
            >
              <Image className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => toast.info("GIF feature coming soon!")}
            >
              <Gift className="mr-2 h-4 w-4" />
              Add GIF
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileChange}
      />
    </>
  );
};

export default FileUploadMenu;
