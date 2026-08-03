import http from '@/lib/http';

export const uploadService = {
  upload(file: File, folder = 'products') {
    const formData = new FormData();
    formData.append('fileUpload', file);
    return http.post('/files/upload', formData, {
      headers: { 'Content-Type': undefined, folder_type: folder },
    });
  },
};