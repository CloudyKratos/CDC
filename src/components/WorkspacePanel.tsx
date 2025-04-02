
import React, { useState, useRef } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit3,
  Trash,
  Image,
  FileImage,
  Video,
  File,
  FolderPlus,
  Folder,
  Clock,
  Star,
  Filter,
  ArrowUpDown,
  Upload,
  X,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TopographicBackground from "@/components/home/TopographicBackground";

interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: Date;
  emoji?: string;
  type: 'document' | 'image' | 'video' | 'other';
  mediaUrl?: string;
  starred?: boolean;
  tags?: string[];
  folder?: string;
}

export const WorkspacePanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Project Ideas",
      content: "List of potential startup ideas to explore",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      emoji: "💡",
      type: 'document',
      starred: true,
      tags: ['ideas', 'startup'],
      folder: 'Projects'
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Notes from investor meeting on July 15",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3),
      emoji: "📝",
      type: 'document',
      tags: ['meetings', 'investors'],
      folder: 'Meetings'
    },
    {
      id: "3",
      title: "Q3 Goals",
      content: "Quarterly objectives and key results",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
      emoji: "🎯",
      type: 'document',
      tags: ['goals', 'planning'],
      folder: 'Planning'
    },
    {
      id: "4",
      title: "Product Mockup",
      content: "Visual design for the new product",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5),
      emoji: "🖼️",
      type: 'image',
      mediaUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
      tags: ['design', 'product'],
      folder: 'Design'
    },
    {
      id: "5",
      title: "Pitch Video",
      content: "Video presentation for investors",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
      emoji: "🎬",
      type: 'video',
      mediaUrl: "https://example.com/video.mp4",
      tags: ['pitch', 'investors'],
      folder: 'Presentations'
    }
  ]);
  
  const [activeNote, setActiveNote] = useState<string | null>("1");
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const folders = Array.from(new Set(notes.map(note => note.folder))).filter(Boolean) as string[];
  
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || []))).sort();
  
  const handleCreateNote = (type: Note['type'] = 'document') => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: type === 'document' ? "Untitled" : type === 'image' ? "New Image" : "New Video",
      content: "",
      lastUpdated: new Date(),
      type,
      emoji: type === 'document' ? "📄" : type === 'image' ? "🖼️" : "🎬"
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setIsEditing(true);
  };
  
  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (activeNote === id) {
      setActiveNote(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      setIsEditing(false);
    }
  };
  
  const handleToggleStar = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, starred: !note.starred } : note
    );
    setNotes(updatedNotes);
  };
  
  const handleUploadMedia = (type: 'image' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, we would upload the file to a server and get a URL back
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: file.name,
      content: "",
      lastUpdated: new Date(),
      type,
      mediaUrl: url,
      emoji: type === 'image' ? "🖼️" : "🎬"
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setActiveTab(type === 'image' ? 'images' : 'videos');
  };
  
  const getFilteredNotes = () => {
    let filteredNotes = notes;
    
    // Search filter
    if (searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Tab filter
    if (activeTab === 'documents') {
      filteredNotes = filteredNotes.filter(note => note.type === 'document');
    } else if (activeTab === 'images') {
      filteredNotes = filteredNotes.filter(note => note.type === 'image');
    } else if (activeTab === 'videos') {
      filteredNotes = filteredNotes.filter(note => note.type === 'video');
    } else if (activeTab === 'starred') {
      filteredNotes = filteredNotes.filter(note => note.starred);
    }
    
    // Folder filter
    if (activeFolder) {
      filteredNotes = filteredNotes.filter(note => note.folder === activeFolder);
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      filteredNotes = filteredNotes.filter(note => 
        selectedTags.every(tag => note.tags?.includes(tag))
      );
    }
    
    // Sorting
    filteredNotes.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'desc' 
          ? b.lastUpdated.getTime() - a.lastUpdated.getTime()
          : a.lastUpdated.getTime() - b.lastUpdated.getTime();
      } else if (sortBy === 'name') {
        return sortDirection === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else {
        return sortDirection === 'desc'
          ? b.type.localeCompare(a.type)
          : a.type.localeCompare(b.type);
      }
    });
    
    return filteredNotes;
  };
  
  const filteredNotes = getFilteredNotes();
  const activeNoteData = notes.find(note => note.id === activeNote);
  
  const toggleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  const changeSortBy = (newSortBy: 'date' | 'name' | 'type') => {
    if (sortBy === newSortBy) {
      toggleSort();
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden shadow-xl relative animate-scale-in">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <TopographicBackground variant="modern" className="opacity-60" />
      </div>
      
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Archive size={16} />
          </div>
          <h3 className="font-medium text-lg">Hub</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-gray-600 hover:text-primary hover:border-primary"
              >
                <Plus size={16} className="mr-1" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleCreateNote('document')} className="cursor-pointer">
                <FileText size={16} className="mr-2 text-blue-500" />
                <span>Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUploadMedia('image')} className="cursor-pointer">
                <Image size={16} className="mr-2 text-purple-500" />
                <span>Upload Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUploadMedia('video')} className="cursor-pointer">
                <Video size={16} className="mr-2 text-red-500" />
                <span>Upload Video</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <FolderPlus size={16} className="mr-2 text-green-500" />
                <span>New Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>
      </div>
      
      <div className="flex h-full">
        <div className="w-64 backdrop-blur-sm flex flex-col border-r border-gray-100 dark:border-gray-800">
          <div className="p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hub..."
                className="pl-9 bg-white/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700"
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-3">
            <TabsList className="w-full bg-gray-100/80 dark:bg-gray-800/80">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
              <TabsTrigger value="images" className="text-xs">Images</TabsTrigger>
              <TabsTrigger value="videos" className="text-xs">Videos</TabsTrigger>
              <TabsTrigger value="starred" className="text-xs">
                <Star size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Filter size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="px-2 py-1.5 text-xs font-semibold">Filter by tags</div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 flex flex-wrap gap-1">
                    {allTags.map(tag => (
                      <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {allTags.length === 0 && (
                      <div className="text-xs text-gray-500">No tags available</div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowUpDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeSortBy('date')} className="cursor-pointer">
                    <Clock size={14} className="mr-2" />
                    <span>Date {sortBy === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeSortBy('name')} className="cursor-pointer">
                    <FileText size={14} className="mr-2" />
                    <span>Name {sortBy === 'name' && (sortDirection === 'desc' ? '↓' : '↑')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeSortBy('type')} className="cursor-pointer">
                    <File size={14} className="mr-2" />
                    <span>Type {sortBy === 'type' && (sortDirection === 'desc' ? '↓' : '↑')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs" 
                onClick={() => setSelectedTags([])}
              >
                Clear filters
              </Button>
            )}
          </div>
          
          {folders.length > 0 && (
            <div className="px-2 py-1">
              <div className="flex flex-col space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start text-xs",
                    activeFolder === null ? "bg-gray-100 dark:bg-gray-800" : ""
                  )}
                  onClick={() => setActiveFolder(null)}
                >
                  <Folder size={14} className="mr-2 text-gray-500" />
                  All Folders
                </Button>
                {folders.map(folder => (
                  <Button
                    key={folder}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start text-xs",
                      activeFolder === folder ? "bg-gray-100 dark:bg-gray-800" : ""
                    )}
                    onClick={() => setActiveFolder(folder)}
                  >
                    <Folder size={14} className="mr-2 text-blue-500" />
                    {folder}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto mt-1">
            {filteredNotes.length > 0 ? (
              <div className="space-y-1 p-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNote(note.id)}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-all hover:bg-white/80 dark:hover:bg-gray-800/80",
                      activeNote === note.id ? "bg-white/80 dark:bg-gray-800/80 shadow-sm" : "bg-transparent",
                      "animate-fade-in"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{note.emoji}</span>
                        <div>
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {note.type === 'document' ? note.content.substring(0, 40) : note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(note.id);
                        }}
                      >
                        <Star size={14} className={note.starred ? "fill-yellow-500 text-yellow-500" : ""} />
                      </Button>
                    </div>
                    
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 flex items-center">
                      {formatDate(note.lastUpdated)}
                      {note.folder && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            <Folder size={10} className="mr-0.5" />
                            {note.folder}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No items found
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col backdrop-blur-sm">
          {activeNoteData ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{activeNoteData.emoji || "📄"}</span>
                  <h4 className="font-medium">{activeNoteData.title}</h4>
                  {activeNoteData.starred && <Star size={16} className="fill-yellow-500 text-yellow-500" />}
                </div>
                <div className="flex items-center space-x-1">
                  {activeNoteData.type === 'document' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(!isEditing)} 
                      className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground"
                    >
                      <Edit3 size={16} className="mr-1" />
                      {isEditing ? "View" : "Edit"}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleToggleStar(activeNoteData.id)}
                        className="cursor-pointer"
                      >
                        <Star size={16} className="mr-2" />
                        {activeNoteData.starred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <FolderPlus size={16} className="mr-2" />
                        Move to folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteNote(activeNoteData.id)}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        <Trash size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto backdrop-blur-sm">
                {activeNoteData.type === 'document' ? (
                  isEditing ? (
                    <div className="h-full flex flex-col">
                      <Input
                        value={activeNoteData.title}
                        onChange={(e) => {
                          const updatedNotes = notes.map(note => 
                            note.id === activeNote 
                              ? { ...note, title: e.target.value, lastUpdated: new Date() } 
                              : note
                          );
                          setNotes(updatedNotes);
                        }}
                        className="text-lg font-medium mb-4 border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                        placeholder="Note title"
                      />
                      <Textarea
                        value={activeNoteData.content}
                        onChange={(e) => {
                          const updatedNotes = notes.map(note => 
                            note.id === activeNote 
                              ? { ...note, content: e.target.value, lastUpdated: new Date() } 
                              : note
                          );
                          setNotes(updatedNotes);
                        }}
                        className="flex-1 resize-none text-gray-700 dark:text-gray-300 outline-none border-none p-0 bg-transparent"
                        placeholder="Start writing your note..."
                      />
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Tags</div>
                        <div className="flex flex-wrap gap-2">
                          {activeNoteData.tags?.map(tag => (
                            <Badge key={tag} className="px-2 py-1">
                              {tag}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 ml-1 text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  const updatedNotes = notes.map(note => 
                                    note.id === activeNote 
                                      ? { ...note, tags: note.tags?.filter(t => t !== tag) } 
                                      : note
                                  );
                                  setNotes(updatedNotes);
                                }}
                              >
                                <X size={12} />
                              </Button>
                            </Badge>
                          ))}
                          <Input
                            placeholder="Add tag..."
                            className="w-24 h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                const newTag = e.currentTarget.value.trim().toLowerCase();
                                if (newTag && !activeNoteData.tags?.includes(newTag)) {
                                  const updatedNotes = notes.map(note => 
                                    note.id === activeNote 
                                      ? { ...note, tags: [...(note.tags || []), newTag] } 
                                      : note
                                  );
                                  setNotes(updatedNotes);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-semibold mb-4">{activeNoteData.title}</h2>
                      <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{activeNoteData.content || "No content yet"}</div>
                      
                      {activeNoteData.tags && activeNoteData.tags.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {activeNoteData.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="px-2 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {activeNoteData.lastUpdated.toLocaleString()}
                      </div>
                    </div>
                  )
                ) : activeNoteData.type === 'image' ? (
                  <div className="flex flex-col h-full">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-semibold">{activeNoteData.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last updated: {activeNoteData.lastUpdated.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {activeNoteData.mediaUrl ? (
                        <img 
                          src={activeNoteData.mediaUrl} 
                          alt={activeNoteData.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500">
                          <FileImage size={48} className="mx-auto mb-2" />
                          <p>No image available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Textarea
                        value={activeNoteData.content}
                        onChange={(e) => {
                          const updatedNotes = notes.map(note => 
                            note.id === activeNote 
                              ? { ...note, content: e.target.value, lastUpdated: new Date() } 
                              : note
                          );
                          setNotes(updatedNotes);
                        }}
                        placeholder="Add a description..."
                        className="resize-none h-24"
                      />
                    </div>
                  </div>
                ) : activeNoteData.type === 'video' ? (
                  <div className="flex flex-col h-full">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-semibold">{activeNoteData.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last updated: {activeNoteData.lastUpdated.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {activeNoteData.mediaUrl ? (
                        <video 
                          src={activeNoteData.mediaUrl} 
                          controls
                          className="max-w-full max-h-full"
                        />
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500">
                          <Video size={48} className="mx-auto mb-2" />
                          <p>No video available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Textarea
                        value={activeNoteData.content}
                        onChange={(e) => {
                          const updatedNotes = notes.map(note => 
                            note.id === activeNote 
                              ? { ...note, content: e.target.value, lastUpdated: new Date() } 
                              : note
                          );
                          setNotes(updatedNotes);
                        }}
                        placeholder="Add a description..."
                        className="resize-none h-24"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>Unknown file type</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
              Select an item or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};
