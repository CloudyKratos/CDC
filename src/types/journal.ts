
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
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category?: string;
}
