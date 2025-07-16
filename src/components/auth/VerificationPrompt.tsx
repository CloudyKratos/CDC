
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationPromptProps {
  email: string;
  onResendSuccess?: () => void;
}

const VerificationPrompt: React.FC<VerificationPromptProps> = ({ 
  email, 
  onResendSuccess 
}) => {
  const { resendVerificationEmail, isLoading } = useAuth();
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const canResend = () => {
    if (!lastResendTime) return true;
    const timeSinceLastResend = Date.now() - lastResendTime;
    const cooldownPeriod = 60000; // 1 minute
    return timeSinceLastResend > cooldownPeriod;
  };

  const handleResendEmail = async () => {
    if (!canResend() || resendAttempts >= 3) return;

    try {
      const success = await resendVerificationEmail(email);
      if (success) {
        setResendAttempts(prev => prev + 1);
        setLastResendTime(Date.now());
        setResendSuccess(true);
        onResendSuccess?.();
        
        // Hide success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  const getRemainingCooldown = () => {
    if (!lastResendTime) return 0;
    const timeSinceLastResend = Date.now() - lastResendTime;
    const cooldownPeriod = 60000; // 1 minute
    return Math.max(0, Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000));
  };

  const remainingCooldown = getRemainingCooldown();
  const maxAttemptsReached = resendAttempts >= 3;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
        <CardDescription className="text-center">
          We've sent a verification link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resendSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification email sent successfully! Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        {maxAttemptsReached && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Maximum resend attempts reached. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Click the verification link in your email to activate your account.</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• The link expires in 24 hours</li>
                  <li>• You can request a new link if needed</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              disabled={
                isLoading || 
                !canResend() || 
                maxAttemptsReached
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : remainingCooldown > 0 ? (
                `Resend in ${remainingCooldown}s`
              ) : maxAttemptsReached ? (
                'Max attempts reached'
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            {resendAttempts > 0 && !maxAttemptsReached && (
              <p className="text-sm text-muted-foreground text-center">
                Resend attempts: {resendAttempts}/3
              </p>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Having trouble? Check our{' '}
              <a href="/help/verification" className="text-primary hover:underline">
                verification help guide
              </a>{' '}
              or{' '}
              <a href="/contact" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationPrompt;
