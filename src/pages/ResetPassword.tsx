import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Logo } from '@/components/ui/Logo';

// Email form schema
const EmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// Password reset form schema
const PasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof EmailSchema>;
type PasswordFormValues = z.infer<typeof PasswordSchema>;

const ResetPassword: React.FC = () => {
  const { resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in password update mode (with token)
  const [isUpdateMode] = useState(() => new URLSearchParams(location.search).has('token'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Email request form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: '',
    }
  });
  
  // Password update form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });
  
  // Handle email reset request
  const handleEmailSubmit = async (values: EmailFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await resetPassword(values.email);
      if (success) {
        setEmailSent(true);
      }
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password update
  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await updatePassword(values.password);
      if (success) {
        toast.success("Password updated successfully!");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error("Failed to update password", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isUpdateMode ? 'Set New Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {isUpdateMode 
              ? 'Enter your new password below' 
              : emailSent 
                ? 'Check your email for a reset link' 
                : 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUpdateMode ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </Form>
          ) : emailSent ? (
            <div className="text-center py-4 space-y-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <p className="mb-4">We've sent you an email with instructions to reset your password.</p>
                <p className="text-sm text-muted-foreground">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setEmailSent(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Send to a different email
              </Button>
            </div>
          ) : (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="pl-10" 
                            {...field} 
                            disabled={isSubmitting} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending email...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
