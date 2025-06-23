
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertTriangle, CheckCircle, Eye, FileText } from 'lucide-react';

const SecurityPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Security Score', value: '98.5%', status: 'excellent', icon: Shield },
          { label: 'Active Threats', value: '0', status: 'secure', icon: AlertTriangle },
          { label: 'Last Scan', value: '2 min ago', status: 'recent', icon: Eye }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-white/60 text-sm">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">Security Status</CardTitle>
          <CardDescription className="text-white/60">
            Real-time security monitoring and threat assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { check: 'SSL Certificate', status: 'valid', detail: 'Valid until Dec 2024' },
            { check: 'Firewall Status', status: 'active', detail: 'All ports secured' },
            { check: 'Access Control', status: 'secure', detail: 'Multi-factor enabled' },
            { check: 'Data Encryption', status: 'active', detail: 'AES-256 encryption' },
            { check: 'Backup Security', status: 'protected', detail: 'Encrypted backups' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">{item.check}</p>
                  <p className="text-white/60 text-sm">{item.detail}</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPanel;
