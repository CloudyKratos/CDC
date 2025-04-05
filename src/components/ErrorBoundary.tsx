
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 rounded-lg border border-red-300 dark:border-red-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={this.handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-w-full text-left">
              <p className="font-medium mb-2">Error Details:</p>
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                {this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap break-words">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
