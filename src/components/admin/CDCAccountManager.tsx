
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Users, AlertTriangle, CheckCircle, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';
import AdminService from '@/services/AdminService';
import { toast } from 'sonner';

const CDCAccountManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cdcAccountExists, setCdcAccountExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const cdcCredentials = {
    email: 'cdcofficialeg@gmail.com',
    password: 'CDC2024!SecurePassword'
  };

  useEffect(() => {
    checkCDCAccount();
  }, []);

  const checkCDCAccount = async () => {
    setIsChecking(true);
    try {
      const exists = await AdminService.checkCDCAccountExists();
      setCdcAccountExists(exists);
    } catch (error) {
      console.error('Error checking CDC account:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateCDCAccount = async () => {
    setIsCreating(true);
    try {
      const success = await AdminService.createCDCOfficialAccount();
      if (success) {
        setCdcAccountExists(true);
        toast.success('CDC Official Team account setup successfully');
      }
    } catch (error) {
      console.error('Error setting up CDC account:', error);
      toast.error('Failed to setup CDC account');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <Card className="border-2 border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <Crown className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-red-900">CDC Official Team Account</CardTitle>
            <CardDescription className="text-red-700">
              Secure admin account for CDC support team
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">CDC Official Team</p>
              <p className="text-sm text-gray-600">{cdcCredentials.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 hover:bg-red-600">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
            {isChecking ? (
              <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
            ) : cdcAccountExists ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </div>

        {/* Login Credentials Section */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access Credentials
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email:</p>
                <p className="text-sm text-gray-600">{cdcCredentials.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(cdcCredentials.email, 'Email')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Password:</p>
                <p className="text-sm text-gray-600 font-mono">
                  {showPassword ? cdcCredentials.password : '••••••••••••••••••'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(cdcCredentials.password, 'Password')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
            <strong>Note:</strong> Use these credentials to log in as the CDC Official Team. 
            Keep this information secure and only share with authorized CDC team members.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Full User Management</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Create, modify, and delete users</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Security Controls</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Platform-wide security settings</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleCreateCDCAccount}
            disabled={isCreating || cdcAccountExists}
            className="flex-1"
            variant={cdcAccountExists ? "outline" : "default"}
          >
            {isCreating ? (
              <>Setting up...</>
            ) : cdcAccountExists ? (
              <>Account Active</>
            ) : (
              <>Setup CDC Account</>
            )}
          </Button>
          
          <Button
            onClick={checkCDCAccount}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <p className="font-medium mb-1">Account Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Full administrative privileges across the platform</li>
            <li>User management and role assignment capabilities</li>
            <li>Enhanced security permissions and audit trail</li>
            <li>Access to all platform analytics and metrics</li>
            <li>System-wide configuration and settings control</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CDCAccountManager;
