import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { callGeminiForResumeMatch, logAIInteraction } from '../../../utils/ai';
import { downloadAndConvertMultiplePdfs } from '../../../utils/pdf-converter';

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

// Simple prompt builder for MVP
function buildSimplePrompt(jobTitle, jobDescription, candidates) {
  const candidateList = candidates.map((candidate, index) => 
    `- Candidate ${index + 1}: ${candidate.name}, Resume: [image${index + 1}]`
  ).join('\n');

  return `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Candidates to evaluate:
${candidateList}

Instructions:
1. Analyze each resume image carefully
2. Rank ALL candidates based on their fit for the job requirements
3. If there are 5 or fewer candidates, return ALL of them sorted by fit score
4. If there are more than 5 candidates, return only the TOP 5
5. Use the exact candidate names provided above

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "candidate_1",
      "candidate_name": "Exact Name from List Above",
      "fit_score": number (1-10),
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"] or [],
      "reasoning": "1-2 sentence explanation of ranking"
    }
  ]
}

Order candidates from best to worst fit. Return ${candidates.length <= 5 ? 'ALL candidates' : 'top 5 candidates'}.`;
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
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, error: 'job_id is required' });
    }

    console.log(`Processing simplified resume match for job_id: ${job_id}`);

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

    // Prepare PDF data for conversion
    const pdfData = candidates.map((candidate, index) => ({
      url: candidate.resume_url,
      fileName: `Resume_${index + 1}.pdf`
    }));

    // Convert PDFs to images
    let images;
    try {
      images = await downloadAndConvertMultiplePdfs(pdfData);
    } catch (conversionError) {
      console.error('PDF conversion failed:', conversionError);
      await logAIInteraction('resume_match_existing_pool', 'PDF conversion failed', null, 'Failure');
      return res.status(422).json({ success: false, error: 'Failed to process resume files' });
    }

    // Build simplified prompt
    const prompt = buildSimplePrompt(job.title, job.description, candidates);

    // Call Gemini AI
    let aiResponse;
    try {
      aiResponse = await callGeminiForResumeMatch(prompt, images);
      await logAIInteraction('resume_match_existing_pool', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logAIInteraction('resume_match_existing_pool', prompt, null, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed' });
    }

    // Return simplified response
    console.log(`Successfully processed resume matching: ${aiResponse.top_candidates.length} candidates returned`);

    return res.status(200).json({
      success: true,
      top_candidates: aiResponse.top_candidates,
      job_info: {
        id: job.id,
        title: job.title
      },
      total_resumes_processed: candidates.length
    });

  } catch (error) {
    console.error('Unexpected error in existing pool matching:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 