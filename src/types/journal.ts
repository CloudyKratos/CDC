
export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  goals: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  gratitude: string[];
  morningReflection?: string;
  eveningReflection?: string;
  photoUrl?: string;
  tags?: string[];
  stoicPractices?: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category?: string;
}

export interface JournalFilter {
  startDate?: string;
  endDate?: string;
  mood?: string;
  tags?: string[];
  hasPhotos?: boolean;
}

export type StoicPractice = {
  id: string;
  name: string;
  description: string;
  category: 'morning' | 'evening' | 'anytime';
};
