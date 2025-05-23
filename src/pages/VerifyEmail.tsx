
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmailWithHash = async () => {
      // Check if we have a hash in the URL (from Supabase redirect)
      const hash = window.location.hash;
      
      if (!hash) {
        setErrorMessage("No verification token found in the URL.");
        setVerificationStatus('error');
        return;
      }

      try {
        // When Supabase redirects back, it includes the email confirmation data in the URL hash
        // The URL will look something like: /verify#access_token=...&refresh_token=...&type=...
        
        // Process the hash to get auth params
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (!accessToken || !type) {
          throw new Error("Invalid verification link.");
        }
        
        // For email confirmation, we just need to set the session with the tokens
        // Supabase will handle email verification internally
        if (type === 'signup' || type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            throw error;
          }
          
          setVerificationStatus('success');
          
          // Show success toast and redirect to login
          setTimeout(() => {
            toast.success("Email verified successfully!");
            navigate('/login?verified=true');
          }, 2000);
        } else {
          throw new Error("Unknown verification type.");
        }
      } catch (error: any) {
        console.error("Email verification error:", error);
        setErrorMessage(error.message || "Failed to verify email.");
        setVerificationStatus('error');
        toast.error("Email verification failed", {
          description: error.message || "Please try again or contact support.",
        });
      }
    };

    verifyEmailWithHash();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStatus === 'loading' && "Verifying Your Email"}
            {verificationStatus === 'success' && "Email Verified"}
            {verificationStatus === 'error' && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'loading' && "Please wait while we verify your email address..."}
            {verificationStatus === 'success' && "Your email has been verified successfully."}
            {verificationStatus === 'error' && "We encountered a problem verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {verificationStatus === 'loading' && (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          )}
          
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center text-green-600 dark:text-green-400">
                You'll be redirected to login shortly.
              </p>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-center text-red-600 dark:text-red-400">
                {errorMessage || "An unknown error occurred."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant={verificationStatus === 'error' ? "default" : "outline"}
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
