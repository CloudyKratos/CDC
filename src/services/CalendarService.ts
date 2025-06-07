
import CalendarEventService, { EnhancedEventData } from './calendar/CalendarEventService';
import CalendarRSVPService, { EventRSVP } from './calendar/CalendarRSVPService';
import CalendarCommentService, { EventComment } from './calendar/CalendarCommentService';
import CalendarAttendanceService from './calendar/CalendarAttendanceService';
import CalendarCohortService from './calendar/CalendarCohortService';

// Re-export types for backward compatibility
export type { EnhancedEventData, EventRSVP, EventComment };

class CalendarService {
  // Event Management
  async getEvents(): Promise<EnhancedEventData[]> {
    return CalendarEventService.getEvents();
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    return CalendarEventService.createEvent(eventData);
  }

  async updateEvent(id: string, updates: Partial<EnhancedEventData>): Promise<EnhancedEventData | null> {
    return CalendarEventService.updateEvent(id, updates);
  }

  async deleteEvent(id: string): Promise<boolean> {
    return CalendarEventService.deleteEvent(id);
  }

  async updateEventStatus(eventId: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<boolean> {
    return CalendarEventService.updateEventStatus(eventId, status);
  }

  // RSVP Management
  async createRSVP(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<EventRSVP | null> {
    return CalendarRSVPService.createRSVP(eventId, status);
  }

  async getRSVPsForEvent(eventId: string): Promise<EventRSVP[]> {
    return CalendarRSVPService.getRSVPsForEvent(eventId);
  }

  // Comment Management
  async createComment(eventId: string, content: string, commentType: string = 'general'): Promise<EventComment | null> {
    return CalendarCommentService.createComment(eventId, content, commentType);
  }

  async getCommentsForEvent(eventId: string): Promise<EventComment[]> {
    return CalendarCommentService.getCommentsForEvent(eventId);
  }

  // Attendance Management
  async recordAttendance(eventId: string): Promise<boolean> {
    return CalendarAttendanceService.recordAttendance(eventId);
  }

  async endAttendance(eventId: string): Promise<boolean> {
    return CalendarAttendanceService.endAttendance(eventId);
  }

  // Cohort Management
  async getCohorts(): Promise<any[]> {
    return CalendarCohortService.getCohorts();
  }

  async createCohort(name: string, description?: string): Promise<any | null> {
    return CalendarCohortService.createCohort(name, description);
  }
}

export default new CalendarService();
