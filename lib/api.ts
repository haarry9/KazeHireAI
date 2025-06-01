import { API_ROUTES } from "./constants";

// Helper function for making API calls with authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = endpoint.startsWith('http') ? endpoint : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Specific API functions
export const jobsAPI = {
  getAll: () => apiCall(API_ROUTES.JOBS),
  create: (jobData: any) => apiCall(API_ROUTES.JOBS, {
    method: 'POST',
    body: JSON.stringify(jobData),
  }),
  getById: (id: string) => apiCall(`${API_ROUTES.JOBS}/${id}`),
  update: (id: string, jobData: any) => apiCall(`${API_ROUTES.JOBS}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(jobData),
  }),
};

export const candidatesAPI = {
  getAll: () => apiCall(API_ROUTES.CANDIDATES),
  create: (candidateData: FormData) => apiCall(API_ROUTES.CANDIDATES, {
    method: 'POST',
    body: candidateData,
    headers: {}, // Don't set Content-Type for FormData
  }),
  getById: (id: string) => apiCall(`${API_ROUTES.CANDIDATES}/${id}`),
  summarizeChat: (id: string, transcript: string) => apiCall(`${API_ROUTES.CANDIDATES}/${id}/summarize_chat`, {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  }),
};

export const interviewsAPI = {
  getAssigned: () => apiCall(`${API_ROUTES.INTERVIEWS}/assigned`),
  schedule: (interviewData: any) => apiCall(`${API_ROUTES.INTERVIEWS}/schedule`, {
    method: 'POST',
    body: JSON.stringify(interviewData),
  }),
  getById: (id: string) => apiCall(`${API_ROUTES.INTERVIEWS}/${id}`),
  submitFeedback: (id: string, feedbackData: any) => apiCall(`${API_ROUTES.INTERVIEWS}/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  }),
  checkBias: (id: string) => apiCall(`${API_ROUTES.INTERVIEWS}/${id}/bias_check`, {
    method: 'POST',
  }),
};

export const resumeMatchAPI = {
  existingPool: (jobId: string, comments?: string) => apiCall(`${API_ROUTES.RESUME_MATCH}/existing_pool`, {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, comments }),
  }),
  manualUpload: (jobDescription: string, resumes: FormData) => apiCall(`${API_ROUTES.RESUME_MATCH}/manual_upload`, {
    method: 'POST',
    body: resumes,
    headers: {}, // Don't set Content-Type for FormData
  }),
}; 