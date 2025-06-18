import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

async function validateUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', status: 404 };
  }

  return { user: profile };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userValidation = await validateUser(req);
  if ('error' in userValidation) {
    return res.status(userValidation.status || 500).json({ success: false, error: userValidation.error });
  }

  const { user } = userValidation;
  const { id } = req.query;

  // Validate candidate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid candidate ID' });
  }

  if (req.method === 'GET') {
    try {
      // For HR: can view any candidate
      // For Interviewer: can only view candidates for interviews they're assigned to
      const query = supabase
        .from('candidates')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            description
          )
        `)
        .eq('id', parseInt(id));

      // If user is interviewer, check they have access through assigned interviews
      if (user.role === 'INTERVIEWER') {
        const { data: interviews, error: interviewError } = await supabase
          .from('interviews')
          .select('candidate_id')
          .eq('interviewer_id', user.id)
          .eq('candidate_id', parseInt(id));

        if (interviewError || !interviews || interviews.length === 0) {
          return res.status(403).json({ success: false, error: 'Access denied to this candidate' });
        }
      }

      const { data: candidate, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Candidate not found' });
        }
        console.error('Database error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch candidate' });
      }

      res.status(200).json(candidate);
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }

  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
} 