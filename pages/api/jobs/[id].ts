import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/jobs/[id] - Retrieve job details
  // PATCH /api/jobs/[id] - Update job status
  
  const { id } = req.query;
  
  if (req.method === 'GET') {
    res.status(501).json({ error: `GET /api/jobs/${id} not implemented yet` });
  } else if (req.method === 'PATCH') {
    res.status(501).json({ error: `PATCH /api/jobs/${id} not implemented yet` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 