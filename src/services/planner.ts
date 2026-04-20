import api from './api';
import { StudyPlan } from '../types';

export const getStudyPlans = async (): Promise<StudyPlan[]> => {
  const response = await api.get('/api/study-plans');
  return response.data.map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    subjects: Array.isArray(plan.subjects) ? plan.subjects : JSON.parse(plan.subjects || '[]'),
    progress: plan.progress || 0,
    totalHours: plan.total_hours || 0,
  }));
};

export const createStudyPlan = async (data: Partial<StudyPlan>): Promise<StudyPlan> => {
  const response = await api.post('/api/study-plans', {
    name: data.name,
    subjects: JSON.stringify(data.subjects),
    total_hours: data.totalHours,
  });
  return response.data;
};

export const deleteStudyPlan = async (id: string): Promise<void> => {
  await api.delete(`/api/study-plans/${id}`);
};
