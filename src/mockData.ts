import { User, Task, StudyActivity, Document, ResearchPaper, LeaderboardEntry, NewsItem } from './types';

export const mockUser: User = {
  name: "Aman Gupta",
  level: 7,
  xp: 2450,
  maxXp: 3000
};

export const mockTasks: Task[] = [
  { id: '1', title: "Complete Math HW", dueDate: "Due Tomorrow", category: "Math", completed: false },
  { id: '2', title: "Read History Chapter 4", dueDate: "Due Wed", category: "History", completed: false },
  { id: '3', title: "Review Biology Notes", dueDate: "Due Fri", category: "Biology", completed: false }
];

export const mockActivity: StudyActivity[] = [
  { day: "Mon", hours: 4 },
  { day: "Tue", hours: 6 },
  { day: "Wed", hours: 4 },
  { day: "Thu", hours: 8 },
  { day: "Fri", hours: 5 },
  { day: "Sat", hours: 9 },
  { day: "Sun", hours: 4 }
];

export const mockDocuments: Document[] = [
  { id: '1', name: "Calculus I - Textbook.pdf", uploadedAt: "Yesterday", size: "4.5MB", category: "Math" },
  { id: '2', name: "Organic Chemistry Notes.pdf", uploadedAt: "2 days ago", size: "2.1MB", category: "Science" },
  { id: '3', name: "World History Chapter 4.pdf", uploadedAt: "last week", size: "5.8MB", category: "History" },
  { id: '4', name: "English Lit - Hamlet.pdf", uploadedAt: "last week", size: "1.2MB", category: "Literature" }
];

export const mockResearchPapers: ResearchPaper[] = [
  {
    id: '1',
    title: "Deep Learning in Healthcare",
    authors: ["A. Hamelini", "L. Jroan", "R. Purian"],
    year: 2023,
    abstract: "This paper explores the transformative potential of deep learning architectures in modern medical diagnostics. We analyze various convolutional neural network models applied to radiological imaging and clinical data streams, demonstrating state-of-the-art accuracy in early disease detection."
  },
  {
    id: '2',
    title: "Deep Learning in Healthcare: The Adaptive Research",
    authors: ["E. Sagan", "A. Khamlbora"],
    year: 2022,
    abstract: "A comprehensive look into how adaptive learning systems can bridge the gap between theoretical AI models and real-world clinical implementation. The study focuses on feedback loops and real-time model calibration in hospital settings."
  },
  {
    id: '3',
    title: "Deep Learning in Healthcare: The Global Perspective",
    authors: ["S. Bhadra", "M. Soarrin", "D. Yanbaki"],
    year: 2022,
    abstract: "Reviewing global efforts to standardize AI-driven healthcare protocols. This research highlights the socio-economic impacts of deploying advanced neural networks in developing nations' healthcare infrastructures."
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Aman Gupta", level: 45, xp: 15420, weeklyGain: 250, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman" },
  { rank: 2, name: "Priya Sharma", level: 44, xp: 14800, weeklyGain: 200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { rank: 3, name: "Rohan Patel", level: 43, xp: 14150, weeklyGain: 180, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
  { rank: 4, name: "Sara Khan", level: 42, xp: 13900, weeklyGain: 150, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" },
  { rank: 5, name: "Arjun Singh", level: 41, xp: 13500, weeklyGain: 140, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" }
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: "AI in Education: The New Frontier",
    date: "Jan 1, 2023",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
    category: "AI",
    excerpt: "Exploring how large language models are reshaping the way students learn and researchers conduct academic study."
  },
  {
    id: '2',
    title: "Breakthrough in Quantum Computing Research",
    date: "Jan 1, 2023",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    category: "Science",
    excerpt: "New quantum algorithms show promise in solving complex biological simulation problems previously thought impossible."
  },
  {
    id: '3',
    title: "Effective Study Techniques for Finals",
    date: "Jan 1, 2023",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
    category: "Tips",
    excerpt: "Proven methods to improve retention and reduce stress during the high-pressure final examination season."
  }
];
