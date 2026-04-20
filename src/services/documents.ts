import api from './api';
import { Document } from '../types';

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/api/pdfs');
  return response.data.map((pdf: any) => ({
    id: pdf.id,
    name: pdf.file_name,
    uploadedAt: new Date(pdf.uploaded_at).toLocaleDateString(),
    size: pdf.file_size || '0KB',
    category: 'General', // Backend doesn't seem to have category yet
  }));
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/api/pdfs/${id}`);
};
