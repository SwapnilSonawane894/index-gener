import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/api/token');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'hod';
  is_active: boolean;
  department_config?: any;
  name?: string; 
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Department {
  id: string;
  name: string;
  abbreviation?: string;
  hodName: string;
  totalStudents?: number;
}

// Auth API
export const authAPI = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/api/token', {
      username,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/api/me');
    return response.data;
  },
  
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/api/me/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

// Departments API
export const departmentsAPI = {
  async getAll(): Promise<{ departments: Department[] }> {
    const response: AxiosResponse<{ departments: Department[] }> = await api.get('/api/departments');
    return response.data;
  },

  async create(department: { name: string; abbreviation: string; hodName: string; totalStudents: number }): Promise<{ 
    id: string; 
    success: boolean; 
    hod_username?: string;
    hod_temp_password?: string;
    message?: string;
  }> {
    const response = await api.post('/api/departments', department);
    return response.data;
  },

  async update(id: string, department: { name: string; abbreviation: string; hodName: string; totalStudents: number }): Promise<{ success: boolean }> {
    const response = await api.put(`/api/departments/${id}`, department);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/api/departments/${id}`);
    return response.data;
  },

  async createHodUser(deptId: string): Promise<{
    success: boolean;
    hod_username?: string;
    hod_temp_password?: string;
    message?: string;
  }> {
    const response = await api.post(`/api/departments/${deptId}/create-hod`);
    return response.data;
  },
};

// Success Index Processing API
export const processingAPI = {
  async processFiles(
    rawDataFile: File,
    semesterNumber: number,
    studentListFile?: File | null, // Made Optional
    batchYear?: number,
    successIndexName?: string,
    batchName?: string,
    previousIndexFile?: File,
    maxMarks?: number
  ): Promise<Blob> {
    const formData = new FormData();
    
    // Always required
    formData.append('raw_data', rawDataFile);
    formData.append('semester_number', semesterNumber.toString());
    
    // Optional / Conditional
    if (studentListFile) {
      formData.append('student_list', studentListFile);
    }
    
    if (batchYear) {
      formData.append('batch_year', batchYear.toString());
    }
    
    if (successIndexName) {
      formData.append('success_index_name', successIndexName);
    }
    
    if (batchName) {
      formData.append('batch_name', batchName);
    }
    
    if (previousIndexFile) {
      formData.append('previous_index', previousIndexFile);
    }

    if (maxMarks !== undefined) {
      formData.append('max_marks', maxMarks.toString());
    }

    const response = await api.post('/api/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Important for file download
    });

    return response.data;
  },
};

// Admin API
export const adminAPI = {
  async resetAllHodConfigs(): Promise<{ success: boolean; message: string; updated_count: number }> {
    const response = await api.post('/api/admin/reset-all-hod-configs');
    return response.data;
  },

  async resetHodConfig(deptId: string): Promise<{ success: boolean; message: string; username: string }> {
    const response = await api.post(`/api/departments/${deptId}/reset-hod-config`);
    return response.data;
  },
};

// File download utility
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Error handling utility
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const apiTool = {
  async generateReport(
    studentFile: File,
    resultFile: File,
    yearType: string,    // FY, SY, TY
    yearLabel: string,   // 2024-25
    sem1Header: string,  // e.g. "SEM V (W-24)"
    sem2Header: string   // e.g. "SEM VI (S-25)"
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('student_file', studentFile);
    formData.append('result_file', resultFile);
    formData.append('year_type', yearType);
    formData.append('year_label', yearLabel);
    formData.append('sem1_header', sem1Header);
    formData.append('sem2_header', sem2Header);

    const response = await api.post('/api/generate-api-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response.data;
  }
};

export default api; 