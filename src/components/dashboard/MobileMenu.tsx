
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  LayoutGrid, 
  Calendar, 
  MessageSquare, 
  Users, 
  Video,
  User,
  Home
} from "lucide-react";

export type ActivePanel = "workspace" | "calendar" | "chat" | "community" | "video" | "profile";

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activePanel,
  onPanelChange
}) => {
  const handlePanelSelect = (panel: ActivePanel) => {
    onPanelChange(panel);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="grid grid-cols-2 gap-2 p-4">
          <Link to="/home" className="w-full">
            <Button
              variant="outline"
              className="flex flex-col h-24 items-center justify-center gap-2 w-full"
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </Button>
          </Link>
          
          <Button
            variant={activePanel === "workspace" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("workspace")}
          >
            <LayoutGrid className="h-6 w-6" />
            <span>Workspace</span>
          </Button>
          
          <Button
            variant={activePanel === "calendar" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("calendar")}
          >
            <Calendar className="h-6 w-6" />
            <span>Calendar</span>
          </Button>
          
          <Button
            variant={activePanel === "chat" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("chat")}
          >
            <MessageSquare className="h-6 w-6" />
            <span>Chat</span>
          </Button>
          
          <Button
            variant={activePanel === "community" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("community")}
          >
            <Users className="h-6 w-6" />
            <span>Community</span>
          </Button>
          
          <Button
            variant={activePanel === "video" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("video")}
          >
            <Video className="h-6 w-6" />
            <span>Video</span>
          </Button>
          
          <Button
            variant={activePanel === "profile" ? "default" : "outline"}
            className="flex flex-col h-24 items-center justify-center gap-2"
            onClick={() => handlePanelSelect("profile")}
          >
            <User className="h-6 w-6" />
            <span>Profile</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileMenu;
