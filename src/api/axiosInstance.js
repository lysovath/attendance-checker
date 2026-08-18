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
    } catch (err) {}
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
        console.log(`Sending batch create request for session ${sessionId} with data:`, trainerAttendanceData);
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
};

export default api;