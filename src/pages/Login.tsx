
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Github, Twitter, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [formPosition, setFormPosition] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Animate form on load
  useEffect(() => {
    const timer = setTimeout(() => setFormPosition(1), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo login - in a real app, you would validate credentials with an API
      if (email === 'user@example.com' && password === 'password') {
        // Store user info in localStorage
        const user = {
          id: '1',
          name: 'Demo User',
          email: 'user@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        toast({
          title: 'Success',
          description: 'You have successfully logged in',
        });
        
        navigate('/dashboard');
      } else {
        // For demo purposes - make login easy
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          name: 'Demo User',
          email: email,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        }));
        
        toast({
          title: 'Demo Mode',
          description: 'Logged in with demo account',
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {/* Left Content Side with Background */}
      <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-purple-600 p-12 text-white flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-purple-600 pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <Logo className="h-10 w-10 text-white" />
            <h1 className="text-2xl font-bold">Nexus</h1>
          </div>
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold leading-tight">Connect, Collaborate, and Organize in One Space</h2>
          <p className="text-lg text-white/80 max-w-md">
            Join thousands of entrepreneurs already using Nexus to connect with their community and organize their workflow.
          </p>
          <div className="flex space-x-4">
            <div className="h-1 w-20 bg-white/80 rounded-full"></div>
            <div className="h-1 w-10 bg-white/40 rounded-full"></div>
            <div className="h-1 w-6 bg-white/20 rounded-full"></div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"></path>
                </svg>
              </div>
              <p className="text-white/90">Real-time community chat</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"></path>
                </svg>
              </div>
              <p className="text-white/90">Smart workspace organization</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"></path>
                </svg>
              </div>
              <p className="text-white/90">Connect with like-minded entrepreneurs</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right Login Form Side */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 via-background to-gray-50/50 dark:from-gray-900/50 dark:via-background dark:to-gray-900/50 min-h-screen">
        <div className="p-4 flex justify-between items-center md:absolute md:top-0 md:right-0 md:p-6 w-full md:w-1/2">
          <div className="md:hidden flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-xl font-bold">Nexus</h1>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 relative">
          <div className="absolute -top-[30%] -right-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl hidden md:block"></div>
          <div className="absolute -bottom-[30%] -left-[20%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl hidden md:block"></div>
          
          <div 
            className={cn(
              "w-full max-w-md transition-all duration-700 ease-out transform relative z-10",
              formPosition === 0 ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sign in to continue to your account
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 glass-morphism">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Lock size={16} className="mr-2 text-gray-400" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary/80">
                      Forgot password?
                    </a>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full group bg-primary hover:bg-primary/90 relative overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-purple-500/80 group-hover:opacity-90 transition-opacity"></span>
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "Sign in"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </span>
                </Button>
                
                <div className="relative flex items-center justify-center mt-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 absolute w-full"></div>
                  <div className="bg-white dark:bg-gray-800 px-3 relative z-10 text-sm text-gray-500 dark:text-gray-400">or continue with</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="flex items-center justify-center py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Github size={18} />
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Twitter size={18} />
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Facebook size={18} />
                  </Button>
                </div>
              </form>
            </div>
            
            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
