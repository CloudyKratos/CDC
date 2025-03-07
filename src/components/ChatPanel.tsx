
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Phone,
  Video,
  Info,
  Search,
  Mic,
  Download,
  Reply,
  Check,
  CheckCheck,
  Clock,
  Star,
  Forward,
  Trash,
  Pin,
  Copy,
  MessageSquare,
  Camera,
  Sticker,
  Gift,
  Play // Added missing Play icon import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read" | "pending";
  replyingTo?: Message | null;
  attachments?: {
    type: "document" | "image" | "audio";
    name: string;
    url: string;
    size?: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: Date;
  typing?: boolean;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
}

const EMOJIS = ["😊", "😂", "❤️", "😂", "🔥", "🎉", "😍", "🙏", "😮", "😢", "👏", "🤔"];

export const ChatPanel: React.FC<{channelType?: string}> = ({ channelType = "community" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>(getDefaultMessages());
  const [contacts, setContacts] = useState<Contact[]>(getDefaultContacts());
  const [newMessage, setNewMessage] = useState("");
  const [fileUploads, setFileUploads] = useState<{
    type: "document" | "image" | "audio";
    name: string;
    url: string;
    size?: string;
  }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedContact]);

  function getDefaultContacts(): Contact[] {
    if (channelType === "community") {
      return [
        {
          id: "1",
          name: "Community Channel",
          avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Community",
          status: "online",
          unreadCount: 3,
          isPinned: true
        }
      ];
    }
    
    return [
      {
        id: "1",
        name: "Community Channel",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Community",
        status: "online",
        unreadCount: 3,
        isPinned: true
      },
      {
        id: "2",
        name: "Design Team",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Design",
        status: "online",
        unreadCount: 5
      },
      {
        id: "3",
        name: "Development Squad",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Dev",
        status: "online",
        typing: true
      },
      {
        id: "4",
        name: "Marketing",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Marketing",
        status: "away",
        lastSeen: new Date(Date.now() - 1000 * 60 * 30),
        isMuted: true
      },
      {
        id: "5",
        name: "Product Team",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Product",
        status: "offline",
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3)
      }
    ];
  }

  function getDefaultMessages(): Message[] {
    return [
      {
        id: "1",
        content: "Welcome to our community channel! This is where we collaborate and share ideas.",
        sender: "system",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: "read"
      },
      {
        id: "2",
        content: "Hey everyone! I just joined the platform. Excited to be here and collaborate with you all.",
        sender: "Emily",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        status: "read",
        reactions: [
          { emoji: "👋", count: 5, reacted: true },
          { emoji: "🎉", count: 3, reacted: false }
        ]
      },
      {
        id: "3",
        content: "Welcome Emily! Great to have you here. Let me know if you need any help getting started.",
        sender: "David",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11),
        status: "read"
      },
      {
        id: "4",
        content: "I've been working on our new design system. Check out these guidelines I've put together.",
        sender: "Alex",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        status: "read",
        attachments: [
          {
            type: "document",
            name: "design-guidelines.pdf",
            url: "#",
            size: "2.4 MB"
          }
        ]
      },
      {
        id: "5",
        content: "I took some screenshots of the new UI. What do you all think?",
        sender: "Sarah",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
        status: "delivered",
        attachments: [
          {
            type: "image",
            name: "dashboard-ui.jpg",
            url: "https://placehold.co/600x400/e2e8f0/1e293b?text=Dashboard+UI",
            size: "1.2 MB"
          },
          {
            type: "image",
            name: "profile-ui.jpg",
            url: "https://placehold.co/600x400/e2e8f0/1e293b?text=Profile+UI",
            size: "0.9 MB"
          }
        ],
        reactions: [
          { emoji: "🔥", count: 7, reacted: true },
          { emoji: "👍", count: 4, reacted: true }
        ]
      },
      {
        id: "6",
        content: "These look amazing, Sarah! The new dashboard layout is so much cleaner.",
        sender: "You",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: "read"
      },
      {
        id: "7",
        content: "Thanks! I'm still working on the mobile responsive views.",
        sender: "Sarah",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        status: "read"
      },
      {
        id: "8",
        content: "I recorded a quick voice note explaining some of the design decisions.",
        sender: "Sarah",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        status: "read",
        attachments: [
          {
            type: "audio",
            name: "design-explanation.mp3",
            url: "#",
            size: "1.5 MB"
          }
        ]
      },
      {
        id: "9",
        content: "Just a reminder that we have our weekly sync tomorrow at 10 AM.",
        sender: "David",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        status: "delivered"
      }
    ];
  }
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = () => {
    if (newMessage.trim() || fileUploads.length > 0) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: "You",
        timestamp: new Date(),
        status: "pending",
        replyingTo: replyingTo,
        attachments: fileUploads.length > 0 ? [...fileUploads] : undefined
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
      setFileUploads([]);
      setReplyingTo(null);
      
      // Update message status after a delay
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: "sent" } 
              : msg
          )
        );
      }, 500);
      
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: "delivered" } 
              : msg
          )
        );
      }, 1500);
      
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: "read" } 
              : msg
          )
        );
      }, 3000);
      
      // Simulate a reply
      if (Math.random() > 0.5) {
        setTimeout(() => {
          const names = ["Emily", "David", "Alex", "Sarah"];
          const randomName = names[Math.floor(Math.random() * names.length)];
          const replies = [
            "Thanks for sharing!",
            "That's interesting!",
            "I agree with that.",
            "Good point!",
            "Let's discuss this more tomorrow.",
            "I'll look into this."
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          
          const replyMessage: Message = {
            id: Date.now().toString(),
            content: randomReply,
            sender: randomName,
            timestamp: new Date(),
            status: "delivered"
          };
          
          setMessages(prev => [...prev, replyMessage]);
        }, 5000);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "document" | "image" | "audio") => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUploads = Array.from(files).map(file => ({
        type,
        name: file.name,
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size)
      }));
      
      setFileUploads([...fileUploads, ...newUploads]);
      
      toast({
        title: `${files.length} file${files.length > 1 ? 's' : ''} attached`,
        description: "Ready to send",
      });
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const removeAttachment = (index: number) => {
    const newUploads = [...fileUploads];
    newUploads.splice(index, 1);
    setFileUploads(newUploads);
  };
  
  const handleAttachClick = (type: "document" | "image" | "audio") => {
    if (type === "document" && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === "image" && imageInputRef.current) {
      imageInputRef.current.click();
    } else if (type === "audio" && audioInputRef.current) {
      audioInputRef.current.click();
    }
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === messageId) {
          const existingReactions = message.reactions || [];
          const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
          
          let updatedReactions;
          if (reactionIndex >= 0) {
            const reaction = existingReactions[reactionIndex];
            if (reaction.reacted) {
              updatedReactions = existingReactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r
              ).filter(r => r.count > 0);
            } else {
              updatedReactions = existingReactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r
              );
            }
          } else {
            updatedReactions = [...existingReactions, { emoji, count: 1, reacted: true }];
          }
          
          return { ...message, reactions: updatedReactions };
        }
        return message;
      })
    );
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Press the stop button when you're finished.",
    });
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // In a real app, we would process the audio here
    setFileUploads([...fileUploads, {
      type: "audio",
      name: "voice-message.mp3",
      url: "#",
      size: "0.8 MB"
    }]);
    
    toast({
      title: "Voice message recorded",
      description: "Ready to send",
    });
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    // In a real app, we would load messages for this contact
    // For now, we'll just use our default messages
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={12} className="text-gray-400" />;
      case "sent":
        return <Check size={12} className="text-gray-400" />;
      case "delivered":
        return <CheckCheck size={12} className="text-gray-400" />;
      case "read":
        return <CheckCheck size={12} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const replyToMessage = (message: Message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const forwardMessage = (message: Message) => {
    toast({
      title: "Message forwarded",
      description: "Select a contact to forward to.",
    });
  };

  const copyMessageText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
      });
    });
  };

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    toast({
      title: "Message deleted",
    });
  };

  const starMessage = (messageId: string) => {
    toast({
      title: "Message starred",
    });
  };

  const renderMessageStatus = (message: Message) => {
    if (message.sender === "You") {
      return (
        <span className="ml-1">{getStatusIcon(message.status)}</span>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden animate-scale-in glass-morphism">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 glass-morphism">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg gradient-text">Messages</h3>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setIsSearching(!isSearching)}
              >
                <Search size={16} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-morphism">
                  <DropdownMenuItem>New Chat</DropdownMenuItem>
                  <DropdownMenuItem>New Group</DropdownMenuItem>
                  <DropdownMenuItem>Archived Chats</DropdownMenuItem>
                  <DropdownMenuItem>Starred Messages</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {isSearching && (
            <div className="mb-2 animate-fade-in">
              <Input 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
              />
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center p-2.5 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 group animate-fade-in",
                  selectedContact?.id === contact.id && "bg-gray-50 dark:bg-gray-800"
                )}
                onClick={() => selectContact(contact)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-all">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {contact.status !== "offline" && (
                    <span className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
                      contact.status === "online" ? "bg-green-500" : 
                      contact.status === "away" ? "bg-yellow-500" : 
                      "bg-red-500"
                    )}></span>
                  )}
                </div>
                
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h4 className={cn(
                      "font-medium text-sm truncate",
                      contact.unreadCount ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {contact.name}
                    </h4>
                    <div className="flex items-center">
                      {contact.isPinned && <Pin size={12} className="text-primary mr-1" />}
                      {contact.isMuted && <Mic size={12} className="text-gray-400 mr-1" />}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {contact.lastSeen ? formatDate(contact.lastSeen) : ""}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={cn(
                      "text-xs truncate",
                      contact.unreadCount ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {contact.typing ? (
                        <span className="text-primary flex items-center">
                          typing
                          <span className="flex space-x-1 ml-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                          </span>
                        </span>
                      ) : (
                        <>Latest message preview</>
                      )}
                    </p>
                    {contact.unreadCount ? (
                      <Badge className="bg-primary text-white text-xs h-5 min-w-[20px] flex items-center justify-center rounded-full">
                        {contact.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 glass-morphism">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-1 lg:hidden h-8 w-8"
                onClick={() => setSelectedContact(null)}
              >
                <ArrowLeft size={16} />
              </Button>
              
              <Avatar className="h-9 w-9">
                <AvatarImage src={selectedContact.avatar} />
                <AvatarFallback>{selectedContact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h3 className="font-medium text-sm flex items-center">
                  {selectedContact.name}
                  {selectedContact.isPinned && (
                    <Pin size={12} className="text-primary ml-1.5" />
                  )}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  {selectedContact.status === "online" ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                      Online
                    </>
                  ) : selectedContact.status === "away" ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full inline-block mr-1"></span>
                      Away
                    </>
                  ) : selectedContact.status === "busy" ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block mr-1"></span>
                      Busy
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block mr-1"></span>
                      {selectedContact.lastSeen ? `Last seen ${formatTime(selectedContact.lastSeen)}` : "Offline"}
                    </>
                  )}
                  
                  {selectedContact.typing && (
                    <span className="text-primary ml-2 flex items-center">
                      typing
                      <span className="flex space-x-1 ml-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Search size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Search in conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Phone size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Voice call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Video size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Video call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsInfoOpen(true)}
                  >
                    <Info size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass-morphism">
                  <div className="flex flex-col items-center py-4">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback>{selectedContact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedContact.status === "online" ? "Online" : 
                       selectedContact.lastSeen ? `Last seen ${formatDate(selectedContact.lastSeen)} at ${formatTime(selectedContact.lastSeen)}` : 
                       "Offline"}
                    </p>
                    
                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <MessageSquare size={16} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <Phone size={16} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <Video size={16} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <Search size={16} />
                      </Button>
                    </div>
                    
                    <div className="w-full mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mute notifications</span>
                        <Button variant="ghost" size="sm">
                          {selectedContact.isMuted ? "Unmute" : "Mute"}
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Starred messages</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Shared media</span>
                        <Button variant="ghost" size="sm">View all</Button>
                      </div>
                    </div>
                    
                    <Button variant="destructive" className="mt-6">Block Contact</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 content-blur bg-gray-50/50 dark:bg-gray-900/50">
            {messages.map((message, index) => {
              // Check if we need to show a date header
              let showDateHeader = false;
              if (index === 0) {
                showDateHeader = true;
              } else {
                const prevMessage = messages[index - 1];
                const prevDate = new Date(prevMessage.timestamp).toDateString();
                const currentDate = new Date(message.timestamp).toDateString();
                if (prevDate !== currentDate) {
                  showDateHeader = true;
                }
              }
              
              return (
                <React.Fragment key={message.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "group animate-fade-in",
                    message.sender === "system" 
                      ? "flex justify-center" 
                      : message.sender === "You" 
                        ? "flex justify-end" 
                        : "flex justify-start"
                  )}>
                    {message.sender !== "You" && message.sender !== "system" && (
                      <div className="mt-1 mr-2 flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} />
                          <AvatarFallback>{message.sender.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[75%] relative",
                      message.sender === "system" && "w-4/5 md:w-2/3"
                    )}>
                      {/* Reply indicator */}
                      {message.replyingTo && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-600 dark:text-gray-300 mb-1 border-l-2 border-primary">
                          <span className="font-semibold">Replying to {message.replyingTo.sender}</span>
                          <p className="truncate">{message.replyingTo.content}</p>
                        </div>
                      )}
                      
                      <div className={cn(
                        "px-4 py-2.5 rounded-lg relative",
                        message.sender === "system" 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-center text-sm" 
                          : message.sender === "You"
                            ? "bg-primary text-white dark:bg-primary/90"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                      )}>
                        {message.sender !== "You" && message.sender !== "system" && (
                          <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {message.sender}
                          </div>
                        )}
                        
                        <div className="text-sm whitespace-pre-wrap text-balance">{message.content}</div>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div 
                                key={index}
                                className={cn(
                                  "rounded overflow-hidden relative group/attachment",
                                  attachment.type === "image" 
                                    ? "mb-1" 
                                    : "p-3 flex items-center border",
                                  message.sender === "You" 
                                    ? attachment.type === "image" 
                                      ? "" 
                                      : "bg-white/10 hover:bg-white/20 border-white/10" 
                                    : attachment.type === "image" 
                                      ? "" 
                                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-100 dark:border-gray-600"
                                )}
                              >
                                {attachment.type === "image" ? (
                                  <>
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.name} 
                                      className="rounded w-full object-cover max-h-[300px]" 
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/attachment:bg-black/30 flex items-center justify-center opacity-0 group-hover/attachment:opacity-100 transition-all">
                                      <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="bg-white/90 hover:bg-white text-black"
                                      >
                                        <Download size={14} className="mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </>
                                ) : attachment.type === "audio" ? (
                                  <>
                                    <Mic size={18} className={message.sender === "You" ? "text-white/80" : "text-gray-500 dark:text-gray-400"} />
                                    <div className="ml-2 flex-1">
                                      <div className="text-xs">{attachment.name}</div>
                                      <div className="flex items-center">
                                        <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                                          <div className="h-full w-1/3 bg-primary rounded-full"></div>
                                        </div>
                                        <span className="text-xs ml-2">{attachment.size}</span>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className={cn(
                                        "ml-2 h-7 w-7 p-0 rounded-full",
                                        message.sender === "You" 
                                          ? "text-white/70 hover:text-white hover:bg-white/10" 
                                          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      )}
                                    >
                                      <Play size={14} />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <FileText size={18} className={message.sender === "You" ? "text-white/80" : "text-gray-500 dark:text-gray-400"} />
                                    <span className="text-xs ml-2 truncate flex-1">{attachment.name}</span>
                                    <span className="text-xs mr-2">{attachment.size}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className={cn(
                                        "ml-auto h-6 w-6 p-0 rounded-full",
                                        message.sender === "You" 
                                          ? "text-white/70 hover:text-white hover:bg-white/10" 
                                          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      )}
                                    >
                                      <Download size={12} />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Message Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <button
                                key={index}
                                onClick={() => toggleReaction(message.id, reaction.emoji)}
                                className={cn(
                                  "text-xs rounded-full px-1.5 py-0.5 flex items-center space-x-1 transition-colors",
                                  reaction.reacted 
                                    ? "bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground" 
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                )}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end mt-1">
                          <span className={cn(
                            "text-[10px]",
                            message.sender === "You" ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                          )}>
                            {formatTime(message.timestamp)}
                            {renderMessageStatus(message)}
                          </span>
                        </div>
                        
                        {/* Message Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700",
                                message.sender === "system" && "hidden"
                              )}
                            >
                              <MoreHorizontal size={12} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-morphism">
                            <DropdownMenuItem onClick={() => replyToMessage(message)}>
                              <Reply size={14} className="mr-2" />
                              <span>Reply</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => forwardMessage(message)}>
                              <Forward size={14} className="mr-2" />
                              <span>Forward</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => starMessage(message.id)}>
                              <Star size={14} className="mr-2" />
                              <span>Star</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyMessageText(message.content)}>
                              <Copy size={14} className="mr-2" />
                              <span>Copy</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash size={14} className="mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Reply interface */}
          {replyingTo && (
            <div className="px-4 pt-3 pb-1 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-1 pl-2 border-l-2 border-primary">
                  <div className="text-xs font-medium text-primary">
                    Replying to {replyingTo.sender}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {replyingTo.content}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400"
                  onClick={() => setReplyingTo(null)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
          
          {/* Attachments preview */}
          {fileUploads.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-wrap gap-2">
                {fileUploads.map((file, index) => (
                  <div key={index} className="flex items-center bg-white dark:bg-gray-700 p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 pr-2 glass-morphism">
                    {file.type === "document" ? (
                      <FileText size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                    ) : file.type === "audio" ? (
                      <Mic size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                    ) : (
                      <ImageIcon size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                    )}
                    <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 rounded-full"
                      onClick={() => removeAttachment(index)}
                    >
                      <X size={10} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 glass-morphism">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full">
                    <Paperclip size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="glass-morphism">
                  <DropdownMenuItem onClick={() => handleAttachClick("document")}>
                    <FileText size={14} className="mr-2" />
                    <span>Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAttachClick("image")}>
                    <ImageIcon size={14} className="mr-2" />
                    <span>Photo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAttachClick("image")}>
                    <Camera size={14} className="mr-2" />
                    <span>Camera</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Sticker size={14} className="mr-2" />
                    <span>Sticker</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Gift size={14} className="mr-2" />
                    <span>Gift</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} />
              </Button>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 glass-morphism z-10">
                  <div className="flex flex-wrap gap-1 max-w-[240px]">
                    {EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-md"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex-1 relative">
                <Input
                  ref={messageInputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-10"
                />
              </div>
              
              {newMessage.trim() ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-primary text-white rounded-full"
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full",
                    isRecording && "text-red-500 hover:text-red-600"
                  )}
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                >
                  <Mic size={18} />
                </Button>
              )}
            </div>
          </div>
          
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileUpload(e, "document")}
          />
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
          />
          <input
            type="file"
            ref={audioInputRef}
            className="hidden"
            accept="audio/*"
            onChange={(e) => handleFileUpload(e, "audio")}
          />
        </div>
      ) : (
        // No contact selected view
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-center max-w-md p-6">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a contact from the sidebar to start chatting or create a new conversation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
