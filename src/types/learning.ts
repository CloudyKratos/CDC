
export interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  addedBy: string;
  addedAt: Date;
  progress?: number;
  instructor?: string;
  thumbnail?: string;
  locked?: boolean;
  premium?: boolean;
  rating?: number;
  views?: number;
}

export interface LearningProgress {
  [videoId: string]: number;
}

export interface LearningStats {
  totalVideos: number;
  completedVideos: number;
  totalProgress: number;
  inProgressVideos: number;
  totalHours?: number;
  averageRating?: number;
}
