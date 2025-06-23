
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
import { Loader2, AlertCircle, CheckCircle, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

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

  // Form submission handler
  const onSubmit = async (values: SignUpValues) => {
    setErrorMessage(null);
    
    try {
      console.log("Form values:", values);
      const user = await signup(values.email, values.password, values.fullName);
      console.log("Sign-up response:", user);
      
      // Save email for resend functionality
      setSubmittedEmail(values.email);
      
      // Show success state regardless of user object
      setFormSubmitted(true);
      toast.success("🎉 Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Sign-up error:", error);
      const errorMessage = error.message || "Sign up failed";
      setErrorMessage(errorMessage);
      
      if (errorMessage.toLowerCase().includes("already registered") || 
          errorMessage.toLowerCase().includes("already been registered")) {
        toast.error("Email already in use", {
          description: "This email is already registered. Try signing in instead."
        });
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast.error("Password requirements not met", {
          description: "Please ensure your password meets the requirements."
        });
      } else {
        toast.error(`❌ Sign up failed: ${errorMessage}`);
      }
    }
  };

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (!submittedEmail) return;
    
    setIsResendingEmail(true);
    try {
      const result = await resendVerificationEmail(submittedEmail);
      if (result) {
        toast.success("✉️ Verification email resent!", {
          description: "Please check your inbox and spam folder."
        });
      } else {
        toast.error("Failed to resend verification email");
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResendingEmail(false);
    }
  };

  // If the form was submitted successfully, show confirmation message
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%2310b981\" fill-opacity=\"0.05\"><circle cx=\"7\" cy=\"7\" r=\"7\"/></g></g></svg>')] opacity-30"></div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              We've sent a verification email to
            </CardDescription>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
              {submittedEmail}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Mail className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Click the verification link in your email to activate your account
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Check your spam folder if you don't see the email</p>
                  <p>• The verification link expires in 24 hours</p>
                  <p>• Make sure to verify before signing in</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
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
                  <Mail className="h-5 w-5 mr-2" />
                  Resend verification email
                </>
              )}
            </Button>
          </CardContent>
          
          <CardFooter className="pt-6 pb-8">
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ec4899\" fill-opacity=\"0.05\"><circle cx=\"7\" cy=\"7\" r=\"7\"/></g></g></svg>')] opacity-30"></div>
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Our Community
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Create your account and start your journey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
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
                        className="h-12 px-4 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                        className="h-12 px-4 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                          className="h-12 px-4 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                          className="h-12 px-4 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
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
        
        <CardFooter className="pt-6 pb-8">
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
  );
};

export default SignUp;
