
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
import { Loader2, AlertCircle, CheckCircle, Mail, Eye, EyeOff } from 'lucide-react';
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
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account before logging in.",
      });
    } catch (error: any) {
      console.error("Sign-up error:", error);
      const errorMessage = error.message || "Sign up failed";
      setErrorMessage(errorMessage);
      
      if (errorMessage.toLowerCase().includes("already registered") || 
          errorMessage.toLowerCase().includes("already been registered")) {
        toast.error("Email already in use", {
          description: "This email is already registered. Try logging in instead."
        });
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast.error("Password requirements not met", {
          description: "Please ensure your password meets the requirements."
        });
      } else {
        toast.error(`Sign up failed: ${errorMessage}`);
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
        toast.success("Verification email resent!", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="mb-2">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification email to <strong>{submittedEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Please click the verification link in your email to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Check your spam folder if you don't see the email.
              </p>
              <p className="text-sm text-muted-foreground">
                The verification link will expire in 24 hours.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleResendEmail}
              disabled={isResendingEmail}
            >
              {isResendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already verified your email?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Join us today and start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} disabled={isLoading} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" {...field} disabled={isLoading} />
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
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Create a secure password" 
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          placeholder="Confirm your password" 
                          {...field} 
                          disabled={isLoading} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
