import api from './api';
import { LeaderboardEntry } from '../types';

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await api.get('/api/stats/leaderboard');
  return response.data.map((entry: any) => ({
    id: entry.id,
    user_id: entry.user_id,
    xp: entry.xp_points,
    level: entry.level,
    name: entry.profile?.full_name || entry.profile?.email_username || 'Anonymous',
    avatar: entry.profile?.avatar_url || '',
    student_id: entry.profile?.student_id || 'N/A',
  }));
};
