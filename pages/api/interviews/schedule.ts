import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST /api/interviews/schedule - Schedule an interview (HR only)
  
  if (req.method === 'POST') {
    res.status(501).json({ error: "POST /api/interviews/schedule not implemented yet" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 