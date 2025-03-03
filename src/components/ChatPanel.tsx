
import React, { useState } from "react";
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreHorizontal,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to the entrepreneur chat! Connect with other founders and share ideas.",
      sender: "system",
      timestamp: new Date()
    },
    {
      id: "2",
      content: "Hi everyone! I'm working on a new SaaS product for small businesses.",
      sender: "Jane",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "3",
      content: "That sounds interesting! What problem are you solving?",
      sender: "Mike",
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "You",
        timestamp: new Date()
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-lg overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageIcon size={16} />
          </div>
          <h3 className="font-medium">Entrepreneur Chat</h3>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={18} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 content-blur bg-gray-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex max-w-[80%] animate-slide-in",
              message.sender === "You" ? "ml-auto" : ""
            )}
          >
            {message.sender !== "You" && message.sender !== "system" && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <User size={14} className="text-gray-500" />
              </div>
            )}
            
            <div
              className={cn(
                "px-4 py-2 rounded-lg",
                message.sender === "system" 
                  ? "bg-gray-100 text-gray-600 border border-gray-200 mx-auto text-center text-sm" 
                  : message.sender === "You"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-100 shadow-sm"
              )}
            >
              {message.sender !== "You" && message.sender !== "system" && (
                <div className="font-semibold text-sm text-gray-700 mb-1">{message.sender}</div>
              )}
              <p className="text-sm">{message.content}</p>
              <div 
                className={cn(
                  "text-[10px] mt-1",
                  message.sender === "You" ? "text-white/70" : "text-gray-400"
                )}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <Paperclip size={18} />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border-gray-100 focus-visible:ring-primary"
          />
          
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <Smile size={18} />
          </Button>
          
          <Button 
            onClick={handleSendMessage} 
            size="sm" 
            className="bg-primary hover:bg-primary/90"
            disabled={!newMessage.trim()}
          >
            <Send size={16} className="mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M21 11.5C21 16.1944 16.9706 20 12 20C11.1161 20 10.2628 19.8971 9.4555 19.7049C9.21753 19.6547 8.97122 19.6292 8.72669 19.6292C8.41981 19.6292 8.11902 19.6767 7.83346 19.7675L4.86768 20.5166C4.80599 20.5336 4.73833 20.5418 4.67019 20.5307C4.60204 20.5196 4.5378 20.4895 4.48479 20.4436C4.43179 20.3977 4.39205 20.3378 4.37013 20.2704C4.3482 20.203 4.3449 20.1309 4.36045 20.0621L4.95432 17.6301C5.11418 17.0416 5.03456 16.413 4.73216 15.886C4.25818 15.0387 4 14.0802 4 13.0692C4 10.2082 5.78553 7.77194 8.39587 6.74529"
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M14 2.20004C13.3538 2.06886 12.6849 2 12 2C7.02944 2 3 5.80558 3 10.5C3 11.5109 3.25818 12.4694 3.73216 13.3167C4.03456 13.8437 4.11418 14.4723 3.95432 15.0608L3.36045 17.4927C3.3449 17.5616 3.3482 17.6337 3.37013 17.7011C3.39205 17.7685 3.43179 17.8283 3.48479 17.8743C3.5378 17.9202 3.60204 17.9503 3.67019 17.9614C3.73833 17.9725 3.80599 17.9642 3.86768 17.9473L6.83346 17.1981C7.11902 17.1074 7.41981 17.0599 7.72669 17.0599C7.97122 17.0599 8.21753 17.0854 8.4555 17.1356C9.2628 17.3278 10.1161 17.4307 11 17.4307C15.9706 17.4307 20 13.6251 20 8.93066C20 5.6287 17.6146 2.8263 14 2.20004Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);
