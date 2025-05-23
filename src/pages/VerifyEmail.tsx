
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { AlertCircle, CheckCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resendVerificationEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmailFromUrl = async () => {
      // Check for error parameters first
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('Email verification error:', { error, errorCode, errorDescription });
        
        let userFriendlyMessage = '';
        if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
          userFriendlyMessage = 'Your verification link has expired. Please request a new one.';
        } else if (errorCode === 'access_denied') {
          userFriendlyMessage = 'The verification link is invalid or has been used already.';
        } else {
          userFriendlyMessage = errorDescription || 'Email verification failed.';
        }
        
        setErrorMessage(userFriendlyMessage);
        setVerificationStatus('manual');
        return;
      }

      // Check for success parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (accessToken && type === 'signup') {
        try {
          setVerificationStatus('success');
          toast.success("Email verified successfully!");
          
          // Redirect to login with verification success flag
          setTimeout(() => {
            navigate('/login?verified=true');
          }, 2000);
        } catch (error) {
          console.error('Session setup error:', error);
          setErrorMessage('Failed to complete verification. Please try logging in.');
          setVerificationStatus('error');
        }
      } else {
        // No verification parameters found
        setErrorMessage('No verification information found in the link.');
        setVerificationStatus('manual');
      }
    };

    verifyEmailFromUrl();
  }, [navigate, searchParams]);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result) {
        toast.success('New verification email sent!', {
          description: 'Please check your inbox for the new verification link.',
        });
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Verifying your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-green-600 dark:text-green-400">
              Email verified successfully! Redirecting to login...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-center text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        );

      case 'manual':
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
              <Mail className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                {errorMessage}
              </p>
              <p className="text-muted-foreground text-sm">
                Enter your email address to receive a new verification link.
              </p>
            </div>
            <div className="w-full space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleResendVerification} 
                disabled={isResending || !email.trim()}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send New Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email';
      case 'success':
        return 'Email Verified';
      case 'error':
        return 'Verification Failed';
      case 'manual':
        return 'Email Verification';
      default:
        return 'Email Verification';
    }
  };

  const getDescription = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Please wait while we verify your email address...';
      case 'success':
        return 'Your email has been verified successfully.';
      case 'error':
        return 'We encountered a problem verifying your email.';
      case 'manual':
        return 'Request a new verification email to continue.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-center">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
          {verificationStatus !== 'manual' && (
            <Button 
              variant="outline"
              onClick={() => navigate('/signup')}
            >
              Sign Up Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
