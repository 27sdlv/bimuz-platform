import axios from 'axios';

import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

/** DRF paginated responses use { results: [...] }; unwrap for the UI. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results: T[] }).results)
  ) {
    return (data as { results: T[] }).results;
  }
  return [];
}

async function getList<T>(url: string, config?: Parameters<typeof api.get>[1]) {
  const res = await api.get(url, config);
  return { ...res, data: unwrapList<T>(res.data) };
}

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
  (response) => {
    if (typeof window !== 'undefined') {
      const method = response.config.method?.toUpperCase();
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (!response.config.url?.includes('auth/refresh') && !response.config.url?.includes('auth/me')) {
          toast.success("Muvaffaqiyatli bajarildi!");
        }
      }
    }
    return response;
  },
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
    } else if (typeof window !== 'undefined') {
      let errorMsg = "Xatolik yuz berdi!";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.detail === 'string') errorMsg = data.detail;
        else if (typeof data.message === 'string') errorMsg = data.message;
        else if (typeof data.error === 'string') errorMsg = data.error;
        else if (typeof data === 'object') {
          const firstValue = Object.values(data)[0];
          if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
            errorMsg = firstValue[0];
          } else if (typeof firstValue === 'string') {
            errorMsg = firstValue;
          }
        }
      }
      toast.error(errorMsg);
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
  list: () => getList('courses/'),
  get: (id: string) => api.get(`courses/${id}/`),
  enroll: (id: string) => api.post(`courses/${id}/enroll/`),
  enrolled: () => api.get('courses/enrolled/'),
  create: (data: FormData, onUploadProgress?: (e: any) => void) => api.post('courses/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }),
  update: (id: string, data: FormData, onUploadProgress?: (e: any) => void) => api.patch(`courses/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }),
  remove: (id: string) => api.delete(`courses/${id}/`),
};

export const lessonApi = {
  list: (courseId: string) => getList<any>(`lessons/?course_id=${courseId}`),
  get: (id: string) => api.get(`lessons/${id}/`),
  complete: (id: string) => api.post(`lessons/${id}/complete/`),
  create: (data: FormData, onUploadProgress?: (e: any) => void) => api.post('lessons/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }),
  update: (id: string, data: FormData, onUploadProgress?: (e: any) => void) => api.patch(`lessons/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }),
  remove: (id: string) => api.delete(`lessons/${id}/`),
};

export const homeworkApi = {
  submit: (data: FormData) => api.post('homework/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => getList('homework/'),
  approve: (id: string) => api.post(`homework/${id}/approve/`),
  reject: (id: string, feedback: string) => api.post(`homework/${id}/reject/`, { feedback }),
};

export const groupApi = {
  list: () => getList('groups/', { headers: { 'X-Skip-Auth': '1' } }),
  create: (data: any) => api.post('groups/', data),
  update: (id: string, data: any) => api.patch(`groups/${id}/`, data),
  remove: (id: string) => api.delete(`groups/${id}/`),
};

export const adminApi = {
  users: {
    list: () => getList('admin/users/'),
    create: (data: any) => api.post('admin/users/', data),
    update: (id: string, data: any) => api.patch(`admin/users/${id}/`, data),
    remove: (id: string) => api.delete(`admin/users/${id}/`),
  },
  enrollments: {
    list: () => getList('admin/enrollments/'),
    create: (data: any) => api.post('admin/enrollments/', data),
    update: (id: string, data: any) => api.patch(`admin/enrollments/${id}/`, data),
    remove: (id: string) => api.delete(`admin/enrollments/${id}/`),
  },
  progress: {
    list: () => getList('admin/progress/'),
    create: (data: any) => api.post('admin/progress/', data),
    update: (id: string, data: any) => api.patch(`admin/progress/${id}/`, data),
    remove: (id: string) => api.delete(`admin/progress/${id}/`),
  },
  watches: {
    list: () => getList('admin/watches/'),
    create: (data: any) => api.post('admin/watches/', data),
    update: (id: string, data: any) => api.patch(`admin/watches/${id}/`, data),
    remove: (id: string) => api.delete(`admin/watches/${id}/`),
  },
};

export default api;
