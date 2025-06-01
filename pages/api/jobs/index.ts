import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/jobs - List all jobs (HR only)
  // POST /api/jobs - Create a job (HR only)
  
  if (req.method === 'GET') {
    res.status(501).json({ error: "GET /api/jobs not implemented yet" });
  } else if (req.method === 'POST') {
    res.status(501).json({ error: "POST /api/jobs not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 