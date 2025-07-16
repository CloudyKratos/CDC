
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'invalid';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      // Check if we have required parameters
      if (!token || type !== 'email') {
        setStatus('invalid');
        setErrorMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const success = await verifyEmail(token);
        if (success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred during verification.'
        );
      }
    };

    verifyToken();
  }, [searchParams, verifyEmail]);

  // If already authenticated, redirect to main page
  if (isAuthenticated && status === 'success') {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl text-center">Verifying Email</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
              <CardDescription className="text-center">
                Your email has been successfully verified. You can now access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Welcome! Your account is now active and ready to use.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/">Go to Dashboard</Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
              <CardDescription className="text-center">
                We couldn't verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  This could happen if:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The verification link has expired</li>
                  <li>• The link has already been used</li>
                  <li>• The link was copied incorrectly</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Request New Verification Email</Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'invalid':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl text-center">Invalid Link</CardTitle>
              <CardDescription className="text-center">
                This verification link is not valid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/auth">Go to Sign In</Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/help">Get Help</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
