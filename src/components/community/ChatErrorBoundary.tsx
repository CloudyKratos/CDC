
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

export class ChatErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 ChatErrorBoundary caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain types of errors
    if (this.isRecoverableError(error) && this.state.retryCount < 3) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /network/i,
      /connection/i,
      /timeout/i,
      /fetch/i,
      /subscription/i
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || 
      pattern.test(error.name)
    );
  }

  private scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    this.retryTimeout = setTimeout(() => {
      console.log(`🔄 Auto-retrying chat (attempt ${this.state.retryCount + 1})`);
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleManualRetry = () => {
    console.log('🔄 Manual retry triggered');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRecoverable = this.state.error ? this.isRecoverableError(this.state.error) : false;
      const canRetry = this.state.retryCount < 3;

      return (
        <div className="h-full flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                      Community Chat Error
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {this.state.error?.message || 'An unexpected error occurred in the chat.'}
                    </p>
                    {this.state.retryCount > 0 && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        Retry attempts: {this.state.retryCount}/3
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isRecoverable && canRetry && (
                      <Button
                        onClick={this.handleManualRetry}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Chat
                      </Button>
                    )}
                    
                    <Button
                      onClick={this.handleReload}
                      size="sm"
                      variant="default"
                      className="flex-1"
                    >
                      Reload Page
                    </Button>
                  </div>

                  {!isRecoverable && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                      This error requires a page reload to recover.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
