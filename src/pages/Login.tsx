
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthContext } from "../App";
import { Lock, Mail, Eye, EyeOff, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import WaitlistForm from "@/components/beta/WaitlistForm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showWaitlist, setShowWaitlist] = useState(false);
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    // Apply the background effect
    document.body.classList.add("login-page");
    
    // Clean up function
    return () => {
      document.body.classList.remove("login-page");
    };
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success("Login successful! Redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        setError("Invalid email or password. Note: This is a beta version, only registered beta testers can login.");
        toast.error("Login failed", {
          description: "Invalid credentials or you're not a registered beta tester."
        });
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      toast.error("Login failed", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("user@example.com");
    setPassword("password");
    
    setIsLoading(true);
    
    setTimeout(async () => {
      const success = await login("user@example.com", "password");
      
      if (success) {
        toast.success("Demo login successful! Redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        setError("Demo login failed. Please try again.");
        toast.error("Demo login failed");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-900 via-indigo-900/70 to-purple-900 text-white">
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-float animation-delay-200"></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-float animation-delay-400"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          >
            Welcome to Nexus
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-300 mt-2"
          >
            Connect with your community in real-time
          </motion.p>
        </div>
        
        <Card className="border-0 shadow-2xl bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
              
              <div className="relative flex items-center justify-center mt-4">
                <Separator className="w-full bg-gray-700" />
                <span className="absolute px-2 bg-black/40 text-gray-400 text-xs">OR</span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
                onClick={handleDemoLogin}
              >
                <UserCheck className="h-4 w-4" />
                <span>Continue as Demo User</span>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-xs text-gray-400">
              By signing in, you agree to our <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
            </p>
            
            <p className="text-center text-xs text-gray-500">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Beta Access Only
              </span> - Currently accepting new beta testers
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account? <button onClick={() => setShowWaitlist(true)} className="text-blue-400 hover:underline">Join the waitlist</button>
          </p>
        </div>
      </motion.div>

      <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
        <DialogContent className="bg-black/60 backdrop-blur-xl border-gray-800 text-white w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Join Nexus Beta
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Apply to be part of our exclusive beta testing program
            </DialogDescription>
          </DialogHeader>
          <WaitlistForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
