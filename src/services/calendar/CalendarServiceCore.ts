
import { CalendarEventData, CalendarServiceResponse } from '@/types/calendar-events';
import { CalendarErrorHandler } from './CalendarErrorHandler';
import { EventValidationService } from './EventValidationService';
import { EventDataProcessor } from './EventDataProcessor';
import { AuthService } from './AuthService';
import { DatabaseService } from './DatabaseService';

export class CalendarServiceCore {
  private static retryAttempts = 3;
  private static retryDelay = 1000;

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries = this.retryAttempts
  ): Promise<CalendarServiceResponse<T>> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Calendar: ${context} (attempt ${attempt}/${maxRetries})`);
        const result = await operation();
        console.log(`✅ Calendar: ${context} succeeded`);
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Calendar: ${context} failed (attempt ${attempt}/${maxRetries})`, error);
        
        if (attempt < maxRetries && this.isRetryableError(error)) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }
        break;
      }
    }
    
    const calendarError = CalendarErrorHandler.handleError(lastError, context);
    return { 
      success: false, 
      error: calendarError.message, 
      code: calendarError.code 
    };
  }
  
  private static isRetryableError(error: any): boolean {
    // Network errors, temporary database issues, etc.
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'TEMPORARY_FAILURE'];
    return retryableCodes.includes(error.code) || 
           error.message?.includes('network') ||
           error.message?.includes('timeout');
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static async createEvent(eventData: CalendarEventData): Promise<CalendarServiceResponse<CalendarEventData>> {
    return this.executeWithRetry(async () => {
      console.log('🎯 CalendarServiceCore: Starting event creation process');
      
      // Step 1: Authentication
      const userId = await AuthService.getCurrentUser();
      console.log('👤 CalendarServiceCore: User authenticated:', userId);
      
      // Step 2: Validation
      EventValidationService.validateEventData(eventData);
      console.log('✅ CalendarServiceCore: Event data validated');
      
      // Step 3: Date validation
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();
      EventValidationService.validateDateLogic(startTime, endTime);
      console.log('📅 CalendarServiceCore: Date logic validated');
      
      // Step 4: Process data
      const processedData = EventDataProcessor.processEventData(eventData, userId);
      console.log('🔧 CalendarServiceCore: Data processed');
      
      // Step 5: Database insertion
      const result = await DatabaseService.insertEvent(processedData);
      console.log('💾 CalendarServiceCore: Event saved to database');
      
      return result;
    }, 'create');
  }
  
  static async updateEvent(id: string, updates: Partial<CalendarEventData>): Promise<CalendarServiceResponse<CalendarEventData>> {
    return this.executeWithRetry(async () => {
      console.log('🔄 CalendarServiceCore: Starting event update');
      
      // Validate updates if they include time changes
      if (updates.start_time && updates.end_time) {
        EventValidationService.validateDateLogic(updates.start_time, updates.end_time);
      }
      
      // Clean the updates data
      const cleanUpdates = EventDataProcessor.processUpdateData(updates);
      
      const result = await DatabaseService.updateEvent(id, cleanUpdates);
      console.log('✅ CalendarServiceCore: Event updated successfully');
      
      return result;
    }, 'update');
  }
  
  static async deleteEvent(id: string): Promise<CalendarServiceResponse<boolean>> {
    return this.executeWithRetry(async () => {
      console.log('🗑️ CalendarServiceCore: Starting event deletion');
      const result = await DatabaseService.deleteEvent(id);
      console.log('✅ CalendarServiceCore: Event deleted successfully');
      return result;
    }, 'delete');
  }
  
  static async getEvents(): Promise<CalendarServiceResponse<CalendarEventData[]>> {
    return this.executeWithRetry(async () => {
      console.log('📋 CalendarServiceCore: Loading events');
      const result = await DatabaseService.getEvents();
      console.log(`✅ CalendarServiceCore: Loaded ${result.length} events`);
      return result;
    }, 'load');
  }
}
