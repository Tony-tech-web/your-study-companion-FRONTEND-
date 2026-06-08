import { callEdgeFunction } from '../lib/supabase';
import api from './api';
import { ResearchPaper } from '../types';

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  isGitHub: boolean;
}

export interface ResearchSearchResult {
  results: SearchResult[];
  insights: string;
  projectIdeas: { title: string; description: string; basedOn?: string }[];
  gaps: string[];
  relatedTopics: string[];
}

// Call the Supabase edge function for research search (has Serper + AI summary)
export const searchResearch = async (query: string, searchMode: 'academic' | 'projects'): Promise<ResearchSearchResult> => {
  const res = await callEdgeFunction('research-search', { query, searchMode });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Search failed'); }
  return res.json();
};

// Get research history from Express backend
export const getResearchHistory = async (): Promise<ResearchPaper[]> => {
  const response = await api.get('/api/research');
  return response.data.map((item: any) => ({
    id: item.id,
    title: item.query,
    authors: ['Orbit AI'],
    year: new Date(item.created_at).getFullYear(),
    abstract: item.ai_summary || 'No summary available.',
  }));
};

export const deleteResearchEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/research/${id}`);
};

export const saveResearchEntry = async (query: string, results: SearchResult[], aiSummary?: string): Promise<ResearchPaper> => {
  const response = await api.post('/api/research', {
    query,
    results,
    ai_summary: aiSummary || null,
  });
  const item = response.data;
  return {
    id: item.id,
    title: item.query,
    authors: ['Orbit AI'],
    year: new Date(item.created_at).getFullYear(),
    abstract: item.ai_summary || 'Saved project',
  };
};
