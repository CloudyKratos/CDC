
import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit3,
  Trash,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: Date;
  emoji?: string;
}

export const WorkspacePanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Project Ideas",
      content: "List of potential startup ideas to explore",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      emoji: "💡"
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Notes from investor meeting on July 15",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3),
      emoji: "📝"
    },
    {
      id: "3",
      title: "Q3 Goals",
      content: "Quarterly objectives and key results",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
      emoji: "🎯"
    }
  ]);
  
  const [activeNote, setActiveNote] = useState<string | null>("1");
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "",
      lastUpdated: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setIsEditing(true);
  };
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeNoteData = notes.find(note => note.id === activeNote);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-lg overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText size={16} />
          </div>
          <h3 className="font-medium">Workspace</h3>
        </div>
        <Button
          onClick={handleCreateNote}
          size="sm"
          variant="outline"
          className="text-gray-600 hover:text-primary hover:border-primary"
        >
          <Plus size={16} className="mr-1" />
          New
        </Button>
      </div>
      
      <div className="flex h-full">
        <div className="w-64 border-r border-gray-100 bg-gray-50 flex flex-col">
          <div className="p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-9 bg-white border-gray-100"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto content-blur">
            {filteredNotes.length > 0 ? (
              <div className="space-y-1 p-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNote(note.id)}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-all hover:bg-white",
                      activeNote === note.id ? "bg-white shadow-sm" : "bg-transparent",
                      "animate-fade-in"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{note.emoji || "📄"}</span>
                        <div>
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{note.content}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {formatDate(note.lastUpdated)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notes found
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {activeNoteData ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{activeNoteData.emoji || "📄"}</span>
                  <h4 className="font-medium">{activeNoteData.title}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-primary">
                    <Edit3 size={16} className="mr-1" />
                    {isEditing ? "View" : "Edit"}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal size={18} />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto content-blur">
                {isEditing ? (
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
                    <textarea
                      value={activeNoteData.content}
                      onChange={(e) => {
                        const updatedNotes = notes.map(note => 
                          note.id === activeNote 
                            ? { ...note, content: e.target.value, lastUpdated: new Date() } 
                            : note
                        );
                        setNotes(updatedNotes);
                      }}
                      className="flex-1 resize-none text-gray-700 outline-none border-none p-0 bg-transparent"
                      placeholder="Start writing your note..."
                    />
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-4">{activeNoteData.title}</h2>
                    <div className="text-gray-600 whitespace-pre-wrap">{activeNoteData.content || "No content yet"}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a note or create a new one
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
