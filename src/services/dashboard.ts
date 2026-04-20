import api from './api';
import { User, Task, StudyActivity } from '../types';

export const getUserStats = async (): Promise<User> => {
  const response = await api.get('/api/stats/me');
  const data = response.data;
  return {
    name: data.profile?.full_name || 'Student Node',
    level: data.level,
    xp: data.xp_points,
    maxXp: data.level * 100 + 100, // Matching backend level up logic
  };
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/api/study-plans');
  return response.data.map((plan: any) => ({
    id: plan.id,
    title: plan.name,
    dueDate: new Date(plan.created_at).toLocaleDateString(),
    category: plan.subjects?.[0] || 'General',
    completed: false, // StudyPlan model doesn't have a completed field yet
  }));
};

export const getActivity = async (): Promise<StudyActivity[]> => {
  const response = await api.get('/api/activity');
  // Map recent activity to daily hours (simple mapping for now)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyHours: Record<string, number> = {
    'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
  };
  
  response.data.forEach((entry: any) => {
    const dayName = days[new Date(entry.activity_date).getDay()];
    dailyHours[dayName] += entry.activity_count / 60; // Assuming count is minutes
  });

  return Object.entries(dailyHours).map(([day, hours]) => ({
    day,
    hours: Math.round(hours * 10) / 10
  }));
};
