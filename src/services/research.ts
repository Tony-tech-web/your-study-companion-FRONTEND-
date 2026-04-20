import api from './api';
import { ResearchPaper } from '../types';

export const getResearchHistory = async (): Promise<ResearchPaper[]> => {
  const response = await api.get('/api/research');
  return response.data.map((item: any) => ({
    id: item.id,
    title: item.query, // The query is the title in the history
    authors: ['AI Assistant'], // Placeholder since backend doesn't store authors
    year: new Date(item.created_at).getFullYear(),
    abstract: item.ai_summary || 'No summary available.',
  }));
};

export const deleteResearchEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/research/${id}`);
};
