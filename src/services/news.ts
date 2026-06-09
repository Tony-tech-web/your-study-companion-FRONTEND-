import api from './api';
import { NewsItem } from '../types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const normalizeNewsItem = (item: any): NewsItem => ({
  id: item.id,
  title: item.title,
  date: new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  image: item.image_url || '',
  category: item.category || 'School',
  excerpt: item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content,
});

export const getNews = async (): Promise<NewsItem[]> => {
  const response = await api.get('/api/news');
  return response.data.map(normalizeNewsItem);
};

export const subscribeToNews = (onArticle: (item: NewsItem) => void): (() => void) => {
  const source = new EventSource(`${API_BASE_URL}/api/news/stream`);
  source.addEventListener('news.created', event => {
    const payload = JSON.parse((event as MessageEvent).data);
    onArticle(normalizeNewsItem(payload));
  });
  source.onerror = () => {
    source.close();
  };
  return () => source.close();
};
