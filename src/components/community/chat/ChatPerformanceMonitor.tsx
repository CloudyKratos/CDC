import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetrics {
  messageCount: number;
  renderTime: number;
  memoryUsage: number;
  lastUpdate: number;
}

interface ChatPerformanceMonitorProps {
  messages: any[];
  isVisible?: boolean;
}

export const ChatPerformanceMonitor: React.FC<ChatPerformanceMonitorProps> = ({
  messages,
  isVisible = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    messageCount: 0,
    renderTime: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate render completion with timeout
    const timeoutId = setTimeout(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo 
        ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024 * 100) / 100
        : 0;

      setMetrics({
        messageCount: messages.length,
        renderTime: Math.round(renderTime * 100) / 100,
        memoryUsage,
        lastUpdate: Date.now()
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  if (!isVisible) return null;

  const getPerformanceColor = (renderTime: number) => {
    if (renderTime < 16) return 'bg-green-500'; // Good (60fps)
    if (renderTime < 33) return 'bg-yellow-500'; // Okay (30fps)
    return 'bg-red-500'; // Poor (<30fps)
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
      <div className="text-xs font-mono space-y-1">
        <div className="flex items-center gap-2">
          <span>Messages:</span>
          <Badge variant="outline" className="text-xs">
            {metrics.messageCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Render:</span>
          <Badge 
            className={`text-xs text-white ${getPerformanceColor(metrics.renderTime)}`}
          >
            {metrics.renderTime}ms
          </Badge>
        </div>
        
        {metrics.memoryUsage > 0 && (
          <div className="flex items-center gap-2">
            <span>Memory:</span>
            <Badge variant="outline" className="text-xs">
              {metrics.memoryUsage}MB
            </Badge>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Hook to monitor chat performance
export const useChatPerformance = (messages: any[]) => {
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle performance monitor with Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowMonitor(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    showMonitor,
    setShowMonitor,
    PerformanceMonitor: () => (
      <ChatPerformanceMonitor 
        messages={messages} 
        isVisible={showMonitor} 
      />
    )
  };
};