
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import VerificationPrompt from '@/components/auth/VerificationPrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verification';

const Auth: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUpSuccess = (email: string) => {
    setVerificationEmail(email);
    setMode('verification');
  };

  const renderAuthForm = () => {
    switch (mode) {
      case 'signup':
        return (
          <div className="space-y-4">
            <SignUpForm />
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setMode('login')}
                  >
                    Sign in here
                  </Button>
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm onBack={() => setMode('login')} />
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <VerificationPrompt email={verificationEmail} />
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode('login')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default: // login
        return (
          <div className="space-y-4">
            <LoginForm onForgotPassword={() => setMode('forgot-password')} />
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setMode('signup')}
                  >
                    Create one here
                  </Button>
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {renderAuthForm()}
      </div>
    </div>
  );
};

export default Auth;
