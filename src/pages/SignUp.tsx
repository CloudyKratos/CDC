
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, Mail, Eye, EyeOff, ArrowRight, Sparkles, Shield, RefreshCw } from 'lucide-react';

// Form validation schema
const SignUpSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpValues = z.infer<typeof SignUpSchema>;

const SignUp: React.FC = () => {
  const { signup, isAuthenticated, isLoading, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize form
  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Form submission handler with enhanced error handling
  const onSubmit = async (values: SignUpValues) => {
    setErrorMessage(null);
    
    try {
      console.log("Starting signup process with values:", {
        email: values.email,
        fullName: values.fullName,
        passwordLength: values.password.length
      });
      
      const user = await signup(values.email, values.password, values.fullName);
      console.log("Sign-up response:", user);
      
      // Save email for resend functionality
      setSubmittedEmail(values.email);
      
      // Show success state regardless of user object
      setFormSubmitted(true);
      toast.success("🎉 Account created successfully!", {
        description: "Please check your email to verify your account.",
        duration: 5000,
      });
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error: any) {
      console.error("Sign-up error:", error);
      const errorMessage = error.message || "Sign up failed";
      setErrorMessage(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Enhanced error handling with specific user actions
      if (errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("already registered")) {
        toast.error("Email already in use", {
          description: "This email is already registered. Try signing in instead.",
          action: {
            label: "Sign In",
            onClick: () => navigate('/login')
          }
        });
      } else if (errorMessage.toLowerCase().includes("email") && 
                 errorMessage.toLowerCase().includes("config")) {
        toast.error("Email Service Issue", {
          description: "There's a temporary issue with our email service. Please try again in a few minutes.",
          duration: 8000,
        });
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        toast.error("Too Many Attempts", {
          description: "Please wait a few minutes before trying again.",
          duration: 6000,
        });
      } else if (errorMessage.toLowerCase().includes("disabled")) {
        toast.error("Registration Unavailable", {
          description: "Account registration is currently disabled. Please contact support.",
          duration: 8000,
        });
      } else {
        toast.error("Signup Failed", {
          description: errorMessage,
          duration: 6000,
        });
      }
    }
  };

  // Enhanced resend verification email handler
  const handleResendEmail = async () => {
    if (!submittedEmail) return;
    
    setIsResendingEmail(true);
    try {
      await resendVerificationEmail(submittedEmail);
      toast.success("✉️ Verification email resent!", {
        description: "Please check your inbox and spam folder.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      toast.error("Resend Failed", {
        description: error.message || "Failed to resend verification email. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Retry form submission
  const handleRetry = () => {
    setErrorMessage(null);
    form.handleSubmit(onSubmit)();
  };

  // If the form was submitted successfully, show confirmation message
  if (formSubmitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-4 text-center px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                  We've sent a verification email to
                </CardDescription>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg break-all">
                  {submittedEmail}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 pb-6 sm:px-8">
              <div className="space-y-6 text-center">
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20 animate-pulse"></div>
                    <Mail className="relative h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      Click the verification link in your email to activate your account
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Check your spam folder if you don't see the email</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>The verification link expires in 24 hours</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Make sure to verify before signing in</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition-all duration-200 hover:scale-[1.02]"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Resending email...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-8 sm:px-8">
              <div className="w-full text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already verified your email?{' '}
                  <Link 
                    to="/login" 
                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 text-center px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join Our Community
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                Create your account and start your journey
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 sm:px-8">
            {errorMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
                    {retryCount > 0 && (
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRetry}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Try Again
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate('/login')}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Sign In Instead
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                          disabled={isLoading} 
                          className="h-12 px-4 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          type="email" 
                          placeholder="Enter your email address" 
                          {...field} 
                          disabled={isLoading} 
                          className="h-12 px-4 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
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
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Create a secure password" 
                            {...field} 
                            disabled={isLoading} 
                            className="h-12 px-4 pr-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
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
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            placeholder="Confirm your password" 
                            {...field} 
                            disabled={isLoading} 
                            className="h-12 px-4 pr-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Password must be at least 6 characters long
                      </p>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
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
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
