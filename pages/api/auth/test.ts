import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';

export default requireAuth(async (req, res) => {
  if (req.method === 'GET') {
    // Return user data if authenticated
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        created_at: req.user.created_at
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}); 