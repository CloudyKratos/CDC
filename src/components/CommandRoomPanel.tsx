
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CREATE_OPTIONS = [
  { id: 'reflection', name: 'New Reflection', icon: <Icons.BookOpen size={20} className="text-purple-500" /> },
  { id: 'ritual', name: 'Ritual Template', icon: <Icons.Target size={20} className="text-blue-500" /> },
  { id: 'journal', name: 'Journal Entry', icon: <Icons.FileText size={20} className="text-green-500" /> },
  { id: 'insight', name: 'Upload Insight', icon: <Icons.Upload size={20} className="text-orange-500" /> },
  { id: 'snapshot', name: 'Daily Snapshot', icon: <Icons.Camera size={20} className="text-cyan-500" /> },
];

interface MindTile {
  id: string;
  title: string;
  category: 'reflection' | 'strategy' | 'wisdom' | 'ritual';
  lastReviewed: string;
  anchored: boolean;
  isPrivate: boolean;
  content?: string;
}

const CommandRoomPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [mindTiles, setMindTiles] = useState<MindTile[]>([
    { id: '1', title: 'Morning Ritual Framework', category: 'ritual', lastReviewed: '2 hours ago', anchored: true, isPrivate: true },
    { id: '2', title: 'Weekly Mission Review', category: 'reflection', lastReviewed: '1 day ago', anchored: false, isPrivate: true },
    { id: '3', title: 'Stoic Decision Matrix', category: 'strategy', lastReviewed: '3 days ago', anchored: true, isPrivate: false },
    { id: '4', title: 'Gratitude Insights - Week 23', category: 'wisdom', lastReviewed: '4 days ago', anchored: false, isPrivate: true },
    { id: '5', title: 'Energy Management Protocol', category: 'strategy', lastReviewed: '1 week ago', anchored: false, isPrivate: true },
  ]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateNew = (type: string) => {
    const newTile: MindTile = {
      id: (mindTiles.length + 1).toString(),
      title: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      category: type as MindTile['category'],
      lastReviewed: 'Just now',
      anchored: false,
      isPrivate: true
    };
    
    setMindTiles([newTile, ...mindTiles]);
    setShowCreateDialog(false);
    
    toast.success(`New ${type} created!`, {
      description: "Your mind tile is ready for wisdom."
    });
  };
  
  const toggleAnchor = (id: string) => {
    setMindTiles(tiles => 
      tiles.map(tile => 
        tile.id === id ? { ...tile, anchored: !tile.anchored } : tile
      )
    );
  };
  
  const filteredTiles = mindTiles.filter(tile => 
    tile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tile.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reflection': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'strategy': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'wisdom': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'ritual': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="p-6 h-full relative overflow-hidden">
      {/* Cosmic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Command Room</h2>
            <p className="text-sm text-muted-foreground mt-1">Your personal mental library and growth sanctuary</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Input 
                placeholder="Search your mental library..."
                className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Icons.Search size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hidden md:flex backdrop-blur-sm"
              >
                {viewMode === 'grid' ? <Icons.LayoutGrid size={18} /> : <Icons.LineChart size={18} />}
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 backdrop-blur-sm border-purple-200/50">
                    <Icons.Plus size={16} />
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Create New Mind Tile</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    {CREATE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group border border-gray-200/50 dark:border-gray-700/50"
                        onClick={() => handleCreateNew(option.id)}
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          {option.icon}
                        </div>
                        <span className="text-sm font-medium">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="daily-flow" className="w-full">
          <TabsList className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30">
            <TabsTrigger value="daily-flow">Daily Flow</TabsTrigger>
            <TabsTrigger value="rituals">Rituals</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="daily-flow" className="space-y-4 mt-6">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {searchQuery && filteredTiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Icons.Search size={48} className="mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No mind tiles found</h3>
                  <p className="text-sm text-muted-foreground">Try a different search term or create new content</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTiles.map((tile) => (
                    <Card key={tile.id} className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:translate-y-[-4px] border-purple-200/30 dark:border-purple-800/30 group">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {tile.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Last reviewed: {tile.lastReviewed}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-60 hover:opacity-100"
                            onClick={() => toggleAnchor(tile.id)}
                          >
                            <Icons.Star 
                              size={16} 
                              className={tile.anchored ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                            />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={`${getCategoryColor(tile.category)} border-0`}>
                            {tile.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {tile.anchored && <Icons.Star size={12} className="text-yellow-500" />}
                            <span className="text-xs text-muted-foreground">
                              {tile.isPrivate ? "Private" : "Shared"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTiles.map((tile) => (
                    <div 
                      key={tile.id} 
                      className="flex items-center p-4 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer backdrop-blur-sm transition-all duration-200 border border-purple-200/20 dark:border-purple-800/20"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{tile.title}</h4>
                        <p className="text-xs text-muted-foreground">Last reviewed: {tile.lastReviewed}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getCategoryColor(tile.category)} border-0 text-xs`}>
                          {tile.category}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => toggleAnchor(tile.id)}
                        >
                          <Icons.Star 
                            size={14} 
                            className={tile.anchored ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                          />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rituals" className="space-y-4 mt-6">
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <Icons.Target size={48} className="mb-4 text-purple-400 opacity-60" />
              <h3 className="text-lg font-medium mb-2">Your Ritual Library</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Sacred routines and frameworks for consistent growth
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reflections" className="space-y-4 mt-6">
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <Icons.BookOpen size={48} className="mb-4 text-purple-400 opacity-60" />
              <h3 className="text-lg font-medium mb-2">Reflection Archive</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Journal entries, insights, and lessons learned on your journey
              </p>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-4 mt-6">
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <Icons.FileText size={48} className="mb-4 text-purple-400 opacity-60" />
              <h3 className="text-lg font-medium mb-2">Wisdom Library</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your collection of resources, PDFs, images, and saved wisdom
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <Icons.LayoutDashboard size={48} className="mb-4 text-purple-400 opacity-60" />
              <h3 className="text-lg font-medium mb-2">Master Templates</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Reusable frameworks for decision-making, planning, and self-mastery
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommandRoomPanel;
