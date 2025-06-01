import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/candidates - List all candidates (HR only)
  // POST /api/candidates - Add a candidate with PDF upload (HR only)
  
  if (req.method === 'GET') {
    res.status(501).json({ error: "GET /api/candidates not implemented yet" });
  } else if (req.method === 'POST') {
    res.status(501).json({ error: "POST /api/candidates not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 