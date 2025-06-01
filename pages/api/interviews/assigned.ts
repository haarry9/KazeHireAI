import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/interviews/assigned - List interviews assigned to logged-in Interviewer
  
  if (req.method === 'GET') {
    res.status(501).json({ error: "GET /api/interviews/assigned not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 