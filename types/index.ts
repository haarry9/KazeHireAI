// Core type definitions for KazeHire AI

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'HR' | 'INTERVIEWER';
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Paused' | 'Closed';
  created_by: string;
  created_at: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  linkedin?: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  min_salary?: number;
  max_salary?: number;
  interest_level?: number;
  summary_text?: string;
  created_at: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  job_id: number;
  interviewer_id: string;
  scheduled_time: string;
  status: 'Scheduled' | 'Completed';
  raw_feedback?: string;
  ai_summary?: string;
  fit_score?: number;
  created_at: string;
}

export interface ResumeMatchResult {
  candidate_id: string;
  candidate_name: string;
  fit_score: number;
  strengths: string[];
  concerns: string[];
  technical_skills: string[];
  reasoning: string;
}

export interface ChatSummaryResult {
  start_date?: string;
  end_date?: string;
  min_salary?: number;
  max_salary?: number;
  interest_level?: number;
  summary_text?: string;
}

export interface BiasCheckResult {
  flags: Array<{
    term: string;
    justification: string;
  }>;
}

export interface InterviewSummaryResult {
  fit_score: number;
  summary: string;
} 