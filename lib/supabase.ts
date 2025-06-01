import { createClient } from "@supabase/supabase-js";

// These will be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user;
};

// Helper function to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session;
};

// Helper function to get user profile from our users table
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
  return data;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return false;
  }
  return true;
};

// Types for our database
export type UserRole = 'HR' | 'INTERVIEWER';
export type JobStatus = 'Active' | 'Paused' | 'Closed';
export type InterviewStatus = 'Scheduled' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: JobStatus;
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
  status: InterviewStatus;
  raw_feedback?: string;
  ai_summary?: string;
  fit_score?: number;
  created_at: string;
} 