import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { supabase } from '../../../lib/supabase';
import { callOpenRouterForResumeMatch, logOpenRouterInteraction } from '../../../utils/openrouter';
import { extractTextFromPdf } from '../../../utils/pdf-text-extractor';
import { ResumeMatchResult } from '../../../types';

// Simple auth validation function
async function validateUser(req: NextApiRequest) {
  console.log('=== MANUAL UPLOAD AUTH DEBUG ===');
  console.log('Headers received:', Object.keys(req.headers));
  console.log('Authorization header:', req.headers.authorization);
  console.log('Content-Type header:', req.headers['content-type']);
  console.log('Method:', req.method);
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ Auth header validation failed:', { authHeader });
    return { isValid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Token extracted:', token?.substring(0, 20) + '...');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.log('❌ Supabase auth failed:', { error, hasUser: !!user });
    return { isValid: false, error: 'Invalid token' };
  }

  console.log('✅ Supabase auth successful:', user.id);

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.log('❌ Profile fetch failed:', { profileError, hasProfile: !!profile });
    return { isValid: false, error: 'User profile not found' };
  }

  console.log('✅ User profile found:', { id: profile.id, role: profile.role });
  console.log('=== AUTH DEBUG END ===');
  return { isValid: true, user: profile };
}

// Build prompt for manual upload (text-based)
function buildManualUploadPrompt(jobDescription: string, resumeTexts: Array<{ identifier: string, text: string }>) {
  const candidateList = resumeTexts.map((resume) => 
    `${resume.identifier}:\n${resume.text.substring(0, 2500)}...\n`
  ).join('\n---\n');

  const maxCandidates = Math.min(resumeTexts.length, 5);

  return `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Description: ${jobDescription}

Resumes to evaluate:
${candidateList}

Instructions:
1. Analyze each resume text carefully to extract the candidate's name
2. Rank ALL candidates based on their fit for the job requirements  
3. Return the top ${maxCandidates} candidates (or fewer if less than ${maxCandidates} provided)
4. For candidate_id, use systematic format: "resume_1", "resume_2", etc.
5. For candidate_name, extract the actual name from the resume content

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "resume_1",
      "candidate_name": "Full Name Extracted From Resume",
      "fit_score": number (1-10),
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"] or [],
      "reasoning": "1-2 sentence explanation of ranking"
    }
  ]
}

Order candidates from best to worst fit. Return up to ${maxCandidates} candidates.`;
}

interface ManualUploadAIResponse {
  top_candidates: ResumeMatchResult[];
}

// Disable Next.js built-in body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    console.log('Processing manual upload resume matching...');

    // Parse the multipart form data
    const form = formidable({
      maxFiles: 10, // Allow up to 10 files for flexibility
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      filter: ({ name, mimetype }) => {
        // Only accept PDF files for resumes
        return name === 'resumes' && mimetype === 'application/pdf';
      },
    });

    const [fields, files] = await form.parse(req);

    // Extract job description
    const jobDescription = Array.isArray(fields.job_description) 
      ? fields.job_description[0] 
      : fields.job_description;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ success: false, error: 'Job description is required' });
    }

    // Extract resume files
    const resumeFiles = files.resumes;
    if (!resumeFiles || resumeFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one resume file is required' });
    }

    if (resumeFiles.length < 2) {
      return res.status(400).json({ success: false, error: 'Minimum 2 resume files required' });
    }

    console.log(`Processing ${resumeFiles.length} resume files...`);

    // Extract text from all PDFs
    const resumeTexts: Array<{ identifier: string, text: string }> = [];
    
    for (let i = 0; i < resumeFiles.length; i++) {
      const file = resumeFiles[i];
      try {
        const buffer = fs.readFileSync(file.filepath);
        const extractedText = await extractTextFromPdf(buffer);
        
        resumeTexts.push({
          identifier: `Resume ${i + 1}`,
          text: extractedText
        });
        
        console.log(`Extracted text from ${file.originalFilename}, assigned identifier: Resume ${i + 1}`);
      } catch (error) {
        console.error(`Failed to process ${file.originalFilename}:`, error);
        return res.status(422).json({ 
          success: false, 
          error: `Failed to process resume file: ${file.originalFilename}` 
        });
      } finally {
        // Clean up temp file
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
    }

    if (resumeTexts.length === 0) {
      return res.status(422).json({ success: false, error: 'No valid resume files processed' });
    }

    // Build prompt for AI processing
    const prompt = buildManualUploadPrompt(jobDescription.trim(), resumeTexts);

    // Call OpenRouter AI with text-only prompt
    let aiResponse: ManualUploadAIResponse;
    try {
      aiResponse = await callOpenRouterForResumeMatch(prompt);
      await logOpenRouterInteraction('resume_match_manual_upload', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logOpenRouterInteraction('resume_match_manual_upload', prompt, (aiError as Error).message || {}, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed' });
    }

    console.log(`Successfully processed manual upload: ${aiResponse.top_candidates.length} candidates ranked`);

    return res.status(200).json({
      success: true,
      top_candidates: aiResponse.top_candidates,
      files_processed: resumeTexts.length,
      job_description_length: jobDescription.trim().length
    });

  } catch (error) {
    console.error('Unexpected error in manual upload matching:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 