
import React from "react";
import ProfilePanel from "./ProfilePanel";
import { useAuth } from "@/contexts/AuthContext";

const UserProfilePanel: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <ProfilePanel />
      
      {/* Additional profile controls could go here */}
    </div>
  );
};

export default UserProfilePanel;
