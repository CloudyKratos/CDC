
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Form validation schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof LoginSchema>;

const Login = () => {
  const { login, isAuthenticated, isLoading, clearError, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState('');
  
  // Check if user was redirected after email verification
  const verified = searchParams.get('verified') === 'true';
  
  // Initialize form
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Clear auth context error when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show toast when email is verified
  useEffect(() => {
    if (verified) {
      toast.success("🎉 Email verification successful!", {
        description: "Welcome! You can now sign in to your account.",
      });
    }
  }, [verified]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!lastAttemptedEmail) return;
    
    setIsResendingVerification(true);
    try {
      const result = await resendVerificationEmail(lastAttemptedEmail);
      if (result) {
        toast.success('✉️ Verification email sent!', {
          description: 'Please check your inbox and spam folder.',
        });
        setShowResendOption(false);
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Form submission handler
  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    setShowResendOption(false);
    setLastAttemptedEmail(values.email);
    
    try {
      await login(values.email, values.password);
      toast.success("🎉 Welcome back!", {
        description: "Successfully signed in to your account.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error?.message || "Login failed";
      setErrorMessage(errorMsg);
      
      // Show specific toast and options based on error message
      if (errorMsg.toLowerCase().includes("invalid login") || 
          errorMsg.toLowerCase().includes("invalid credentials")) {
        toast.error("❌ Login failed", {
          description: "Invalid email or password. Please check your credentials and try again.",
        });
      } else if (errorMsg.toLowerCase().includes("email not confirmed") || 
                 errorMsg.toLowerCase().includes("email not verified") ||
                 errorMsg.toLowerCase().includes("confirm your email")) {
        toast.error("📧 Email not verified", {
          description: "Please verify your email before signing in.",
        });
        setShowResendOption(true);
      } else if (errorMsg.toLowerCase().includes("too many requests")) {
        toast.error("⏳ Too many attempts", {
          description: "Please wait a moment before trying again.",
        });
      } else {
        toast.error("❌ Sign in failed", {
          description: errorMsg,
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="group bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <Home className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Back to Home</span>
        </Button>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-1000"></div>
      </div>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 text-center px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl">
                  <Logo size="lg" className="text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                Sign in to continue your journey
              </CardDescription>
            </div>
            
            {verified && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-green-800 dark:text-green-300">Email verified successfully!</p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Your account is now active and ready to use.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="px-6 pb-6 sm:px-8">
            {errorMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
                    {showResendOption && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                          className="w-full border-red-200 text-red-700 hover:bg-red-50 transition-all duration-200"
                        >
                          {isResendingVerification ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending verification email...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend verification email
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email address" 
                          type="email" 
                          {...field} 
                          disabled={isLoading}
                          className="h-12 px-4 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Password
                        </FormLabel>
                        <Link 
                          to="/reset-password" 
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter your password" 
                            type={showPassword ? 'text' : 'password'} 
                            {...field} 
                            disabled={isLoading}
                            className="h-12 px-4 pr-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="px-6 pb-8 sm:px-8">
            <div className="w-full text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
