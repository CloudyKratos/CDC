import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Copy, File, FileText, Folder, Link, MoreHorizontal, Plus, Search, Share, Star, Trash, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note, NotePermission } from "@/types/workspace";
import { toast } from "sonner";

const WorkspacePanel = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"document" | "folder">("document");
  const [sharing, setSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("viewer");
  const [openCommandMenu, setOpenCommandMenu] = useState(false);
  
  // Sample collaborators data
  const availableCollaborators = [
    { id: "1", name: "John Doe", email: "john@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
    { id: "3", name: "Alex Johnson", email: "alex@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: "5", name: "Michael Brown", email: "michael@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
  ];
  
  // Initialize with sample data
  useEffect(() => {
    const sampleNotes: Note[] = [
      {
        id: "1",
        title: "Business Plan",
        content: "# Business Plan\n\nThis is a draft of our business plan for the upcoming year.\n\n## Executive Summary\n\nOur company aims to revolutionize the industry by...\n\n## Market Analysis\n\nThe current market size is estimated at $2.5B with an annual growth rate of 7%...",
        lastUpdated: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isShared: false,
        permissions: "private",
        type: "document",
        tags: [
          { id: "tag1", name: "Business", color: "blue" },
          { id: "tag2", name: "Planning", color: "green" }
        ],
        isFavorite: true
      },
      {
        id: "2",
        title: "Marketing Strategy",
        content: "# Marketing Strategy\n\nOur marketing approach for Q3 and Q4.\n\n## Target Audience\n\n- Small business owners\n- Startup founders\n- Enterprise clients\n\n## Channels\n\n1. Social media (LinkedIn, Twitter)\n2. Content marketing\n3. Email campaigns\n4. Webinars",
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        isShared: true,
        permissions: "shared",
        type: "document",
        tags: [
          { id: "tag3", name: "Marketing", color: "purple" }
        ],
        collaborators: [
          { id: "1", name: "John Doe", email: "john@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", role: "editor" }
        ],
        shareLink: "https://app.nexus.com/shared/2"
      },
      {
        id: "3",
        title: "Project Documents",
        content: "",
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isShared: false,
        permissions: "private",
        type: "folder",
        subfolders: ["4"]
      },
      {
        id: "4",
        title: "Client Presentations",
        content: "",
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        isShared: false,
        permissions: "private",
        type: "folder",
        parentId: "3"
      },
      {
        id: "5",
        title: "Investor Pitch Deck",
        content: "# Investor Pitch Deck\n\nThis presentation outlines our business model, market opportunity, and funding requirements.\n\n## Slides\n\n1. Company Overview\n2. Problem & Solution\n3. Market Opportunity\n4. Business Model\n5. Go-to-Market Strategy\n6. Competitive Analysis\n7. Team\n8. Financials\n9. Funding Ask",
        lastUpdated: new Date(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isShared: false,
        permissions: "private",
        type: "document",
        tags: [
          { id: "tag4", name: "Investors", color: "orange" },
          { id: "tag5", name: "Pitch", color: "red" }
        ],
        parentId: "4"
      }
    ];
    
    setNotes(sampleNotes);
  }, []);
  
  // Filter notes based on active tab and search query
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "documents") {
      return note.type === "document" && matchesSearch;
    } else if (activeTab === "folders") {
      return note.type === "folder" && matchesSearch;
    } else if (activeTab === "shared") {
      return note.isShared && matchesSearch;
    } else if (activeTab === "favorites") {
      return note.isFavorite && matchesSearch;
    }
    
    return matchesSearch;
  });
  
  // Handle note selection
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };
  
  // Handle note creation
  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      lastUpdated: new Date(),
      createdAt: new Date(),
      isShared: false,
      permissions: "private",
      type: newNoteType,
      subfolders: newNoteType === "folder" ? [] : undefined
    };
    
    setNotes([...notes, newNote]);
    setShowCreateDialog(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteType("document");
    
    toast.success(`${newNoteType === "folder" ? "Folder" : "Document"} created`, {
      description: `"${newNoteTitle}" has been created successfully.`
    });
  };
  
  // Handle note update
  const handleUpdateNote = () => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === selectedNote.id) {
        return {
          ...note,
          title: editedTitle,
          content: editedContent,
          lastUpdated: new Date()
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    setSelectedNote({
      ...selectedNote,
      title: editedTitle,
      content: editedContent,
      lastUpdated: new Date()
    });
    setIsEditing(false);
    
    toast.success("Document updated", {
      description: "Your changes have been saved."
    });
  };
  
  // Handle note deletion
  const handleDeleteNote = () => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.filter(note => note.id !== selectedNote.id);
    setNotes(updatedNotes);
    setSelectedNote(null);
    setShowDeleteDialog(false);
    
    toast.success("Item deleted", {
      description: `"${selectedNote.title}" has been deleted.`
    });
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (noteId: string) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          isFavorite: !note.isFavorite
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        isFavorite: !selectedNote.isFavorite
      });
    }
    
    const note = notes.find(n => n.id === noteId);
    if (note) {
      toast.success(note.isFavorite ? "Removed from favorites" : "Added to favorites", {
        description: `"${note.title}" has been ${note.isFavorite ? "removed from" : "added to"} your favorites.`
      });
    }
  };
  
  // Handle sharing a note
  const handleShareNote = (noteId: string) => {
    setSharing(true);
    setTimeout(() => {
      const updatedNotes = notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            isShared: true,
            permissions: "shared" as NotePermission,
            shareLink: `https://app.nexus.com/shared/${note.id}`
          };
        }
        return note;
      });
      setNotes(updatedNotes);
      setSharing(false);
      
      toast.success("Note shared successfully", {
        description: "Anyone with the link can now view this note."
      });
    }, 1500);
  };
  
  // Handle copying share link
  const handleCopyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard", {
      description: "You can now share this link with others."
    });
  };
  
  // Handle adding a collaborator
  const handleAddCollaborator = () => {
    if (!selectedCollaborator || !selectedNote) return;
    
    setNotes(currentNotes => 
      currentNotes.map(note => {
        if (note.id === selectedNote.id) {
          // Find if this collaborator is already added
          const existingCollaborator = note.collaborators?.find(
            collab => collab.id === selectedCollaborator.id
          );
          
          if (existingCollaborator) {
            toast.info("Collaborator already added", {
              description: `${selectedCollaborator.name} is already a collaborator on this note.`
            });
            return note;
          }
          
          // Add the new collaborator
          const updatedCollaborators = [
            ...(note.collaborators || []),
            { ...selectedCollaborator, role: selectedRole as "viewer" | "editor" | "owner" }
          ];
          
          return {
            ...note,
            collaborators: updatedCollaborators,
            isShared: true,
            permissions: "shared" as NotePermission
          };
        }
        return note;
      })
    );
    
    setCollaboratorDialogOpen(false);
    setSelectedCollaborator(null);
    setSelectedRole("viewer");
    
    toast.success("Collaborator added", {
      description: `${selectedCollaborator.name} can now ${selectedRole === "viewer" ? "view" : selectedRole === "editor" ? "edit" : "manage"} this note.`
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Documents
                </span>
              </CardTitle>
              <CardDescription>
                Manage your documents, folders, and shared files
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </CardHeader>
        
        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="folders">Folders</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <TabsContent value="all" className="flex-1 p-6 pt-4 overflow-hidden flex">
              <div className="w-1/3 pr-4 border-r overflow-y-auto">
                <div className="space-y-1">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 opacity-20 mb-2" />
                      <p>No documents found</p>
                      <Button 
                        variant="link" 
                        onClick={() => setShowCreateDialog(true)}
                        className="mt-2"
                      >
                        Create a new document
                      </Button>
                    </div>
                  ) : (
                    filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted group",
                          selectedNote?.id === note.id && "bg-muted"
                        )}
                        onClick={() => handleSelectNote(note)}
                      >
                        <div className="flex items-center">
                          {note.type === "folder" ? (
                            <Folder className="h-4 w-4 mr-2 text-blue-500" />
                          ) : (
                            <File className="h-4 w-4 mr-2 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">{note.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {note.lastUpdated.toLocaleDateString()} · {note.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(note.id);
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                note.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectNote(note);
                                  setIsEditing(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(note.id);
                                }}
                              >
                                {note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectNote(note);
                                  setShareDialogOpen(true);
                                }}
                              >
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectNote(note);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="w-2/3 pl-4 overflow-y-auto">
                {selectedNote ? (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      {isEditing ? (
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-xl font-bold"
                        />
                      ) : (
                        <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        {selectedNote.type === "document" && (
                          <>
                            {isEditing ? (
                              <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateNote}>Save</Button>
                              </>
                            ) : (
                              <Button onClick={() => setIsEditing(true)}>Edit</Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {selectedNote.type === "folder" ? "Folder" : "Document"}
                      </Badge>
                      
                      {selectedNote.isShared && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                          Shared
                        </Badge>
                      )}
                      
                      {selectedNote.isFavorite && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 text-xs">
                          Favorite
                        </Badge>
                      )}
                      
                      {selectedNote.tags?.map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            tag.color === "blue" && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                            tag.color === "green" && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                            tag.color === "red" && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                            tag.color === "purple" && "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                            tag.color === "orange" && "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                          )}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      Last updated: {selectedNote.lastUpdated.toLocaleString()}
                    </div>
                    
                    {selectedNote.collaborators && selectedNote.collaborators.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Collaborators</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedNote.collaborators.map(collaborator => (
                            <div 
                              key={collaborator.id}
                              className="flex items-center bg-muted rounded-full pl-1 pr-3 py-1"
                            >
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={collaborator.avatar} />
                                <AvatarFallback>{collaborator.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm">{collaborator.name}</div>
                                <div className="text-xs text-muted-foreground">{collaborator.role}</div>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => setCollaboratorDialogOpen(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedNote.type === "document" ? (
                      isEditing ? (
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="flex-1 min-h-[300px] font-mono text-sm"
                        />
                      ) : (
                        <div className="flex-1 overflow-y-auto prose dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap">{selectedNote.content}</pre>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        {notes
                          .filter(note => note.parentId === selectedNote.id)
                          .map(childNote => (
                            <Card 
                              key={childNote.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleSelectNote(childNote)}
                            >
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                {childNote.type === "folder" ? (
                                  <Folder className="h-12 w-12 text-blue-500 mb-2" />
                                ) : (
                                  <FileText className="h-12 w-12 text-gray-500 mb-2" />
                                )}
                                <h3 className="font-medium">{childNote.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {childNote.lastUpdated.toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        
                        <Card 
                          className="cursor-pointer hover:bg-muted/50 border-dashed"
                          onClick={() => setShowCreateDialog(true)}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                            <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                            <h3 className="font-medium">Add New</h3>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                    <h2 className="text-xl font-bold mb-2">No document selected</h2>
                    <p className="text-muted-foreground mb-4">
                      Select a document from the list or create a new one
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="flex-1 p-6 pt-4 overflow-auto">
              {/* Documents tab content - same structure as "all" but filtered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredNotes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 opacity-20 mb-2" />
                    <p>No documents found</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowCreateDialog(true)}
                      className="mt-2"
                    >
                      Create a new document
                    </Button>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <Card 
                      key={note.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedNote?.id === note.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectNote(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <File className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium">{note.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {note.lastUpdated.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(note.id);
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                note.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-2">
                          {note.isShared && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                              Shared
                            </Badge>
                          )}
                          
                          {note.tags && note.tags.length > 0 && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                note.tags[0].color === "blue" && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                                note.tags[0].color === "green" && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                                note.tags[0].color === "red" && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                                note.tags[0].color === "purple" && "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                                note.tags[0].color === "orange" && "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                              )}
                            >
                              {note.tags[0].name}
                            </Badge>
                          )}
                          
                          {note.tags && note.tags.length > 1 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 1}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="folders" className="flex-1 p-6 pt-4 overflow-auto">
              {/* Folders tab content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredNotes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Folder className="mx-auto h-8 w-8 opacity-20 mb-2" />
                    <p>No folders found</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setNewNoteType("folder");
                        setShowCreateDialog(true);
                      }}
                      className="mt-2"
                    >
                      Create a new folder
                    </Button>
                  </div>
                ) : (
                  filteredNotes.map(folder => (
                    <Card 
                      key={folder.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedNote?.id === folder.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectNote(folder)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <Folder className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium">{folder.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {folder.lastUpdated.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(folder.id);
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                folder.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                        
                        <div className="mt-4 text-sm text-muted-foreground">
                          {notes.filter(note => note.parentId === folder.id).length} items
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="shared" className="flex-1 p-6 pt-4 overflow-auto">
              {/* Shared tab content */}
              <div className="space-y-4">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 opacity-20 mb-2" />
                    <p>No shared documents found</p>
                    <p className="text-sm mt-1">
                      Share a document to see it here
                    </p>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            {note.type === "folder" ? (
                              <Folder className="h-5 w-5 text-blue-500 mt-0.5" />
                            ) : (
                              <File className="h-5 w-5 text-gray-500 mt-0.5" />
                            )}
                            <div>
                              <h3 className="font-medium">{note.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {note.lastUpdated.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectNote(note)}
                          >
                            Open
                          </Button>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Shared with</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                handleSelectNote(note);
                                setCollaboratorDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {note.collaborators ? (
                              note.collaborators.map(collaborator => (
                                <div 
                                  key={collaborator.id}
                                  className="flex items-center bg-muted rounded-full pl-1 pr-3 py-1"
                                >
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={collaborator.avatar} />
                                    <AvatarFallback>{collaborator.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm">{collaborator.name}</div>
                                    <div className="text-xs text-muted-foreground">{collaborator.role}</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Shared via link
                              </div>
                            )}
                          </div>
                          
                          {note.shareLink && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">Share link</h4>
                              <div className="flex items-center">
                                <Input 
                                  value={note.shareLink} 
                                  readOnly 
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2"
                                  onClick={() => handleCopyShareLink(note.shareLink!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="flex-1 p-6 pt-4 overflow-auto">
              {/* Favorites tab content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredNotes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Star className="mx-auto h-8 w-8 opacity-20 mb-2" />
                    <p>No favorites found</p>
                    <p className="text-sm mt-1">
                      Add items to your favorites to see them here
                    </p>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <Card 
                      key={note.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedNote?.id === note.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectNote(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            {note.type === "folder" ? (
                              <Folder className="h-5 w-5 text-blue-500 mt-0.5" />
                            ) : (
                              <File className="h-5 w-5 text-gray-500 mt-0.5" />
                            )}
                            <div>
                              <h3 className="font-medium">{note.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {note.lastUpdated.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(note.id);
                            }}
                          >
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-2">
                          {note.isShared && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                              Shared
                            </Badge>
                          )}
                          
                          {note.tags && note.tags.length > 0 && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                note.tags[0].color === "blue" && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                                note.tags[0].color === "green" && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                                note.tags[0].color === "red" && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                                note.tags[0].color === "purple" && "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                                note.tags[0].color === "orange" && "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                              )}
                            >
                              {note.tags[0].name}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      
      {/* Create Note Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {newNoteType === "folder" ? "Folder" : "Document"}</DialogTitle>
            <DialogDescription>
              {newNoteType === "folder" 
                ? "Create a new folder to organize your documents" 
                : "Create a new document to start writing"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Label>Type</Label>
              <Select value={newNoteType} onValueChange={(value) => setNewNoteType(value as "document" | "folder")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="folder">Folder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />
            </div>
            
            {newNoteType === "document" && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedNote?.type === "folder" ? "Folder" : "Document"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{selectedNote?.title}"</DialogTitle>
            <DialogDescription>
              Share this {selectedNote?.type === "folder" ? "folder" : "document"} with others or get a shareable link
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Share with people</h4>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setShareDialogOpen(false);
                  setCollaboratorDialogOpen(true);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Add collaborators
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Get a shareable link</h4>
              {selectedNote?.shareLink ? (
                <div className="flex items-center">
                  <Input 
                    value={selectedNote.shareLink} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => handleCopyShareLink(selectedNote.shareLink!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => selectedNote && handleShareNote(selectedNote.id)}
                  disabled={sharing}
                >
                  <Link className="mr-2 h-4 w-4" />
                  {sharing ? "Generating link..." : "Generate shareable link"}
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Collaborator Dialog */}
      <Dialog open={collaboratorDialogOpen} onOpenChange={setCollaboratorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collaborators</DialogTitle>
            <DialogDescription>
              Add people to collaborate on "{selectedNote?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select a person</Label>
              <Popover open={openCommandMenu} onOpenChange={setOpenCommandMenu}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedCollaborator
                      ? selectedCollaborator.name
                      : "Select a person..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search people..." />
                    <CommandList>
                      <CommandEmpty>No people found.</CommandEmpty>
                      <CommandGroup>
                        {availableCollaborators.map((collaborator) => (
                          <CommandItem
                            key={collaborator.id}
                            onSelect={() => {
                              setSelectedCollaborator(collaborator);
                              setOpenCommandMenu(false);
                            }}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={collaborator.avatar} />
                                <AvatarFallback>{collaborator.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{collaborator.name}</div>
                                <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedCollaborator?.id === collaborator.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Can view</SelectItem>
                  <SelectItem value="editor">Can edit</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollaboratorDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCollaborator}
              disabled={!selectedCollaborator}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspacePanel;
