import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Check if user is HR
    if (userData.role !== 'HR') {
      return res.status(403).json({ success: false, error: 'Access denied. HR role required.' });
    }

    // Fetch all interviews with related data
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select(`
        *,
        candidate:candidates (
          id,
          name,
          email
        ),
        job:jobs (
          id,
          title,
          description
        ),
        interviewer:users!interviews_interviewer_id_fkey (
          id,
          name
        )
      `)
      .order('scheduled_time', { ascending: false });

    if (interviewsError) {
      console.error('Database error:', interviewsError);
      return res.status(500).json({ success: false, error: 'Failed to fetch interviews' });
    }

    return res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 