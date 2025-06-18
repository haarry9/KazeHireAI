import type { NextApiRequest, NextApiResponse } from 'next';
import { callOpenRouterForResumeMatch } from '../../utils/openrouter';

const testPrompt = `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Title: Software Engineer
Job Description: We are looking for a skilled software engineer with experience in JavaScript, React, and Node.js.

Candidate Data:
- Candidate ID: 1, Name: John Doe
Resume Content: Software Engineer with 5 years of experience in JavaScript, React, Node.js, and Python. Built multiple web applications...

Instructions:
1. Analyze each resume text content carefully
2. Rank candidates based on their fit for the job requirements
3. Provide exactly the top 5 candidates (or all if fewer than 5)
4. Use the exact Candidate IDs provided above in your response

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string", 
      "fit_score": number (1-10),
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"] or [],
      "reasoning": "1-2 sentence explanation of ranking"
    }
  ]
}

Order candidates from best to worst fit. Include up to 5 candidates.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing OpenRouter integration via API route...');
    console.log('OPEN_ROUTER_API_KEY present:', !!process.env.OPEN_ROUTER_API_KEY);
    
    const result = await callOpenRouterForResumeMatch(testPrompt);
    
    return res.status(200).json({
      success: true,
      message: 'OpenRouter integration working!',
      result
    });
  } catch (error) {
    console.error('OpenRouter test failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: (error as { response?: { data?: unknown } })?.response?.data || null
    });
  }
} 