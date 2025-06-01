import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/interviews/[id] - View interview details
  
  const { id } = req.query;
  
  if (req.method === 'GET') {
    res.status(501).json({ error: `GET /api/interviews/${id} not implemented yet` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 