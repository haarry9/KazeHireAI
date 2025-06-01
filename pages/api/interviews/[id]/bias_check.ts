import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST /api/interviews/[id]/bias_check - Run bias detection on feedback
  
  const { id } = req.query;
  
  if (req.method === 'POST') {
    res.status(501).json({ error: `POST /api/interviews/${id}/bias_check not implemented yet` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 