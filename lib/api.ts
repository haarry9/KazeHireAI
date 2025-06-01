import { supabase } from './supabase';
import { API_ROUTES } from "./constants";

// Helper function for making API calls with authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = endpoint.startsWith('http') ? endpoint : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${endpoint}`;
  
  // Get the current session token with retry
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
    
    // If no token, try refreshing the session
    if (!token) {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      token = refreshedSession?.access_token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  console.log('API Call Debug:', {
    endpoint,
    hasToken: !!token,
    tokenLength: token?.length,
  });
  
  const defaultHeaders: Record<string, string> = {};
  
  // Only add Content-Type if not explicitly set to empty (for FormData)
  if (!options.headers || !('Content-Type' in options.headers)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found for API request');
    // Don't throw error here, let the API handle the 401
  }
  
  // Filter out empty Content-Type headers
  const finalHeaders = { ...defaultHeaders, ...options.headers };
  if (finalHeaders['Content-Type'] === '') {
    delete finalHeaders['Content-Type'];
  }
  
  const defaultOptions: RequestInit = {
    headers: finalHeaders,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        endpoint,
      });
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
    headers: {
      'Content-Type': '', // This will be removed to let browser set multipart boundary
    },
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
    headers: {
      'Content-Type': '', // This will be removed to let browser set multipart boundary
    },
  }),
}; 