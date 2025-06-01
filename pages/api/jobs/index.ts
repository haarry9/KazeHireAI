import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export default requireAuth(async (req, res) => {
  // Only HR can access job management
  if (req.user.role !== 'HR') {
    return res.status(403).json({ 
      success: false, 
      error: 'Insufficient permissions' 
    });
  }

  if (req.method === 'GET') {
    try {
      // Get all jobs created by this HR user
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', req.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch jobs'
        });
      }

      res.status(200).json({
        success: true,
        data: jobs || []
      });

    } catch (error) {
      console.error('Jobs API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { title, description, status = 'Active' } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title and description are required'
        });
      }

      // Validate status
      const validStatuses = ['Active', 'Paused', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: Active, Paused, Closed'
        });
      }

      // Create new job
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            status,
            created_by: req.user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create job'
        });
      }

      res.status(201).json({
        success: true,
        data: job,
        message: 'Job created successfully'
      });

    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }

  } else {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
}); 