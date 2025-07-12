import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Users, MessageSquare, Settings, Trophy, Shield } from "lucide-react";
import { useState } from "react";
import { ProfileDropdown } from "./navbar/ProfileDropdown";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

interface NavbarProps {
  onMenuToggle: (open: boolean) => void;
  isMenuOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const isAdmin = currentRole === 'admin';

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
  };

  return (
    <div className="border-b h-16 border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container flex items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => onMenuToggle(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo and Brand */}
        <Link to="/" className="font-bold text-lg">
          Warrior Platform
        </Link>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <ProfileDropdown onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
