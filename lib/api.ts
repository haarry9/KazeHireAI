import { supabase } from './supabase';
import { API_ROUTES } from "./constants";
import { Job, Interview } from '@/types';

// Helper function for making API calls with authentication
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
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
  
  const defaultHeaders: Record<string, string> = {};
  
  // Add authorization header if token exists (ALWAYS add if token is available)
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found for API request');
    // Don't throw error here, let the API handle the 401
  }
  
  // Handle Content-Type based on whether it's explicitly set
  const incomingHeaders = options.headers as Record<string, string> || {};
  const hasContentTypeSet = 'Content-Type' in incomingHeaders;
  
  // Only set default Content-Type if not explicitly set and not empty string (FormData case)
  if (!hasContentTypeSet) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Merge headers, but exclude empty Content-Type (for FormData)
  const finalHeaders = { ...defaultHeaders };
  Object.entries(incomingHeaders).forEach(([key, value]) => {
    if (key === 'Content-Type' && value === '') {
      // Skip empty Content-Type - let browser set multipart boundary for FormData
      return;
    }
    finalHeaders[key] = value;
  });
  
  console.log('API Call Debug:', {
    endpoint,
    hasToken: !!token,
    tokenLength: token?.length,
    method: options.method || 'GET',
    hasBody: !!options.body,
    bodyType: options.body?.constructor?.name || 'none',
    finalHeaders: Object.keys(finalHeaders),
    authHeaderPresent: !!finalHeaders['Authorization']
  });
  
  const defaultOptions: RequestInit = {
    headers: finalHeaders,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: string };
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        endpoint,
      });
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Specific API functions
export const jobsAPI = {
  getAll: () => apiCall<Job[]>(API_ROUTES.JOBS),
  create: (jobData: Partial<Job>) => apiCall<Job>(API_ROUTES.JOBS, {
    method: 'POST',
    body: JSON.stringify(jobData),
  }),
  getById: (id: string) => apiCall<Job>(`${API_ROUTES.JOBS}/${id}`),
  update: (id: string, jobData: Partial<Job>) => apiCall<Job>(`${API_ROUTES.JOBS}/${id}`, {
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
  getAssigned: () => apiCall<Interview[]>(`${API_ROUTES.INTERVIEWS}/assigned`),
  schedule: (interviewData: Partial<Interview>) => apiCall<Interview>(`${API_ROUTES.INTERVIEWS}/schedule`, {
    method: 'POST',
    body: JSON.stringify(interviewData),
  }),
  getById: (id: string) => apiCall<Interview>(`${API_ROUTES.INTERVIEWS}/${id}`),
  submitFeedback: (id: string, feedbackData: { raw_feedback: string; status: Interview['status'] }) => apiCall<Interview>(`${API_ROUTES.INTERVIEWS}/${id}/feedback`, {
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
  manualUpload: (formData: FormData) => apiCall(`${API_ROUTES.RESUME_MATCH}/manual_upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': '', // This will be removed to let browser set multipart boundary
    },
  }),
}; 