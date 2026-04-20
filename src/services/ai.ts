import api from './api';

export interface AIConversationEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const getAIConversations = async (): Promise<AIConversationEntry[]> => {
  const response = await api.get('/api/ai-conversations');
  return response.data;
};

export const saveAIConversation = async (role: 'user' | 'assistant', content: string): Promise<AIConversationEntry> => {
  const response = await api.post('/api/ai-conversations', { role, content });
  return response.data;
};

export const clearAIConversations = async (): Promise<void> => {
  await api.delete('/api/ai-conversations');
};
