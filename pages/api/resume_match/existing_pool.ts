import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { buildExistingPoolTextPrompt } from '../../../utils/ai';
import { callOpenRouterForResumeMatch, logOpenRouterInteraction } from '../../../utils/openrouter';
import { downloadAndExtractMultipleTexts } from '../../../utils/pdf-text-extractor';
import { ResumeMatchResult } from '../../../types';

// Simple auth validation function
async function validateUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { isValid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { isValid: false, error: 'Invalid token' };
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { isValid: false, error: 'User profile not found' };
  }

  return { isValid: true, user: profile };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Simple auth validation
    const userValidation = await validateUser(req);
    if (!userValidation.isValid) {
      return res.status(401).json({ success: false, error: userValidation.error });
    }

    const { user } = userValidation;
    if (user.role !== 'HR') {
      return res.status(403).json({ success: false, error: 'Access denied. HR role required.' });
    }

    // Extract request data
    const { job_id, comments } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, error: 'job_id is required' });
    }

    console.log(`Processing text-based resume match for job_id: ${job_id}`);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, description, status')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      console.error('Job fetch error:', jobError);
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Job is not active' });
    }

    // Fetch ALL candidates with resumes (not filtered by job_id for MVP)
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, email, resume_url')
      .not('resume_url', 'is', null);

    if (candidatesError) {
      console.error('Candidates fetch error:', candidatesError);
      return res.status(500).json({ success: false, error: 'Failed to fetch candidates' });
    }

    if (!candidates || candidates.length === 0) {
      return res.status(200).json({ 
        success: true, 
        top_candidates: [],
        message: 'No candidates with resumes found'
      });
    }

    console.log(`Found ${candidates.length} candidates with resumes`);

    // Prepare PDF data for text extraction
    const pdfData = candidates.map((candidate) => ({
      url: candidate.resume_url,
      fileName: `${candidate.name}_Resume.pdf`
    }));

    // Extract text from PDFs
    let resumeTexts;
    try {
      const extractedTexts = await downloadAndExtractMultipleTexts(pdfData);
      
      // Map extracted texts back to candidates with database names for consistency
      resumeTexts = extractedTexts.map((extracted, index) => {
        const candidate = candidates[index];
        
        return {
          id: candidate.id.toString(),
          name: candidate.name, // Use database name for consistency
          text: extracted.text
        };
      });
    } catch (extractionError) {
      console.error('PDF text extraction failed:', extractionError);
      await logOpenRouterInteraction('resume_match_existing_pool', 'PDF text extraction failed', {}, 'Failure');
      return res.status(422).json({ success: false, error: 'Failed to extract text from resume files' });
    }

    if (resumeTexts.length === 0) {
      return res.status(422).json({ success: false, error: 'No resume texts could be extracted' });
    }

    console.log(`Successfully extracted text from ${resumeTexts.length} resumes`);

    // Build text-based prompt
    const prompt = buildExistingPoolTextPrompt(job, resumeTexts, comments);

    // Call OpenRouter AI with text-only processing
    let aiResponse: { top_candidates: ResumeMatchResult[] };
    try {
      aiResponse = await callOpenRouterForResumeMatch(prompt) as { top_candidates: ResumeMatchResult[] };
      await logOpenRouterInteraction('resume_match_existing_pool', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logOpenRouterInteraction('resume_match_existing_pool', prompt, {}, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed' });
    }

    // Return response
    console.log(`Successfully processed text-based resume matching: ${aiResponse.top_candidates.length} candidates returned`);

    return res.status(200).json({
      success: true,
      top_candidates: aiResponse.top_candidates,
      job_info: {
        id: job.id,
        title: job.title
      },
      total_resumes_processed: resumeTexts.length,
      processing_method: 'text_extraction'
    });

  } catch (error) {
    console.error('Unexpected error in existing pool matching:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 