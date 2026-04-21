import api from './api';
import { LeaderboardEntry } from '../types';

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await api.get('/api/stats/leaderboard');
  return response.data.map((entry: any, index: number) => ({
    id: entry.id,
    user_id: entry.user_id,
    rank: index + 1,
    xp: entry.xp_points || 0,
    level: entry.level || 1,
    name: entry.profile?.full_name || entry.profile?.email_username || 'Anonymous',
    avatar: entry.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.profile?.full_name || 'A'}&backgroundColor=f27d26&textColor=ffffff`,
    student_id: entry.profile?.student_id || '',
    weeklyGain: 0,
  }));
};
