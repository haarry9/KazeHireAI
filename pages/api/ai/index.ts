import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Core AI logic endpoint (if needed as standalone)
  res.status(501).json({ error: "AI endpoint not implemented yet" });
} 