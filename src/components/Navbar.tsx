
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled || !transparent
          ? "py-3 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo className="button-effect" />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-primary transition-colors font-medium link-underline"
          >
            Home
          </Link>
          <Link 
            to="#features" 
            className="text-gray-700 hover:text-primary transition-colors font-medium link-underline"
          >
            Features
          </Link>
          <Link 
            to="#about" 
            className="text-gray-700 hover:text-primary transition-colors font-medium link-underline"
          >
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="default" className="button-effect bg-primary hover:bg-primary/90 shadow-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
