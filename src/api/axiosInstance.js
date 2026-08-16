// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' },
});

// Configure Clerk token injection dynamically
export const setupAxiosInterceptors = (getToken) => {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Failed to retrieve Clerk token:', err);
    }
    return config;
  });
};

// Mock Backend API Handler
export const mockApi = {
  fetchCurrentUser: async () => {
    // Replace with: return (await api.get('/me')).data;
    return new Promise((res) => 
      setTimeout(() => res({
        id: 'usr_01',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'ADMIN', // Switch to 'TRAINER' to test Trainer views
        groupId: 'grp_101',
        groupName: 'Web Dev Alpha 2026'
      }), 400)
    );
  },
  getCourses: async () => [
    { id: 'c1', name: 'React Foundations', code: 'CS101' },
    { id: 'c2', name: 'Tailwind Mastery', code: 'CS102' },
  ],
  getGroups: async () => [
    { id: 'g1', name: 'Frontend Batch A', courseIds: ['c1', 'c2'], trainerIds: ['tr1'], traineeIds: ['st1', 'st2'] },
  ],
  getSessions: async (groupId, courseId) => [
    { id: 's1', name: 'Session 1: Component Specs', startTime: '2026-08-17T09:00', endTime: '2026-08-17T11:00' },
    { id: 's2', name: 'Session 2: Hooks Deep Dive', startTime: '2026-08-19T09:00', endTime: '2026-08-19T11:00' },
  ]
};

export default api;