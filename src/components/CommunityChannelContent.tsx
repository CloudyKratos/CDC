import React, { useState } from "react";
import CelestialBackground from '@/components/home/CelestialBackground';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmojiPicker } from '@/components/EmojiPicker';
import { MessageSquare, FileText, Image, Smile, Send, Heart, Share2, Bookmark, MoreHorizontal, Search } from 'lucide-react';
import Icons from '@/utils/IconUtils';
import WorkInProgressBanner from '@/components/WorkInProgressBanner';
import ComingSoonBanner from '@/components/ComingSoonBanner';

interface CommunityChannelContentProps {
  channelName: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  timeAgo: string;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  timeAgo: string;
  category: string;
  likes: number;
  comments: Comment[];
  media?: string;
}

const initialPosts: Post[] = [
  {
    id: "1",
    author: {
      id: "1",
      name: "John Doe",
      avatar: "https://github.com/shadcn.png"
    },
    content: "Hey everyone! Check out this article I found on sustainable business practices. It's a game-changer!",
    timeAgo: "2 hours ago",
    category: "Sustainability",
    likes: 42,
    comments: [
      {
        id: "1",
        author: {
          id: "2",
          name: "Jane Smith",
          avatar: "https://avatars.githubusercontent.com/u/284139?s=48&v=4"
        },
        content: "Thanks for sharing, John! I'll definitely give it a read.",
        timeAgo: "1 hour ago"
      }
    ]
  },
  {
    id: "2",
    author: {
      id: "3",
      name: "Alice Johnson",
      avatar: "https://pbs.twimg.com/profile_images/1587647094267049984/FvGAodaS_400x400.jpg"
    },
    content: "I'm excited to announce that we're launching a new product next month! Stay tuned for more details.",
    timeAgo: "5 hours ago",
    category: "Product Launch",
    likes: 128,
    comments: []
  },
  {
    id: "3",
    author: {
      id: "1",
      name: "John Doe",
      avatar: "https://github.com/shadcn.png"
    },
    content: "Just finished a great book on leadership. Highly recommend it to all entrepreneurs!",
    timeAgo: "1 day ago",
    category: "Leadership",
    likes: 75,
    comments: [
      {
        id: "2",
        author: {
          id: "2",
          name: "Jane Smith",
          avatar: "https://avatars.githubusercontent.com/u/284139?s=48&v=4"
        },
        content: "I've heard great things about that book. Adding it to my reading list!",
        timeAgo: "12 hours ago"
      },
      {
        id: "3",
        author: {
          id: "3",
          name: "Alice Johnson",
          avatar: "https://pbs.twimg.com/profile_images/1587647094267049984/FvGAodaS_400x400.jpg"
        },
        content: "Thanks for the recommendation!",
        timeAgo: "8 hours ago"
      }
    ],
    media: "https://images.unsplash.com/photo-1556761175-b413da4ca6d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3N8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
  }
];

const CommunityChannelContent: React.FC<CommunityChannelContentProps> = ({ channelName }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojis = ['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆', '🎊', '🙏', '👌', '💬'];

  const handlePostSubmit = () => {
    if (newPostContent.trim() !== "") {
      const newPost: Post = {
        id: String(posts.length + 1),
        author: {
          id: "1",
          name: "You",
          avatar: "https://github.com/shadcn.png"
        },
        content: newPostContent,
        timeAgo: "Just now",
        category: "General",
        likes: 0,
        comments: [],
        media: undefined
      };

      setPosts([newPost, ...posts]);
      setNewPostContent("");
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewPostContent(newPostContent + emoji);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0 -z-10 opacity-20">
        <CelestialBackground />
      </div>
      
      <div className="flex items-center justify-between p-4 border-b backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="https://github.com/shadcn.png" alt="Channel Avatar" />
            <AvatarFallback>CH</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold"># {channelName || 'entrepreneurs'}</h2>
            <p className="text-xs text-muted-foreground">General discussion for {channelName || 'entrepreneurs'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">234 members</span>
        </div>
      </div>

      <Tabs defaultValue="posts" className="flex-1 flex flex-col">
        <div className="px-4 pt-2 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20">
          <TabsList className="w-full justify-start gap-2 h-9">
            <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="posts" className="m-0 h-full flex flex-col">
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="p-4 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-celestial-gold/20">
                    <div className="flex space-x-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{post.author.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">posted {post.timeAgo}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-celestial-gold/10 text-celestial-gold border-celestial-gold/30">
                            {post.category}
                          </Badge>
                        </div>
                        <p className="mt-2">{post.content}</p>

                        {post.media && (
                          <div className="mt-3 overflow-hidden rounded-md">
                            <img 
                              src={post.media} 
                              alt="Post media" 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <Heart className="h-4 w-4" />
                              <span className="text-xs">{post.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-xs">{post.comments.length}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>

                        {post.comments.length > 0 && (
                          <div className="mt-3 space-y-3">
                            <Separator />
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex space-x-3 pt-3">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                                  <AvatarFallback>{comment.author.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium">{comment.author.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{comment.timeAgo}</span>
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
              <div className="flex space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea 
                    placeholder="Share your thoughts with the community..." 
                    className="resize-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" 
                    value={newPostContent} 
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleEmojiPicker}>
                        <Smile className="h-4 w-4" />
                      </Button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-24">
                          <EmojiPicker
                            emojis={emojis}
                            onSelectEmoji={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="h-8 bg-celestial-gold hover:bg-celestial-gold/90 text-celestial-dark" onClick={handlePostSubmit}>
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="h-full m-0 p-4">
            <ComingSoonBanner 
              title="Media Gallery Coming Soon"
              description="Share and browse images, videos, and other media with your community."
            />
          </TabsContent>

          <TabsContent value="files" className="h-full m-0 p-4">
            <ComingSoonBanner 
              title="Files Repository Coming Soon"
              description="Access and share documents, presentations, and other files with your community."
            />
          </TabsContent>

          <TabsContent value="events" className="h-full m-0 p-4">
            <div className="h-full flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Community Events</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Icons.Plus className="h-4 w-4 mr-1" />
                    New Event
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <Icons.Calendar className="h-4 w-4 mr-1" />
                    View Calendar
                  </Button>
                </div>
              </div>
              
              <WorkInProgressBanner 
                title="Community Events Feature in Development"
                description="We're building a comprehensive events system for community meetups, webinars, and collaborations."
              />
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="p-4 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-celestial-gold/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-celestial-gold/20 text-celestial-gold border-celestial-gold/30">Webinar</Badge>
                      <h4 className="font-medium">Growth Strategies for SaaS Startups</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        May 15, 2025 • 2:00 PM - 3:30 PM EST
                      </p>
                    </div>
                    <Badge variant="outline">14 attending</Badge>
                  </div>
                </Card>
                
                <Card className="p-4 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-celestial-gold/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-celestial-gold/20 text-celestial-gold border-celestial-gold/30">Meetup</Badge>
                      <h4 className="font-medium">NYC Entrepreneur Networking Event</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        June 3, 2025 • 6:30 PM - 8:30 PM EST
                      </p>
                    </div>
                    <Badge variant="outline">23 attending</Badge>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CommunityChannelContent;
