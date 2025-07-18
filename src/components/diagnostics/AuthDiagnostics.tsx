
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Settings, Mail, Link as LinkIcon } from 'lucide-react';
import AuthenticationService from '@/services/AuthenticationService';

interface DiagnosticResult {
  isHealthy: boolean;
  issues: string[];
}

const AuthDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const result = await AuthenticationService.checkConfigurationHealth();
      setDiagnostics(result);
    } catch (error) {
      setDiagnostics({
        isHealthy: false,
        issues: [`Diagnostic check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const configurationSteps = [
    {
      title: "Site URL Configuration",
      description: "Set your site URL in Supabase Dashboard",
      url: "https://supabase.com/dashboard/project/onlamqkvlfjhtvqexyzq/auth/url-configuration",
      icon: <LinkIcon className="h-4 w-4" />,
      value: "https://be68b0ee-4a99-45bb-9354-5deba99e53fb.lovableproject.com"
    },
    {
      title: "Email Templates",
      description: "Reset email templates to default",
      url: "https://supabase.com/dashboard/project/onlamqkvlfjhtvqexyzq/auth/templates",
      icon: <Mail className="h-4 w-4" />,
      value: "Reset 'Confirm signup' template"
    },
    {
      title: "Auth Providers",
      description: "Enable email confirmations",
      url: "https://supabase.com/dashboard/project/onlamqkvlfjhtvqexyzq/auth/providers",
      icon: <Settings className="h-4 w-4" />,
      value: "Enable 'Email confirmations' and 'Signup'"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Authentication Diagnostics
              </CardTitle>
              <CardDescription>
                Check your Supabase authentication configuration
              </CardDescription>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Run Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {diagnostics && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {diagnostics.isHealthy ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <Badge variant={diagnostics.isHealthy ? "default" : "destructive"}>
                    {diagnostics.isHealthy ? "Healthy" : "Issues Found"}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {diagnostics.isHealthy 
                      ? "Your authentication configuration looks good!"
                      : `Found ${diagnostics.issues.length} issue(s) that need attention`
                    }
                  </p>
                </div>
              </div>
              
              {!diagnostics.isHealthy && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Issues:</h4>
                  <ul className="space-y-1">
                    {diagnostics.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Configuration Steps</CardTitle>
          <CardDescription>
            Complete these steps in your Supabase Dashboard to fix signup issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configurationSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <p className="text-sm text-blue-600 mt-2 font-mono">{step.value}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(step.url, '_blank')}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  These configuration changes must be made in the Supabase Dashboard. 
                  After making changes, run the diagnostic check again to verify everything is working.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDiagnostics;
