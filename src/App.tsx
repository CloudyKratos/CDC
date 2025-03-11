
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Test users data - enhanced with proper roles and profiles
const TEST_USERS = [
  { 
    id: '1', 
    email: 'user@example.com', 
    name: 'Standard User', 
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    permissions: ['read', 'comment']
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    permissions: ['read', 'write', 'delete', 'moderate', 'admin']
  },
  { 
    id: '3', 
    email: 'demo@example.com', 
    name: 'Demo Account', 
    role: 'demo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    permissions: ['read', 'comment', 'limited_write'],
    isDemo: true
  }
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);
  
  if (isAuthenticated === null) {
    // Loading state
    return <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    // Simple login for test accounts
    // In a real app, we would validate against a backend
    const testUser = TEST_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (testUser) {
      // In this test version, we're accepting any password for easy testing
      // In a real app, we would validate the password
      const loggedInUser = {
        ...testUser,
        lastLogin: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    }
    
    return false;
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
          <BrowserRouter>
            <Toaster />
            <Sonner position="top-right" closeButton richColors />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
