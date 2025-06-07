
import { toast } from 'sonner';

export interface CalendarError {
  code: string;
  message: string;
  details?: any;
  recoverable?: boolean;
}

export class CalendarErrorHandler {
  static handleError(error: any, context: string): CalendarError {
    console.error(`📅 Calendar Error in ${context}:`, error);
    
    let calendarError: CalendarError;
    
    if (error?.code) {
      // Database errors
      calendarError = this.handleDatabaseError(error);
    } else if (error?.message) {
      // Application errors
      calendarError = this.handleApplicationError(error);
    } else {
      // Unknown errors
      calendarError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error,
        recoverable: true
      };
    }
    
    // Show user-friendly error message
    this.showUserError(calendarError, context);
    
    return calendarError;
  }
  
  private static handleDatabaseError(error: any): CalendarError {
    const errorMap: Record<string, CalendarError> = {
      '23505': {
        code: 'DUPLICATE_EVENT',
        message: 'An event already exists at this time',
        recoverable: true
      },
      '23503': {
        code: 'INVALID_REFERENCE',
        message: 'Referenced data no longer exists',
        recoverable: true
      },
      '42501': {
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action',
        recoverable: false
      }
    };
    
    return errorMap[error.code] || {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      details: error,
      recoverable: true
    };
  }
  
  private static handleApplicationError(error: any): CalendarError {
    if (error.message.includes('title is required')) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Event title is required',
        recoverable: true
      };
    }
    
    if (error.message.includes('authentication')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Please log in to continue',
        recoverable: true
      };
    }
    
    return {
      code: 'APPLICATION_ERROR',
      message: error.message || 'Application error occurred',
      details: error,
      recoverable: true
    };
  }
  
  private static showUserError(error: CalendarError, context: string) {
    const contextMessages: Record<string, string> = {
      'create': 'Failed to create event',
      'update': 'Failed to update event',
      'delete': 'Failed to delete event',
      'load': 'Failed to load events'
    };
    
    const contextMessage = contextMessages[context] || 'Calendar operation failed';
    
    if (error.recoverable) {
      toast.error(`${contextMessage}: ${error.message}`);
    } else {
      toast.error(`${contextMessage}: ${error.message}. Please contact support.`);
    }
  }
  
  static createRetryableError(message: string, originalError?: any): CalendarError {
    return {
      code: 'RETRYABLE_ERROR',
      message,
      details: originalError,
      recoverable: true
    };
  }
}
