
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import AdminService from '@/services/AdminService';
import { toast } from 'sonner';

const CDCAccountManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cdcAccountExists, setCdcAccountExists] = useState(false);

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
              <p className="text-sm text-gray-600">cdcofficialeg@gmail.com</p>
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
          <p className="font-medium mb-1">Account Details:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email: cdcofficialeg@gmail.com</li>
            <li>Admin privileges with full platform access</li>
            <li>Enhanced security permissions</li>
            <li>Audit trail for all administrative actions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CDCAccountManager;
