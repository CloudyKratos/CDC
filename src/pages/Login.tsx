
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowRight, LogIn, CheckCircle } from 'lucide-react';

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginValues = z.infer<typeof LoginSchema>;

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  
  const verified = searchParams.get('verified') === 'true';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show verification success message
  useEffect(() => {
    if (verified) {
      toast.success('Email verified successfully!', {
        description: 'You can now sign in to your account.'
      });
    }
  }, [verified]);

  // Initialize form
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginValues) => {
    clearError();
    
    try {
      await login(values.email, values.password);
      // Success handling is done in useAuthState
    } catch (error) {
      // Error handling is done in useAuthState
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 text-center px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                Sign in to your account to continue
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 sm:px-8">
            {/* Success message for verified email */}
            {verified && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Email verified successfully!</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      You can now sign in to your account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                    {error.includes('Email not confirmed') && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Please check your email and click the verification link before signing in.
                      </p>
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
                          type="email" 
                          placeholder="Enter your email address" 
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
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Enter your password" 
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
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
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
            <div className="w-full text-center space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <Link 
                  to="/forgot-password" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors text-sm"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
