
import React from "react";
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  User, 
  X, 
  Home,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

export type ActivePanel = "workspace" | "calendar" | "community" | "video" | "profile";

interface MobileMenuProps {
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
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const isAdmin = currentRole === 'admin';

  const handleHomeClick = () => {
    navigate("/warrior-space");
    onClose();
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/admin");
      onClose();
    }
  };

  const handlePanelClick = (panel: ActivePanel) => {
    onPanelChange(panel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 left-0 w-64 bg-background border-r shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={handleHomeClick}
          >
            <Home className="h-5 w-5" />
            <span>Warrior's Space</span>
          </Button>
          
          <Button
            variant={activePanel === "workspace" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-12"
            onClick={() => handlePanelClick("workspace")}
          >
            <LayoutGrid className="h-5 w-5" />
            <span>Workspace</span>
          </Button>
          
          <Button
            variant={activePanel === "calendar" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-12"
            onClick={() => handlePanelClick("calendar")}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </Button>
          
          <Button
            variant={activePanel === "community" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-12"
            onClick={() => handlePanelClick("community")}
          >
            <Users className="h-5 w-5" />
            <span>Community Chat</span>
          </Button>
          
          <Button
            variant={activePanel === "video" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-12"
            onClick={() => handlePanelClick("video")}
          >
            <Video className="h-5 w-5" />
            <span>Video Call</span>
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleAdminClick}
            >
              <Shield className="h-5 w-5" />
              <span>Admin Panel</span>
            </Button>
          )}
          
          <Button
            variant={activePanel === "profile" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-12"
            onClick={() => handlePanelClick("profile")}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
