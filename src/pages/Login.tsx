
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Initialize form
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show success message if user just verified their email
  useEffect(() => {
    if (isVerified) {
      toast.success("Email verified successfully! You can now log in.", {
        duration: 5000
      });
    }
  }, [isVerified]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Form submission handler
  const onSubmit = async (values: LoginValues) => {
    setLocalError(null);
    setShowVerification(false);
    
    try {
      const result = await login(values.email, values.password);
      if (result) {
        // The auth state listener will handle redirect after login
      } else {
        setLocalError("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle email not confirmed error specially
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setLocalError("Your email address has not been verified.");
        setShowVerification(true);
        setVerificationEmail(values.email);
      } else {
        setLocalError(err.message || "An error occurred during login.");
      }
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setIsResendingEmail(true);
    try {
      const result = await resendVerificationEmail(verificationEmail);
      if (result) {
        toast.success("Verification email sent!", {
          description: "Please check your inbox and spam folder."
        });
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResendingEmail(false);
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
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 rounded-md flex items-start gap-2">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <p className="text-sm">Email verified successfully! You can now log in.</p>
            </div>
          )}

          {(localError || error) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{localError || error}</p>
            </div>
          )}
          
          {showVerification && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-400 rounded-md">
              <div className="flex flex-col space-y-2">
                <p className="text-sm">Your email address hasn't been verified yet.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center justify-center gap-2 w-full"
                  onClick={handleResendVerification}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    <div className="text-right text-sm">
                      <Link to="/reset-password" className="text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
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
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create Account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
