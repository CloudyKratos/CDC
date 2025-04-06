
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SupabaseService from "@/services/SupabaseService";

const ResetPassword = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if we have a token in the URL for password reset
  React.useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStep('reset');
    }
  }, [searchParams]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await SupabaseService.resetPassword(email);
      
      if (success) {
        toast.success("Password reset email sent", {
          description: "Please check your inbox for instructions"
        });
        navigate("/login");
      }
    } catch (error) {
      toast.error("Failed to send reset email", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Password fields are required");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await SupabaseService.updatePassword(password);
      
      if (success) {
        toast.success("Password updated successfully", {
          description: "You can now login with your new password"
        });
        navigate("/login");
      }
    } catch (error) {
      toast.error("Failed to update password", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-indigo-900/70 to-purple-900 text-white">
      {/* Background elements - same as Login/SignUp */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-float animation-delay-200"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          >
            Reset Password
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-300 mt-2"
          >
            {step === 'request' ? 'Enter your email to receive reset instructions' : 'Create a new secure password'}
          </motion.p>
        </div>
        
        <Card className="border-0 shadow-2xl bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {step === 'request' ? 'Forgot Password' : 'Create New Password'}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {step === 'request' 
                ? "We'll send you instructions to reset your password" 
                : "Your password must be at least 6 characters"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'request' ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Sending instructions...</span>
                    </div>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Updating password...</span>
                    </div>
                  ) : (
                    <span>Update Password</span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-gray-300 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
