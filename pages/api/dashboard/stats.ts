import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return requireAuth(async (req, res) => {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    if (req.method === 'GET') {
      try {
        const userId = req.user.id;
        
        // Get total jobs count
        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', userId);

        // Get active candidates count
        const { count: activeCandidates } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', userId);

        // Get scheduled interviews count
        const { count: scheduledInterviews } = await supabase
          .from('interviews')
          .select('job_id, jobs!inner(created_by)', { count: 'exact', head: true })
          .eq('jobs.created_by', userId)
          .eq('status', 'Scheduled');

        // Get completed interviews for hire rate calculation
        const { count: completedInterviews } = await supabase
          .from('interviews')
          .select('job_id, jobs!inner(created_by)', { count: 'exact', head: true })
          .eq('jobs.created_by', userId)
          .eq('status', 'Completed');

        // Calculate hire rate (simplified - assuming interviews with feedback are "hires")
        const { data: interviewsWithFeedback } = await supabase
          .from('interviews')
          .select('job_id, jobs!inner(created_by), ai_summary')
          .eq('jobs.created_by', userId)
          .eq('status', 'Completed')
          .not('ai_summary', 'is', null);

        const hireRate = (completedInterviews || 0) > 0 
          ? Math.round((interviewsWithFeedback?.length || 0) / (completedInterviews || 1) * 100)
          : 0;

        res.status(200).json({
          success: true,
          data: {
            totalJobs: totalJobs || 0,
            activeCandidates: activeCandidates || 0,
            scheduledInterviews: scheduledInterviews || 0,
            hireRate: hireRate
          }
        });

      } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch dashboard statistics'
        });
      }
    } else {
      res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }
  })(req, res);
} 