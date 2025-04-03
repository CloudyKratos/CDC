import React, { useState, useRef, useEffect } from "react";
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
  Archive,
  Share2,
  Copy,
  History,
  Lock,
  Download,
  Users,
  Link,
  Info,
  Calendar,
  Tag,
  Eye,
  Shield,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  CloudOff,
  CheckCircle2,
  Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem
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
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

// Enhanced types
interface NoteVersion {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  authorAvatar?: string;
}

interface NoteComment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
}

interface NoteCollaborator {
  id: string;
  name: string;
  avatar?: string;
  role: 'viewer' | 'editor' | 'owner';
  lastActive?: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: Date;
  createdAt: Date;
  emoji?: string;
  type: 'document' | 'image' | 'video' | 'other' | 'folder';
  mediaUrl?: string;
  starred?: boolean;
  tags?: string[];
  folder?: string;
  color?: string;
  isOffline?: boolean;
  isShared?: boolean;
  isLocked?: boolean;
  size?: number;
  versions?: NoteVersion[];
  comments?: NoteComment[];
  collaborators?: NoteCollaborator[];
  permissions?: 'private' | 'shared' | 'public';
  shareLink?: string;
  viewCount?: number;
  parentFolder?: string;
  metadata?: Record<string, any>;
  description?: string;
}

export const WorkspacePanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Project Ideas",
      content: "List of potential startup ideas to explore",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      emoji: "💡",
      type: 'document',
      starred: true,
      tags: ['ideas', 'startup'],
      folder: 'Projects',
      isShared: true,
      collaborators: [
        { id: '101', name: 'Alex Chen', role: 'editor', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '102', name: 'Sarah Kim', role: 'viewer', avatar: 'https://i.pravatar.cc/150?img=5' }
      ],
      permissions: 'shared',
      versions: [
        { id: 'v1', content: "Initial ideas list", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), author: 'You' },
        { id: 'v2', content: "Updated with feedback", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), author: 'Alex Chen', authorAvatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 'v3', content: "List of potential startup ideas to explore", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), author: 'You' }
      ],
      comments: [
        { id: 'c1', author: 'Alex Chen', authorAvatar: 'https://i.pravatar.cc/150?img=1', content: 'I really like the SaaS idea, we should explore that further.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) }
      ],
      viewCount: 8,
      size: 24576
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Notes from investor meeting on July 15",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      emoji: "📝",
      type: 'document',
      tags: ['meetings', 'investors'],
      folder: 'Meetings',
      versions: [
        { id: 'v1', content: "Notes from investor meeting on July 15", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), author: 'You' }
      ],
      size: 8192
    },
    {
      id: "3",
      title: "Q3 Goals",
      content: "Quarterly objectives and key results",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      emoji: "🎯",
      type: 'document',
      tags: ['goals', 'planning'],
      folder: 'Planning',
      isLocked: true,
      size: 16384
    },
    {
      id: "4",
      title: "Product Mockup",
      content: "Visual design for the new product",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      emoji: "🖼️",
      type: 'image',
      mediaUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
      tags: ['design', 'product'],
      folder: 'Design',
      size: 2097152
    },
    {
      id: "5",
      title: "Pitch Video",
      content: "Video presentation for investors",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      emoji: "🎬",
      type: 'video',
      mediaUrl: "https://example.com/video.mp4",
      tags: ['pitch', 'investors'],
      folder: 'Presentations',
      size: 15728640
    },
    {
      id: "6",
      title: "Design Assets",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      emoji: "🗂️",
      type: 'folder',
      content: "Contains all design assets",
      folder: "Design"
    },
    {
      id: "7",
      title: "Competitive Analysis",
      content: "In-depth analysis of our top 5 competitors",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      emoji: "🔍",
      type: 'document',
      tags: ['research', 'competition'],
      folder: 'Research',
      isOffline: true,
      size: 51200
    }
  ]);
  
  const [activeNote, setActiveNote] = useState<string | null>("1");
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([
    { id: null, name: 'Home' }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const folders = Array.from(new Set(notes.map(note => note.folder))).filter(Boolean) as string[];
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || []))).sort();
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // New document shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote('document');
      }
      
      // Save shortcut (when editing)
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
        e.preventDefault();
        toast.success("Changes saved", {
          description: "Your document has been saved"
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing]);
  
  const handleCreateNote = (type: Note['type'] = 'document') => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: type === 'document' ? "Untitled" : type === 'image' ? "New Image" : type === 'folder' ? "New Folder" : "New Video",
      content: "",
      lastUpdated: new Date(),
      createdAt: new Date(),
      type,
      emoji: type === 'document' ? "📄" : type === 'image' ? "🖼️" : type === 'folder' ? "📁" : "🎬",
      folder: activeFolder || undefined,
      parentFolder: activeFolder || undefined,
      size: 0,
      versions: [
        { id: 'v1', content: "", timestamp: new Date(), author: 'You' }
      ]
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setIsEditing(true);
    
    toast.success(
      type === 'folder' ? "Folder created" : "File created", 
      { description: `New ${type} has been created successfully` }
    );
  };
  
  const handleDeleteNote = (id: string) => {
    toast.success("Item moved to trash", {
      description: "It will be permanently deleted after 30 days",
      action: {
        label: "Undo",
        onClick: () => {
          toast("Action cancelled", {
            description: "The item was restored"
          });
        }
      }
    });
    
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (activeNote === id) {
      setActiveNote(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      setIsEditing(false);
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    toast.success(`${selectedItems.length} items moved to trash`, {
      description: "They will be permanently deleted after 30 days",
      action: {
        label: "Undo",
        onClick: () => {
          toast("Action cancelled", {
            description: "The items were restored"
          });
        }
      }
    });
    
    const updatedNotes = notes.filter(note => !selectedItems.includes(note.id));
    setNotes(updatedNotes);
    setSelectedItems([]);
    
    if (selectedItems.includes(activeNote!)) {
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
  
  const handleDuplicateNote = (id: string) => {
    const noteToDuplicate = notes.find(note => note.id === id);
    if (!noteToDuplicate) return;
    
    const newNote: Note = {
      ...noteToDuplicate,
      id: Date.now().toString(),
      title: `${noteToDuplicate.title} (Copy)`,
      lastUpdated: new Date(),
      createdAt: new Date(),
      starred: false
    };
    
    setNotes([newNote, ...notes]);
    toast.success("Item duplicated", {
      description: `${noteToDuplicate.title} has been duplicated`
    });
  };
  
  const handleAddComment = () => {
    if (!newComment.trim() || !activeNote) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === activeNote) {
        const newCommentObj: NoteComment = {
          id: Date.now().toString(),
          author: 'You',
          content: newComment,
          timestamp: new Date()
        };
        
        return {
          ...note,
          comments: [...(note.comments || []), newCommentObj]
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    setNewComment("");
    toast.success("Comment added");
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
      createdAt: new Date(),
      type,
      mediaUrl: url,
      emoji: type === 'image' ? "🖼️" : "🎬",
      folder: activeFolder || undefined,
      size: file.size,
      versions: [
        { id: 'v1', content: "", timestamp: new Date(), author: 'You' }
      ]
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setActiveTab(type === 'image' ? 'images' : 'videos');
    
    toast.success("File uploaded", {
      description: `${file.name} has been uploaded successfully`
    });
  };
  
  const handleDownloadFile = (id: string) => {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    
    toast.success("Download started", {
      description: `${note.title} is downloading`
    });
    
    // In a real app, this would trigger an actual download
    console.log(`Downloading ${note.title}`);
  };
  
  const handleMoveToFolder = (id: string, targetFolder: string | null) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, folder: targetFolder || undefined } : note
    );
    
    setNotes(updatedNotes);
    
    toast.success("Item moved", {
      description: targetFolder 
        ? `Moved to ${targetFolder} folder` 
        : "Moved to root directory"
    });
  };
  
  const handleBulkMoveToFolder = (targetFolder: string | null) => {
    if (selectedItems.length === 0) return;
    
    const updatedNotes = notes.map(note => 
      selectedItems.includes(note.id) 
        ? { ...note, folder: targetFolder || undefined } 
        : note
    );
    
    setNotes(updatedNotes);
    setSelectedItems([]);
    
    toast.success(`${selectedItems.length} items moved`, {
      description: targetFolder 
        ? `Moved to ${targetFolder} folder` 
        : "Moved to root directory"
    });
  };
  
  const handleOpenFolder = (folderId: string | null, folderName: string | null) => {
    setActiveFolder(folderId);
    
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Home' }]);
    } else if (folderName) {
      setBreadcrumbs([
        { id: null, name: 'Home' },
        { id: folderId, name: folderName }
      ]);
    }
  };
  
  const handleShareNote = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { 
        ...note, 
        isShared: true,
        permissions: 'shared',
        shareLink: `https://stoic.app/hub/share/${note.id}`
      } : note
    );
    
    setNotes(updatedNotes);
    setIsShareDialogOpen(true);
    
    toast.success("Share link created", {
      description: "The share link has been copied to clipboard"
    });
  };
  
  const handleShareWithUsers = (emails: string[], permission: 'viewer' | 'editor') => {
    if (!activeNote) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === activeNote) {
        // In a real app, this would send invitations to these emails
        const newCollaborators: NoteCollaborator[] = emails.map(email => ({
          id: Date.now().toString() + Math.random().toString().slice(2, 8),
          name: email.split('@')[0],
          role: permission,
          avatar: `https://i.pravatar.cc/150?u=${email}`
        }));
        
        return {
          ...note,
          collaborators: [...(note.collaborators || []), ...newCollaborators],
          isShared: true,
          permissions: 'shared'
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    toast.success("Invitations sent", {
      description: `${emails.length} people have been invited to collaborate`
    });
    
    setIsShareDialogOpen(false);
  };
  
  const handleSelectionChange = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const handleSelectAll = () => {
    const visibleNotes = getFilteredNotes();
    if (selectedItems.length === visibleNotes.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(visibleNotes.map(note => note.id));
    }
  };
  
  const handleToggleLock = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isLocked: !note.isLocked } : note
    );
    
    setNotes(updatedNotes);
    
    const note = notes.find(note => note.id === id);
    toast.success(
      note?.isLocked ? "Item unlocked" : "Item locked", 
      { description: note?.isLocked ? "This item can now be edited" : "This item is now locked from editing" }
    );
  };
  
  const getFilteredNotes = () => {
    let filteredNotes = notes;
    
    // Search filter
    if (searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
    } else if (activeTab === 'shared') {
      filteredNotes = filteredNotes.filter(note => note.isShared);
    } else if (activeTab === 'offline') {
      filteredNotes = filteredNotes.filter(note => note.isOffline);
    }
    
    // Folder filter
    if (activeFolder) {
      filteredNotes = filteredNotes.filter(note => note.folder === activeFolder);
    } else if (activeTab !== 'all' && activeTab !== 'starred' && activeTab !== 'shared' && activeTab !== 'offline') {
      // When in a specific tab, show top-level items when no folder is selected
      filteredNotes = filteredNotes.filter(note => !note.parentFolder);
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
      } else if (sortBy === 'size') {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sortDirection === 'desc'
          ? sizeB - sizeA
          : sizeA - sizeB;
      } else {
        return sortDirection === 'desc'
          ? b.type.localeCompare(a.type)
          : a.type.localeCompare(b.type);
      }
    });
    
    // Put folders first
    return [
      ...filteredNotes.filter(note => note.type === 'folder'),
      ...filteredNotes.filter(note => note.type !== 'folder')
    ];
  };
  
  const filteredNotes = getFilteredNotes();
  const activeNoteData = notes.find(note => note.id === activeNote);
  
  const toggleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  const changeSortBy = (newSortBy: 'date' | 'name' | 'type' | 'size') => {
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
  
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
      return date.toLocaleDateString();
    } else if (diffDay >= 1) {
      return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else if (diffHour >= 1) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin >= 1) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const getFileIcon = (type: string, starred: boolean = false, size: number = 20): JSX.Element => {
    const starredClass = starred ? "text-yellow-500 fill-yellow-500" : "";
    
    switch (type) {
      case 'document':
        return <FileText className={`h-${size/4} w-${size/4} ${starredClass}`} />;
      case 'image':
        return <Image className={`h-${size/4} w-${size/4} ${starredClass}`} />;
      case 'video':
        return <Video className={`h-${size/4} w-${size/4} ${starredClass}`} />;
      case 'folder':
        return <Folder className={`h-${size/4} w-${size/4} ${starredClass}`} />;
      default:
        return <File className={`h-${size/4} w-${size/4} ${starredClass}`} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden shadow-xl relative animate-scale-in">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <TopographicBackground variant="modern" className="opacity-60" />
      </div>
      
      {/* Command Palette */}
      <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl">
          <CommandInput placeholder="Search for files, folders, or actions..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem 
                onSelect={() => {
                  handleCreateNote('document');
                  setIsCommandPaletteOpen(false);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>New Document</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem 
                onSelect={() => {
                  handleUploadMedia('image');
                  setIsCommandPaletteOpen(false);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload File</span>
                <CommandShortcut>⌘U</CommandShortcut>
              </CommandItem>
              <CommandItem 
                onSelect={() => {
                  handleCreateNote('folder');
                  setIsCommandPaletteOpen(false);
                }}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                <span>New Folder</span>
              </CommandItem>
            </CommandGroup>
            
            {activeNoteData && (
              <CommandGroup heading="Current Item">
                <CommandItem 
                  onSelect={() => {
                    handleToggleStar(activeNoteData.id);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <Star className={`mr-2 h-4 w-4 ${activeNoteData.starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  <span>{activeNoteData.starred ? "Remove Star" : "Star Item"}</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => {
                    handleShareNote(activeNoteData.id);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => {
                    handleDuplicateNote(activeNoteData.id);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => {
                    if (activeNoteData.type !== 'folder') {
                      handleDownloadFile(activeNoteData.id);
                    }
                    setIsCommandPaletteOpen(false);
                  }}
                  disabled={activeNoteData.type === 'folder'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </CommandItem>
              </CommandGroup>
            )}
            
            <CommandGroup heading="Recent Items">
              {notes.slice(0, 5).map(note => (
                <CommandItem 
                  key={note.id}
                  onSelect={() =>
