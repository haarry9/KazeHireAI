import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST /api/resume_match/existing_pool - Match job to top 5 candidates from pool
  
  if (req.method === 'POST') {
    res.status(501).json({ error: "POST /api/resume_match/existing_pool not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 