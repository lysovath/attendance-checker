// src/api/axiosInstance.js
/* eslint-disable no-useless-catch */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
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
    } catch {
      // token unavailable; continue without Authorization header
    }
    return config;
  });
};

// Mock Backend API Handler
export const mockApi = {
  fetchCurrentUser: async () => {
     try {
        const response = await api.get('/me');
        return response.data;
     } catch (err) {
        throw err;
     }
  },

  checkEmail: async (email) => {
    try {
        const response = await api.post('/auth/check-email', { email });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateUser: async (userId, name) => {
    try {
        const response = await api.put(`/users/${userId}`, { name });
        return response;
    } catch (error) {
        throw error;
    }
  },

  getCourses: async () => {
    try {
        const response = await api.get('/courses');
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createCourse: async (courseData) => {
    try {
        const response = await api.post('/courses', courseData);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateCourse: async (courseId, updatedData) => {
    try {
        const response = await api.put(`/courses/${courseId}`, updatedData);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  deleteCourse: async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  addCourseToGroup: async (groupId, courseId) => {
    try {
        const response = await api.post(`/groups/${groupId}/courses`, { courseId });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  removeCourseFromGroup: async (groupId, courseId) => {
    try {
        const response = await api.delete(`/groups/${groupId}/courses`, { data: { courseId } });
        return response.data;
    } catch (err) {
        throw err;
    }
},

  getGroups: async () => {
    try {
        const response = await api.get('/groups');
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createGroup: async (groupData) => {
    try {
        const response = await api.post('/groups', groupData);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getGroupDetail: async (groupId) => {
    try {
        const response = await api.get(`/groups/${groupId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateGroup: async (groupId, name) => {
    try {
        const response = await api.put(`/groups/${groupId}`, { name });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  deleteGroup: async (groupId) => {
    try {
        const response = await api.delete(`/groups/${groupId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateGroupTrainers: async (groupId, trainerIds) => {
    try {
        const response = await api.put(`/groups/${groupId}/trainers`, { trainerIds });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateGroupTrainees: async (groupId, traineeIds) => {
    try {
        const response = await api.put(`/groups/${groupId}/trainees`, { traineeIds });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createSession: async (groupId, courseId, sessionData) => {
    try {
        const response = await api.post(`/sessions`, { ...sessionData, groupId, courseId });
        return response.data;
    } catch (err) {
        throw err;
    }
},

  getSessions: async (groupId, courseId) => {
    try {
        const response = await api.get(`/sessions`, { params: { groupId, courseId } });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getSessionById: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateSession: async (sessionId, updatedData) => {
    try {
        const response = await api.put(`/sessions/${sessionId}`, updatedData);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  deleteSession: async (sessionId) => {
    try {
        const response = await api.delete(`/sessions/${sessionId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getTrainers: async (groupId) => {
    try {
        const response = await api.get('/users', { params: { role: 'TRAINER', groupId } });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getTrainerAttendance: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}/trainer-attendances`);
        return response.data;
    } catch (err) {
        throw err;
    }
 },

 batchCreateTrainerAttendances: async (sessionId, trainerAttendanceData) => {
    try {
        const response = await api.post(`/sessions/${sessionId}/trainer-attendances/batch`, trainerAttendanceData);
        return response.data;
    } catch (err) {
        throw err;
    }
},

  getTrainees: async (groupId) => {
    try {
        const response = await api.get('/trainees', { params: { groupId } });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  updateTrainee: async (traineeId, name) => {
    try {
        const response = await api.put(`/trainees/${traineeId}`, {name});
        return response.data;
    } catch (error) {
        throw error
    }
  },

  deleteUser: async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  deleteTrainee: async (traineeId) => {
    try {
        const response = await api.delete(`/trainees/${traineeId}`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getTraineeAttendance: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}/trainee-attendances`);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  batchCreateTraineeAttendance: async (sessionId, traineeAttendanceDatas) => {
    try {
        const response = await api.post(`/sessions/${sessionId}/trainee-attendances/batch`, traineeAttendanceDatas);
        return response.data;
    } catch (err) {
        throw err;
    }
 },

  importTrainees: async (groupId, trainees) => {
    try {
        const response = await api.post('/trainees/import', { groupId, trainees });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getDayRoster: async (groupId, date) => {
    try {
        const response = await api.get('/enrollments/roster', { params: { groupId, date } });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getDayAssignments: async (date, groupId) => {
    try {
        const response = await api.get('/enrollments', { params: { date, groupId } });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  bulkAssignDay: async (groupId, date, traineeIds) => {
    try {
        const response = await api.post('/enrollments/bulk', { groupId, date, traineeIds });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  removeDayAssignments: async (date, traineeIds, groupId) => {
    try {
        const response = await api.post('/enrollments/remove', { date, traineeIds, ...(groupId ? { groupId } : {}) });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  resetDayAssignments: async (date, groupId) => {
    try {
        const response = await api.post('/enrollments/reset', { date, ...(groupId ? { groupId } : {}) });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  copyDayAssignments: async (fromDate, toDate) => {
    try {
        const response = await api.post('/enrollments/copy', { fromDate, toDate });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getWeeklyReport: async (groupId, courseId) => {
    try {
        const response = await api.get('/reports/weekly', {
            params: {
                ...(groupId ? { groupId } : {}),
                ...(courseId ? { courseId } : {}),
            },
        });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  downloadWeeklyReport: async (groupId, courseId, role) => {
    try {
        const response = await api.get('/reports/weekly/export', {
            params: {
                ...(groupId ? { groupId } : {}),
                ...(courseId ? { courseId } : {}),
                ...(role ? { role } : {}),
            },
            responseType: 'blob',
        });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  importTraineeAttendance: async (sessionId, rows) => {
    try {
        const response = await api.post(`/sessions/${sessionId}/trainee-attendances/import`, rows);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  downloadAttendanceTemplate: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}/trainee-attendances/export`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createAdminUser: async (userData) => {
    try {
        const response = await api.post('/users', { ...userData, role: 'ADMIN' });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createTrainerUser: async (userData) => {
    try {
        const response = await api.post('/users', { ...userData, role: 'TRAINER' });
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  createTrainee: async (traineeData) => {
    try {
        const response = await api.post('/trainees', traineeData);
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getUsers: async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (err) {
        throw err;
    }
  },

  getDashboard: async () => {
    try {
        const response = await api.get('/dashboard');
        return response.data;
    } catch (err) {
        throw err;
    }
  },
};

export default api;