
export class EventValidationService {
  static validateEventData(eventData: any): void {
    console.log('🔍 EventValidation: Validating event data...');
    
    if (!eventData.title?.trim()) {
      console.error('❌ EventValidation: Missing title');
      throw new Error('Event title is required');
    }

    if (!eventData.start_time) {
      console.error('❌ EventValidation: Missing start_time');
      throw new Error('Start time is required');
    }

    if (!eventData.end_time) {
      console.error('❌ EventValidation: Missing end_time');
      throw new Error('End time is required');
    }

    console.log('✅ EventValidation: Basic validation passed');
  }

  static validateDateLogic(startTime: string, endTime: string): void {
    console.log('🔍 EventValidation: Processing dates...');
    
    // Validate date logic
    if (new Date(endTime) <= new Date(startTime)) {
      console.error('❌ EventValidation: Invalid date range');
      throw new Error('End time must be after start time');
    }

    // Check for past events (with grace period)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (new Date(startTime) < fiveMinutesAgo) {
      console.error('❌ EventValidation: Event in the past');
      throw new Error('Cannot create events in the past');
    }

    // Validate duration
    const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    if (durationHours > 8) {
      console.error('❌ EventValidation: Duration too long:', durationHours);
      throw new Error('Event duration cannot exceed 8 hours');
    }

    console.log('✅ EventValidation: Date validation passed');
  }
}
