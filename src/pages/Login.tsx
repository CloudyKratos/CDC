
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
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
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
      toast.success("Email verification successful!", {
        description: "Your email has been verified. You can now log in.",
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
        toast.success('Verification email sent!', {
          description: 'Please check your inbox for the new verification link.',
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
      toast.success("Welcome back!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error?.message || "Login failed";
      setErrorMessage(errorMsg);
      
      // Show specific toast and options based on error message
      if (errorMsg.toLowerCase().includes("invalid login") || 
          errorMsg.toLowerCase().includes("invalid credentials")) {
        toast.error("Login failed", {
          description: "Invalid email or password. Please check your credentials and try again.",
        });
      } else if (errorMsg.toLowerCase().includes("email not confirmed") || 
                 errorMsg.toLowerCase().includes("email not verified") ||
                 errorMsg.toLowerCase().includes("confirm your email")) {
        toast.error("Email not verified", {
          description: "Please verify your email before logging in.",
        });
        setShowResendOption(true);
      } else if (errorMsg.toLowerCase().includes("too many requests")) {
        toast.error("Too many attempts", {
          description: "Please wait a moment before trying again.",
        });
      } else {
        toast.error("Login failed", {
          description: errorMsg,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
          
          {verified && (
            <div className="mt-2 w-full p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Email verified successfully! You can now sign in.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  {showResendOption && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="w-full"
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" type="email" {...field} disabled={isLoading} />
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
                      <FormLabel>Password</FormLabel>
                      <Link to="/reset-password" className="text-xs text-primary hover:underline">
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
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
