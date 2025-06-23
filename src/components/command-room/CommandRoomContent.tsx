
import React, { Suspense, lazy } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load content components for better performance
const ResourcesPanel = lazy(() => import('./panels/ResourcesPanel'));
const TeamPanel = lazy(() => import('./panels/TeamPanel'));
const AnalyticsPanel = lazy(() => import('./panels/AnalyticsPanel'));
const SecurityPanel = lazy(() => import('./panels/SecurityPanel'));
const PerformancePanel = lazy(() => import('./panels/PerformancePanel'));
const IntegrationsPanel = lazy(() => import('./panels/IntegrationsPanel'));
const AutomationPanel = lazy(() => import('./panels/AutomationPanel'));
const SettingsPanel = lazy(() => import('./panels/SettingsPanel'));

const LoadingCard: React.FC = () => (
  <Card className="bg-black/20 backdrop-blur-lg border-white/10">
    <CardContent className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-white/70">Loading command interface...</p>
      </div>
    </CardContent>
  </Card>
);

const CommandRoomContent: React.FC = () => {
  return (
    <div className="relative z-10">
      <Suspense fallback={<LoadingCard />}>
        <TabsContent value="resources" className="mt-0 space-y-6">
          <ResourcesPanel />
        </TabsContent>

        <TabsContent value="team" className="mt-0 space-y-6">
          <TeamPanel />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 space-y-6">
          <AnalyticsPanel />
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-6">
          <SecurityPanel />
        </TabsContent>

        <TabsContent value="performance" className="mt-0 space-y-6">
          <PerformancePanel />
        </TabsContent>

        <TabsContent value="integrations" className="mt-0 space-y-6">
          <IntegrationsPanel />
        </TabsContent>

        <TabsContent value="automation" className="mt-0 space-y-6">
          <AutomationPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-6">
          <SettingsPanel />
        </TabsContent>
      </Suspense>
    </div>
  );
};

export default CommandRoomContent;
