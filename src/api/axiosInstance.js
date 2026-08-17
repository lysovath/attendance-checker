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
     try {
        const response = await api.get('/me');
        return response.data;
     } catch (err) {
        console.error('Error fetching current user:', err);
        throw err;
     }
  },

  checkEmail: async (email) => {
    try {
        const response = await api.post('/auth/check-email', { email });
        return response.data;
    } catch (err) {
        console.error('Error checking email:', err);
        throw err;
    }
  },

  getCourses: async () => {
    try {
        const response = await api.get('/courses');
        return response.data;
    } catch (err) {
        console.error('Error fetching courses:', err);
        throw err;
    }
  },

  createCourse: async (courseData) => {
    try {
        const response = await api.post('/courses', courseData);
        return response.data;
    } catch (err) {
        console.error('Error creating course:', err);
        throw err;
    }
  },

  updateCourse: async (courseId, updatedData) => {
    try {
        const response = await api.put(`/courses/${courseId}`, updatedData);
        return response.data;
    } catch (err) {
        console.error('Error updating course:', err);
        throw err;
    }
  },

  deleteCourse: async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}`);
        return response.data;
    } catch (err) {
        console.error('Error deleting course:', err);
        throw err;
    }
  },

  addCourseToGroup: async (groupId, courseId) => {
    try {
        const response = await api.post(`/groups/${groupId}/courses`, { courseId });
        return response.data;
    } catch (err) {
        console.error('Error adding course to group:', err);
        throw err;
    }
  },

  removeCourseFromGroup: async (groupId, courseId) => {
    try {
        const response = await api.delete(`/groups/${groupId}/courses`, { data: { courseId } });
        return response.data;
    } catch (err) {
        console.error('Error removing course from group:', err);
        throw err;
    }
},

  getGroups: async () => {
    try {
        const response = await api.get('/groups');
        return response.data;
    } catch (err) {
        console.error('Error fetching groups:', err);
        throw err;
    }
  },

  createGroup: async (groupData) => {
    try {
        const response = await api.post('/groups', groupData);
        return response.data;
    } catch (err) {
        console.error('Error creating group:', err);
        throw err;
    }
  },

  getGroupDetail: async (groupId) => {
    try {
        const response = await api.get(`/groups/${groupId}`);
        return response.data;
    } catch (err) {
        console.error('Error fetching group detail:', err);
        throw err;
    }
  },

  updateGroup: async (groupId, name) => {
    try {
        const response = await api.put(`/groups/${groupId}`, { name });
        return response.data;
    } catch (err) {
        console.error('Error updating group:', err);
        throw err;
    }
  },

  deleteGroup: async (groupId) => {
    try {
        const response = await api.delete(`/groups/${groupId}`);
        return response.data;
    } catch (err) {
        console.error('Error deleting group:', err);
        throw err;
    }
  },

  updateGroupTrainers: async (groupId, trainerIds) => {
    try {
        const response = await api.put(`/groups/${groupId}/trainers`, { trainerIds });
        return response.data;
    } catch (err) {
        console.error('Error updating group trainers:', err);
        throw err;
    }
  },

  updateGroupTrainees: async (groupId, traineeIds) => {
    try {
        const response = await api.put(`/groups/${groupId}/trainees`, { traineeIds });
        return response.data;
    } catch (err) {
        console.error('Error updating group trainees:', err);
        throw err;
    }
  },

  createSession: async (groupId, courseId, sessionData) => {
    try {
        const response = await api.post(`/sessions`, { ...sessionData, groupId, courseId });
        return response.data;
    } catch (err) {
        console.error('Error creating session:', err);
        throw err;
    }
},

  getSessions: async (groupId, courseId) => {
    try {
        console.log(`Fetching sessions for groupId: ${groupId}, courseId: ${courseId}`);
        const response = await api.get(`/sessions`, { params: { groupId, courseId } });
        return response.data;
    } catch (err) {
        console.error('Error fetching sessions:', err);
        throw err;
    }
  },

  updateSession: async (sessionId, updatedData) => {
    try {
        const response = await api.put(`/sessions/${sessionId}`, updatedData);
        return response.data;
    } catch (err) {
        console.error('Error updating session:', err);
        throw err;
    }
  },

  deleteSession: async (sessionId) => {
    try {
        const response = await api.delete(`/sessions/${sessionId}`);
        return response.data;
    } catch (err) {
        console.error('Error deleting session:', err);
        throw err;
    }
  },

  getTrainers: async (groupId) => {
    try {
        const response = await api.get('/users', { params: { role: 'TRAINER', groupId } });
        return response.data;
    } catch (err) {
        console.error('Error fetching trainer:', err);
        throw err;
    }
  },

  getTrainerAttendance: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}/trainer-attendances`);
        return response.data;
    } catch (err) {
        console.error('Error fetching trainer attendance:', err);
        throw err;
    }
 },

 batchCreateTrainerAttendances: async (sessionId, trainerAttendanceData) => {
    try {
        console.log(`Sending batch create request for session ${sessionId} with data:`, trainerAttendanceData);
        const response = await api.post(`/sessions/${sessionId}/trainer-attendances/batch`, trainerAttendanceData);
        return response.data;
    } catch (err) {
        console.error('Error updating trainer attendance:', err);
        throw err;
    }
},

  getTrainees: async (groupId) => {
    try {
        const response = await api.get('/trainees', { params: { groupId } });
        return response.data;
    } catch (err) {
        console.error('Error fetching trainees:', err);
        throw err;
    }
  },

  getTraineeAttendance: async (sessionId) => {
    try {
        const response = await api.get(`/sessions/${sessionId}/trainee-attendances`);
        return response.data;
    } catch (err) {
        console.error('Error fetching trainee attendance:', err);
        throw err;
    }
  },

  batchCreateTraineeAttendance: async (sessionId, traineeAttendanceDatas) => {
    try {
        const response = await api.post(`/sessions/${sessionId}/trainee-attendances/batch`, traineeAttendanceDatas);
        return response.data;
    } catch (err) {
        console.error('Error updating trainee attendance:', err);
        throw err;
    }
 },

  createAdminUser: async (userData) => {
    try {
        const response = await api.post('/users', { ...userData, role: 'ADMIN' });
        return response.data;
    } catch (err) {
        console.error('Error creating admin user:', err);
        throw err;
    }
  },

  createTrainerUser: async (userData) => {
    try {
        const response = await api.post('/users', { ...userData, role: 'TRAINER' });
        return response.data;
    } catch (err) {
        console.error('Error creating trainer user:', err);
        throw err;
    }
  },

  createTrainee: async (traineeData) => {
    try {
        const response = await api.post('/trainees', traineeData);
        return response.data;
    } catch (err) {
        console.error('Error creating trainee:', err);
        throw err;
    }
  },

  getUsers: async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
    }
  },
};

export default api;