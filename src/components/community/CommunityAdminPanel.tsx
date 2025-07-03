
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart3, Webhook } from 'lucide-react';
import { ModerationPanel } from './moderation/ModerationPanel';
import { AnalyticsPanel } from './analytics/AnalyticsPanel';
import { WebhookManager } from './webhooks/WebhookManager';

export const CommunityAdminPanel: React.FC = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Community Administration</h1>
        <p className="text-gray-600 mt-2">Manage moderation, analytics, and integrations</p>
      </div>

      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="mt-6">
          <ModerationPanel />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsPanel />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
