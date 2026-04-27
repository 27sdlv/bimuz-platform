import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const skipAuth = (config.headers as any)?.['X-Skip-Auth'];
    const token = localStorage.getItem('access_token');
    if (skipAuth) {
      delete (config.headers as any)['X-Skip-Auth'];
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (typeof window !== 'undefined' && error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('auth/login/', data),
  register: (data: any) => api.post('auth/register/', data),
  me: () => api.get('auth/me/'),
};

export const courseApi = {
  list: () => api.get('courses/'),
  get: (id: string) => api.get(`courses/${id}/`),
  enroll: (id: string) => api.post(`courses/${id}/enroll/`),
  enrolled: () => api.get('courses/enrolled/'),
  create: (data: FormData) => api.post('courses/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => api.patch(`courses/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id: string) => api.delete(`courses/${id}/`),
};

export const lessonApi = {
  list: (courseId: string) => api.get(`lessons/?course_id=${courseId}`),
  get: (id: string) => api.get(`lessons/${id}/`),
  complete: (id: string) => api.post(`lessons/${id}/complete/`),
  create: (data: FormData) => api.post('lessons/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => api.patch(`lessons/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id: string) => api.delete(`lessons/${id}/`),
};

export const homeworkApi = {
  submit: (data: FormData) => api.post('homework/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('homework/'),
  approve: (id: string) => api.post(`homework/${id}/approve/`),
  reject: (id: string, feedback: string) => api.post(`homework/${id}/reject/`, { feedback }),
};

export const groupApi = {
  list: () => api.get('groups/', { headers: { 'X-Skip-Auth': '1' } }),
  create: (data: any) => api.post('groups/', data),
  update: (id: string, data: any) => api.patch(`groups/${id}/`, data),
  remove: (id: string) => api.delete(`groups/${id}/`),
};

export const adminApi = {
  users: {
    list: () => api.get('admin/users/'),
    create: (data: any) => api.post('admin/users/', data),
    update: (id: string, data: any) => api.patch(`admin/users/${id}/`, data),
    remove: (id: string) => api.delete(`admin/users/${id}/`),
  },
  enrollments: {
    list: () => api.get('admin/enrollments/'),
    create: (data: any) => api.post('admin/enrollments/', data),
    update: (id: string, data: any) => api.patch(`admin/enrollments/${id}/`, data),
    remove: (id: string) => api.delete(`admin/enrollments/${id}/`),
  },
  progress: {
    list: () => api.get('admin/progress/'),
    create: (data: any) => api.post('admin/progress/', data),
    update: (id: string, data: any) => api.patch(`admin/progress/${id}/`, data),
    remove: (id: string) => api.delete(`admin/progress/${id}/`),
  },
  watches: {
    list: () => api.get('admin/watches/'),
    create: (data: any) => api.post('admin/watches/', data),
    update: (id: string, data: any) => api.patch(`admin/watches/${id}/`, data),
    remove: (id: string) => api.delete(`admin/watches/${id}/`),
  },
};

export default api;
