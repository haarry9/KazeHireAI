import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { createUserProfile } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, role'
      });
    }

    // Validate role
    if (role !== 'HR' && role !== 'INTERVIEWER') {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be HR or INTERVIEWER'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create user account'
      });
    }

    // Create user profile in our users table
    const userProfile = await createUserProfile(
      authData.user.id,
      email,
      name,
      role
    );

    if (!userProfile) {
      // If profile creation fails, we should ideally clean up the auth user
      // For MVP, we'll just return an error
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 