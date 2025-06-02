
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, AlertTriangle, Loader2, LogIn } from 'lucide-react';
import AdminService from '@/services/AdminService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CDCSetupPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetupCDCAdmin = async () => {
    setIsLoading(true);
    try {
      const success = await AdminService.setupCDCAsAdmin();
      if (success) {
        setSetupComplete(true);
        toast.success('CDC admin account has been set up successfully!');
        // Refresh the page after a short delay to update role context
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error setting up CDC admin:', error);
      toast.error('Failed to set up CDC admin account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCDCAccount = async () => {
    setIsLoading(true);
    try {
      const success = await AdminService.createCDCOfficialAccount();
      if (success) {
        setSetupComplete(true);
        toast.success('CDC Official Team account created successfully!');
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating CDC account:', error);
      toast.error('Failed to create CDC account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          CDC Admin Account Setup
        </CardTitle>
        <CardDescription>
          Set up the cdcofficialeg@gmail.com account as the main admin for this platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupComplete ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                CDC admin account has been set up successfully!
              </span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
              <p className="text-sm text-blue-700 mb-3">
                Now you can log in with the CDC admin credentials:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 mb-3">
                <li>• Email: cdcofficialeg@gmail.com</li>
                <li>• Password: CDC2024!SecurePassword</li>
              </ul>
              <Link to="/login">
                <Button className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login Page
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">Admin access required</p>
                <p className="text-sm text-amber-700">
                  Click below to set up cdcofficialeg@gmail.com as the admin account
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Option 1: Set Up Existing Account</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If cdcofficialeg@gmail.com already exists, this will assign admin role
                </p>
                <Button 
                  onClick={handleSetupCDCAdmin} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Set Up Admin Role'
                  )}
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Option 2: Create New Account</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create cdcofficialeg@gmail.com account with admin privileges
                </p>
                <Button 
                  onClick={handleCreateCDCAccount} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create CDC Account'
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Login Credentials:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email: cdcofficialeg@gmail.com</li>
                <li>• Password: CDC2024!SecurePassword</li>
                <li>• After setup, use these credentials to log in</li>
                <li>• You can change the password after logging in</li>
              </ul>
              <div className="mt-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Login Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CDCSetupPanel;
