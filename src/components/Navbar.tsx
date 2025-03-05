
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          ? "py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center z-20">
          <Logo className="button-effect mr-2" />
          <span className="text-lg font-bold gradient-text">Nexus</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium link-underline"
          >
            Home
          </Link>
          <Link 
            to="#features" 
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium link-underline"
          >
            Features
          </Link>
          <Link 
            to="#about" 
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium link-underline"
          >
            About
          </Link>
        </div>

        <div className="flex items-center space-x-3 z-20">
          <ThemeToggle />
          
          <Link to="/dashboard">
            <Button variant="default" className="button-effect hidden md:flex bg-primary hover:bg-primary/90 shadow-sm">
              Get Started
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "h-screen translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 pt-20 pb-6">
          <div className="flex flex-col space-y-6 items-center">
            <Link 
              to="/" 
              className="text-xl font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="#features" 
              className="text-xl font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="#about" 
              className="text-xl font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4 w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
