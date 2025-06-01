import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST /api/candidates/[id]/summarize_chat - Upload chat transcript and generate AI summary
  
  const { id } = req.query;
  
  if (req.method === 'POST') {
    res.status(501).json({ error: `POST /api/candidates/${id}/summarize_chat not implemented yet` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 