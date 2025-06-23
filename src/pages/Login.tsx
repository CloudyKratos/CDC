
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
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%236366f1\" fill-opacity=\"0.05\"><circle cx=\"7\" cy=\"7\" r=\"7\"/></g></g></svg>')] opacity-30"></div>
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Logo size="lg" className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Sign in to continue your journey
          </CardDescription>
          
          {verified && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Email verified successfully!</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Your account is now active and ready to use.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                          className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
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
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
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
        
        <CardFooter className="pt-6 pb-8">
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
  );
};

export default Login;
