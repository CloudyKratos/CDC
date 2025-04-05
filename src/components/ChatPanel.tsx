import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MessagesHeader from './MessagesHeader';
import EmojiPicker from './EmojiPicker';
import Icons from '@/utils/IconUtils';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isAdmin: boolean;
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  reaction?: string;
  media?: {
    type: 'image' | 'audio' | 'document';
    url: string;
    name?: string;
    size?: string;
  };
}

export const ChatPanel = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://github.com/shadcn.png',
      lastMessage: 'Let me know your thoughts on the proposal',
      lastMessageTime: '09:45',
      unreadCount: 2,
      isOnline: true,
      isAdmin: true
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://avatars.githubusercontent.com/u/124599?s=48&v=4',
      lastMessage: 'Do you have time for a quick call?',
      lastMessageTime: '08:30',
      unreadCount: 0,
      isOnline: false,
      isAdmin: true
    },
    {
      id: '3',
      name: 'CDC Warriors',
      avatar: 'https://avatars.githubusercontent.com/u/1500684?s=48&v=4',
      lastMessage: "Emma: I'll be joining the meeting shortly",
      lastMessageTime: 'Yesterday',
      unreadCount: 5,
      isOnline: true,
      isAdmin: false
    },
    {
      id: '4',
      name: 'Product Team',
      avatar: 'https://avatars.githubusercontent.com/u/6764957?s=48&v=4',
      lastMessage: "Alex: Here's the latest design update",
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: true,
      isAdmin: false,
      isTyping: true
    },
    {
      id: '5',
      name: 'Jane Smith',
      avatar: 'https://avatars.githubusercontent.com/u/810438?s=48&v=4',
      lastMessage: 'Thanks for your help!',
      lastMessageTime: 'Monday',
      unreadCount: 0,
      isOnline: false,
      isAdmin: true
    },
  ]);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      handleSelectContact(contacts[0]);
    }
  }, [contacts, activeContact]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSelectContact = (contact: Contact) => {
    setActiveContact(contact);
    
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: contact.id,
        text: 'Hey there! How are you?',
        timestamp: '09:30',
        isRead: true
      },
      {
        id: '2',
        senderId: 'me',
        text: 'I\'m doing well, thanks for asking!',
        timestamp: '09:31',
        isRead: true
      },
      {
        id: '3',
        senderId: contact.id,
        text: 'Great to hear. Do you have time to discuss the project?',
        timestamp: '09:35',
        isRead: true
      },
      {
        id: '4',
        senderId: 'me',
        text: 'Sure, I\'m available now. What aspects do you want to go over?',
        timestamp: '09:38',
        isRead: true
      },
      {
        id: '5',
        senderId: contact.id,
        text: 'Let\'s discuss the roadmap and key milestones. I want to make sure we\'re aligned on priorities.',
        timestamp: '09:40',
        isRead: true
      }
    ];
    
    if (contact.id === '1') {
      mockMessages.push(
        {
          id: '6',
          senderId: contact.id,
          text: '',
          timestamp: '09:42',
          isRead: true,
          media: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBtZWV0aW5nfGVufDB8fDB8fHww',
          }
        },
        {
          id: '7',
          senderId: 'me',
          text: 'Thanks for sharing the meeting photo!',
          timestamp: '09:43',
          isRead: true
        },
        {
          id: '8',
          senderId: contact.id,
          text: 'Here\'s the project proposal document',
          timestamp: '09:44',
          isRead: true,
          media: {
            type: 'document',
            url: '#',
            name: 'Project_Proposal.pdf',
            size: '2.4 MB'
          }
        }
      );
    }
    
    setContacts(prevContacts => 
      prevContacts.map(c => 
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    );
    
    setMessages(mockMessages);
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() && activeContact) {
      const newMsg: Message = {
        id: (messages.length + 1).toString(),
        senderId: 'me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setShowEmojiPicker(false);
      
      if (Math.random() > 0.4) {
        setTimeout(() => {
          setContacts(prevContacts => 
            prevContacts.map(c => 
              c.id === activeContact.id ? { ...c, isTyping: true } : c
            )
          );
          
          setTimeout(() => {
            const reply: Message = {
              id: (messages.length + 2).toString(),
              senderId: activeContact.id,
              text: getRandomReply(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: true
            };
            
            setMessages(prevMessages => [...prevMessages, reply]);
            setContacts(prevContacts => 
              prevContacts.map(c => 
                c.id === activeContact.id ? { ...c, isTyping: false } : c
              )
            );
          }, 2000);
        }, 2000);
      }
    }
  };
  
  const getRandomReply = () => {
    const replies = [
      "Thanks for sharing that!",
      "I appreciate your input on this matter.",
      "Interesting perspective. Let me think about it.",
      "That makes sense. Let's proceed with that plan.",
      "I agree with your approach.",
      "Could you elaborate on that point?",
      "Let me get back to you soon with more details.",
      "Great! I'll update the team on our progress."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleAttachMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeContact) {
      let mediaType: 'image' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) mediaType = 'image';
      if (file.type.startsWith('audio/')) mediaType = 'audio';
      
      const url = URL.createObjectURL(file);
      
      const newMsg: Message = {
        id: (messages.length + 1).toString(),
        senderId: 'me',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        media: {
          type: mediaType,
          url: url,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        }
      };
      
      setMessages([...messages, newMsg]);
      
      e.target.value = '';
    }
  };
  
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(message => 
      message.id === messageId
        ? { ...message, reaction: emoji }
        : message
    ));
  };
  
  const handleDeleteMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowAlertDialog(true);
  };
  
  const confirmDeleteMessage = () => {
    if (selectedMessageId) {
      setMessages(messages.filter(message => message.id !== selectedMessageId));
      setShowAlertDialog(false);
      setSelectedMessageId(null);
      
      toast.success("Message deleted");
    }
  };
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getMessageClass = (senderId: string) => {
    return senderId === 'me'
      ? 'chat-message-user ml-auto bg-primary/90 text-white'
      : 'chat-message-other bg-gray-100 dark:bg-gray-800';
  };
  
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👏', '🤔'];
  
  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-20">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="w-80 border-r dark:border-gray-800 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm relative z-10">
        <div className="p-4 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chats</h2>
            <Button variant="ghost" size="icon">
              <Icons.Plus size={18} />
            </Button>
          </div>
          <div className="relative">
            <Input 
              placeholder="Search chats..." 
              className="pl-9 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icons.Search 
              size={16} 
              className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="pt-2">
            <Tabs defaultValue="all">
              <TabsList className="w-full justify-start px-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="m-0 p-0">
                
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    className={`w-full text-left p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors ${
                      activeContact?.id === contact.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                    }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${contact.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {contact.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {contact.isTyping ? (
                            <span className="text-primary font-medium flex items-center">
                              <span className="mr-1">Typing</span>
                              <span className="typing-animation">...</span>
                            </span>
                          ) : (
                            contact.lastMessage
                          )}
                        </p>
                        {contact.unreadCount > 0 && (
                          <Badge className="ml-2 px-2">{contact.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredContacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                    <Icons.Search className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">No contacts found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unread" className="m-0 p-0">
                {filteredContacts.filter(contact => contact.unreadCount > 0).length > 0 ? (
                  filteredContacts
                    .filter(contact => contact.unreadCount > 0)
                    .map(contact => (
                      <button
                        key={contact.id}
                        className={`w-full text-left p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors ${
                          activeContact?.id === contact.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                        }`}
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback>{contact.name[0]}</AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className={`font-medium truncate ${contact.unreadCount > 0 ? 'font-bold' : ''}`}>
                                {contact.name}
                              </p>
                              <Badge variant="outline" className="ml-2 text-[10px] py-0">Admin</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {contact.lastMessage}
                            </p>
                            {contact.unreadCount > 0 && (
                              <Badge className="ml-2 px-2">{contact.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                    <Icons.CheckCircle className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">No unread messages</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="admin" className="m-0 p-0">
                {filteredContacts.filter(contact => contact.isAdmin).length > 0 ? (
                  filteredContacts
                    .filter(contact => contact.isAdmin)
                    .map(contact => (
                      <button
                        key={contact.id}
                        className={`w-full text-left p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors ${
                          activeContact?.id === contact.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                        }`}
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback>{contact.name[0]}</AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className={`font-medium truncate ${contact.unreadCount > 0 ? 'font-bold' : ''}`}>
                                {contact.name}
                              </p>
                              <Badge variant="outline" className="ml-2 text-[10px] py-0">Admin</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {contact.lastMessage}
                            </p>
                            {contact.unreadCount > 0 && (
                              <Badge className="ml-2 px-2">{contact.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                    <Icons.User className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">No admin contacts found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
      
      <div className="flex-1 flex flex-col relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        {activeContact ? (
          <>
            <MessagesHeader
              title={activeContact.name}
              status={activeContact.isOnline ? 'Online' : 'Last seen today at 12:45'}
              avatar={activeContact.avatar}
              isOnline={activeContact.isOnline}
            />
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
                
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`chat-message ${getMessageClass(message.senderId)} ${message.reaction ? 'mb-8' : ''}`}
                  >
                    {message.media ? (
                      message.media.type === 'image' ? (
                        <div className="rounded-md overflow-hidden mb-1">
                          <img 
                            src={message.media.url} 
                            alt="Shared image" 
                            className="max-w-[240px] h-auto object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-white dark:bg-gray-700 p-2 rounded-md mb-1">
                          <Icons.FileText className="h-8 w-8 mr-2 text-primary" />
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{message.media.name}</p>
                            <p className="text-xs text-muted-foreground">{message.media.size}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <Icons.Download size={16} />
                          </Button>
                        </div>
                      )
                    ) : null}
                    
                    {message.text && <p>{message.text}</p>}
                    
                    <div className={`flex items-center text-xs mt-1 ${message.senderId === 'me' ? 'justify-end' : ''}`}>
                      <span className={message.senderId === 'me' ? 'text-white/70' : 'text-gray-500'}>
                        {message.timestamp}
                      </span>
                      {message.senderId === 'me' && (
                        <span className="ml-1 text-white/70">
                          {message.isRead ? <Icons.Check size={12} /> : <Icons.Clock size={12} />}
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.senderId === 'me' ? (
                        <div className="absolute -left-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-white/50 dark:bg-gray-800/50">
                                <Icons.MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                <Icons.Trash size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <div className="absolute -right-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-white/50 dark:bg-gray-800/50">
                                <Icons.Smile size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {emojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                    onClick={() => handleAddReaction(message.id, emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    {message.reaction && (
                      <div className="absolute bottom-0 right-0 transform translate-y-4 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-sm border border-gray-100 dark:border-gray-700">
                        <span>{message.reaction}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {activeContact.isTyping && (
                  <div className="chat-message chat-message-other max-w-fit">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-0"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-400"></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleFileUpload}>
                  <Icons.Plus size={18} />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,audio/*,application/pdf,application/msword"
                    onChange={handleAttachMedia}
                  />
                </Button>
                
                <div className="relative flex-1">
                  <Input
                    placeholder="Type a message"
                    className="pr-10 py-6 bg-white/50 dark:bg-gray-800/50"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Icons.Smile size={18} />
                  </Button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker
                        emojis={emojis.concat(['😊', '😂', '😍', '🤔', '😎', '😢', '😡', '🎉', '🔥', '👍', '👎', '❤️', '💯', '✨'])}
                        onSelectEmoji={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  )}
                </div>
                
                <Button
                  className={`h-10 w-10 rounded-full ${newMessage.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                >
                  <Icons.Send size={16} className="text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 mb-4 opacity-20">
              <img 
                src="/lovable-uploads/be262162-c56d-43d0-8722-602aa9fa0cba.png" 
                alt="Whale illustration" 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
            <p className="text-muted-foreground">Or start a new conversation</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMessage} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatPanel;
