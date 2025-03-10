
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatedTransition } from "./components/AnimatedTransition";
import { useEffect, useState, createContext } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BetaAdmin from "./pages/BetaAdmin";

// Default beta testers data as fallback
const DEFAULT_BETA_TESTERS = [
  { id: '1', email: 'user@example.com', name: 'Demo User', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: '3', email: 'john@example.com', name: 'John Doe', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: '4', email: 'alex@example.com', name: 'Alex Johnson', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: '5', email: 'maria@example.com', name: 'Maria Garcia', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { id: '6', email: 'sam@example.com', name: 'Sam Wilson', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { id: '7', email: 'taylor@example.com', name: 'Taylor Swift', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
  { id: '8', email: 'chris@example.com', name: 'Chris Evans', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
  { id: '9', email: 'emma@example.com', name: 'Emma Watson', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: '10', email: 'robert@example.com', name: 'Robert Downey', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
];

// Create auth context
export const AuthContext = createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'Admin');
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  
  if (isAuthenticated === null) {
    // Loading state
    return <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply color theme
    const colorTheme = localStorage.getItem('colorTheme') || 'blue';
    document.documentElement.classList.add(`theme-${colorTheme}`);
    
    // Load user from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Apply prefers-color-scheme detection
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!localStorage.getItem('darkMode')) {
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    }
    
    // Initialize beta testers in localStorage if not present
    if (!localStorage.getItem('betaTesters')) {
      localStorage.setItem('betaTesters', JSON.stringify(DEFAULT_BETA_TESTERS));
    }
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      console.log("Login function called with email:", email);
      
      // Get beta testers from localStorage, falling back to default list
      const storedTesters = localStorage.getItem('betaTesters');
      const betaTesters = storedTesters ? JSON.parse(storedTesters) : DEFAULT_BETA_TESTERS;
      
      console.log("Available beta testers:", betaTesters);
      
      // For beta testing, we only allow specific emails
      const betaTester = betaTesters.find((tester: any) => 
        tester.email.toLowerCase() === email.toLowerCase()
      );
      
      console.log("Found beta tester:", betaTester);
      
      if (betaTester) {
        // In a real app, we would validate the password here
        const loggedInUser = {
          ...betaTester,
          // Add any additional user data here
          lastLogin: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in login function:", error);
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAuthenticated: !!user, 
      login,
      logout
    }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton richColors />
          <BrowserRouter>
            <AnimatedTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/beta-admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <BetaAdmin />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatedTransition>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
