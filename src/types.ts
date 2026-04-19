export type Screen = 
  | 'dashboard' 
  | 'ai-assistant' 
  | 'gpa' 
  | 'planner' 
  | 'courses' 
  | 'research' 
  | 'chat' 
  | 'news' 
  | 'leaderboard';

export interface User {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
}

export interface StudyActivity {
  day: string;
  hours: number;
}

export interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  size: string;
  category: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  weeklyGain: number;
  avatar: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  image: string;
  category: string;
  excerpt: string;
}
