import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST /api/resume_match/manual_upload - Upload job description + resumes, return top 5
  
  if (req.method === 'POST') {
    res.status(501).json({ error: "POST /api/resume_match/manual_upload not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 