
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';
import ComingSoonBanner from './ComingSoonBanner';

const DOCUMENT_TYPES = [
  { id: 'doc', name: 'Document', icon: <Icons.FileText size={20} className="text-blue-500" /> },
  { id: 'sheet', name: 'Spreadsheet', icon: <Icons.BarChart size={20} className="text-green-500" /> },
  { id: 'slide', name: 'Presentation', icon: <Icons.LayoutDashboard size={20} className="text-orange-500" /> },
  { id: 'draw', name: 'Drawing', icon: <Icons.Cpu size={20} className="text-purple-500" /> },
  { id: 'form', name: 'Form', icon: <Icons.CheckCircle size={20} className="text-red-500" /> },
];

interface Document {
  id: string;
  name: string;
  type: string;
  lastEdited: string;
  sharedWith: number;
  starred: boolean;
  size?: string;
}

const WorkspacePanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Project Roadmap', type: 'doc', lastEdited: '2 hours ago', sharedWith: 3, starred: true },
    { id: '2', name: 'Financial Analysis', type: 'sheet', lastEdited: '1 day ago', sharedWith: 2, starred: false },
    { id: '3', name: 'Team Presentation', type: 'slide', lastEdited: '3 days ago', sharedWith: 5, starred: true },
    { id: '4', name: 'Marketing Strategy', type: 'doc', lastEdited: '4 days ago', sharedWith: 1, starred: false },
    { id: '5', name: 'Product Mockups', type: 'draw', lastEdited: '1 week ago', sharedWith: 2, starred: false },
    { id: '6', name: 'User Feedback', type: 'form', lastEdited: '2 weeks ago', sharedWith: 0, starred: true },
  ]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateDocument = (type: string) => {
    const newDoc: Document = {
      id: (documents.length + 1).toString(),
      name: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      lastEdited: 'Just now',
      sharedWith: 0,
      starred: false
    };
    
    setDocuments([newDoc, ...documents]);
    setShowCreateDialog(false);
    
    toast.success(`New ${type} created!`, {
      description: "You can now start editing your document."
    });
  };
  
  const toggleStar = (id: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === id ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };
  
  const handleUpload = () => {
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev !== null && prev < 100) {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(null);
              const newDoc: Document = {
                id: (documents.length + 1).toString(),
                name: `Uploaded File ${Math.floor(Math.random() * 1000)}`,
                type: 'doc',
                lastEdited: 'Just now',
                sharedWith: 0,
                starred: false,
                size: '1.2 MB'
              };
              setDocuments([newDoc, ...documents]);
              
              toast.success('File uploaded successfully!');
            }, 500);
          }
          return newProgress;
        }
        return prev;
      });
    }, 300);
  };
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.id === type);
    return docType?.icon || <Icons.FileText size={20} className="text-primary" />;
  };
  
  return (
    <div className="p-6 h-full relative overflow-hidden">
      {/* Celestial background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Workspace</h2>
            <p className="text-sm text-muted-foreground">Organize and manage your documents</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-60">
              <Input 
                placeholder="Search files..."
                className="pl-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
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
                className="hidden md:flex"
              >
                {viewMode === 'grid' ? <Icons.LayoutGrid size={18} /> : <Icons.LineChart size={18} />}
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Icons.Plus size={16} />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create new document</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                    {DOCUMENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        onClick={() => handleCreateDocument(type.id)}
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          {type.icon}
                        </div>
                        <span className="text-sm font-medium">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleUpload}>
                <Icons.Upload size={16} />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              
              <Button size="sm" className="flex items-center gap-1">
                <Icons.Plus size={16} />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading file...</span>
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="drive">Drive Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-4 mt-4">
            <ScrollArea className="h-[calc(100vh-260px)]">
              {searchQuery && filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Icons.Search size={48} className="mb-2 text-muted-foreground opacity-20" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 hover:translate-y-[-2px] duration-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded flex items-center justify-center">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium truncate">{doc.name}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => toggleStar(doc.id)}
                            >
                              <Icons.Star 
                                size={16} 
                                className={doc.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} 
                              />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500 truncate">Last edited {doc.lastEdited}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500 justify-between">
                            <div className="flex items-center">
                              <Icons.Users size={14} className="mr-1" />
                              <span>{doc.sharedWith > 0 ? `You and ${doc.sharedWith} others` : 'Only you'}</span>
                            </div>
                            {doc.size && <span>{doc.size}</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer backdrop-blur-sm bg-white/60 dark:bg-gray-800/60"
                    >
                      <div className="mr-3">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">Last edited {doc.lastEdited}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.sharedWith > 0 && (
                          <div className="flex -space-x-2">
                            {Array.from({ length: Math.min(doc.sharedWith, 3) }).map((_, i) => (
                              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback>U{i+1}</AvatarFallback>
                              </Avatar>
                            ))}
                            {doc.sharedWith > 3 && (
                              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-background text-xs">
                                +{doc.sharedWith - 3}
                              </div>
                            )}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => toggleStar(doc.id)}
                        >
                          <Icons.Star 
                            size={16} 
                            className={doc.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} 
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Icons.MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Icons.FileText size={14} className="mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Icons.Share2 size={14} className="mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Icons.Download size={14} className="mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Icons.Trash size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="favorites" className="space-y-4 mt-4">
            <ScrollArea className="h-[calc(100vh-260px)]">
              {documents.filter(doc => doc.starred).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
                  <div className="w-24 h-24 mb-4 opacity-20">
                    <img 
                      src="/lovable-uploads/be262162-c56d-43d0-8722-602aa9fa0cba.png" 
                      alt="Whale illustration" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-sm text-gray-500 max-w-md">Star your most important documents to access them quickly</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documents
                    .filter(doc => doc.starred)
                    .map((doc) => (
                      <Card key={doc.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium truncate">{doc.name}</h3>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => toggleStar(doc.id)}
                              >
                                <Icons.Star size={16} className="text-yellow-400 fill-yellow-400" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500 truncate">Last edited {doc.lastEdited}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Icons.Users size={14} className="mr-1" />
                              <span>{doc.sharedWith > 0 ? `You and ${doc.sharedWith} others` : 'Only you'}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {documents
                    .filter(doc => doc.starred)
                    .map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer backdrop-blur-sm bg-white/60 dark:bg-gray-800/60"
                      >
                        <div className="mr-3">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                          <p className="text-xs text-gray-500">Last edited {doc.lastEdited}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.sharedWith > 0 && (
                            <Badge variant="outline">{doc.sharedWith} users</Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => toggleStar(doc.id)}
                          >
                            <Icons.Star 
                              size={16} 
                              className="text-yellow-400 fill-yellow-400"
                            />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="shared" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
              <div className="w-24 h-24 mb-4 opacity-20">
                <img 
                  src="/lovable-uploads/be262162-c56d-43d0-8722-602aa9fa0cba.png" 
                  alt="Whale illustration" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">No shared documents</h3>
              <p className="text-sm text-gray-500 max-w-md">Documents shared with you will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
              <div className="w-24 h-24 mb-4 opacity-20">
                <img 
                  src="/lovable-uploads/be262162-c56d-43d0-8722-602aa9fa0cba.png" 
                  alt="Whale illustration" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">No templates available</h3>
              <p className="text-sm text-gray-500 max-w-md">Create and save templates to streamline your workflow</p>
              
              <ComingSoonBanner 
                title="Templates Feature Coming Soon"
                description="We're working on bringing you customizable templates to help streamline your work."
                className="mt-8"
              />
            </div>
          </TabsContent>
          <TabsContent value="drive" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
              <div className="w-24 h-24 mb-4">
                <Icons.Cpu size={96} className="text-primary opacity-20" />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect to Google Drive</h3>
              <p className="text-sm text-gray-500 max-w-md mb-4">
                Seamlessly integrate with Google Drive to access all your documents in one place
              </p>
              
              <Button size="sm" className="flex items-center gap-2">
                <Icons.GitBranch size={16} />
                Connect to Google Drive
              </Button>
              
              <ComingSoonBanner 
                title="Advanced Drive Integration Coming Soon"
                description="We're enhancing our Google Drive integration with advanced sync features and collaborative editing."
                className="mt-8"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspacePanel;
