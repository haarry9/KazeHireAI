import { requireAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { Job } from '../../../types';

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  // Validate ID parameter
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid job ID'
    });
  }

  if (req.method === 'GET') {
    try {
      // Get job details
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Job not found'
          });
        }
        console.error('Error fetching job:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch job'
        });
      }

      // Check permissions - HR can see all their jobs, Interviewers can see jobs for their assigned interviews
      if (req.user.role === 'HR') {
        // HR can only see jobs they created
        if (job.created_by !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }
      } else if (req.user.role === 'INTERVIEWER') {
        // Interviewers can only see jobs for interviews they're assigned to
        // Check if this interviewer has any interviews for this job
        const { data: interviews, error: interviewError } = await supabase
          .from('interviews')
          .select('id')
          .eq('job_id', id)
          .eq('interviewer_id', req.user.id)
          .limit(1);

        if (interviewError || !interviews || interviews.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }
      }

      res.status(200).json({
        success: true,
        data: job
      });

    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }

  } else if (req.method === 'PATCH') {
    // Only HR can update jobs
    if (req.user.role !== 'HR') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    try {
      const { status, title, description } = req.body;

      // Build update object with only provided fields
      const updateData: Partial<Job> = {};
      
      if (status !== undefined) {
        const validStatuses = ['Active', 'Paused', 'Closed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid status. Must be one of: Active, Paused, Closed'
          });
        }
        updateData.status = status;
      }

      if (title !== undefined) {
        if (!title.trim()) {
          return res.status(400).json({
            success: false,
            error: 'Title cannot be empty'
          });
        }
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        if (!description.trim()) {
          return res.status(400).json({
            success: false,
            error: 'Description cannot be empty'
          });
        }
        updateData.description = description.trim();
      }

      // If no fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields provided for update'
        });
      }

      // Update job (only if created by this HR)
      const { data: job, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', req.user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Job not found or access denied'
          });
        }
        console.error('Error updating job:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to update job'
        });
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Job updated successfully'
      });

    } catch (error) {
      console.error('Update job error:', error);
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