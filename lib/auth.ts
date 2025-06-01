import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, User, UserRole } from './supabase';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

// Simple in-memory cache for user profiles (valid for 5 minutes)
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Middleware to verify user authentication and get user data
export const withAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  requiredRole?: UserRole
) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return { error: 'Invalid or expired token', status: 401 };
    }

    // Check cache first
    const cached = userCache.get(authUser.id);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      // Check role if required
      if (requiredRole && cached.user.role !== requiredRole) {
        return { error: 'Insufficient permissions', status: 403 };
      }
      return { user: cached.user };
    }

    // Get user profile from our users table if not cached or expired
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return { error: 'User profile not found', status: 404 };
    }

    // Cache the user profile
    userCache.set(authUser.id, { user: userProfile, timestamp: Date.now() });

    // Check role if required
    if (requiredRole && userProfile.role !== requiredRole) {
      return { error: 'Insufficient permissions', status: 403 };
    }

    return { user: userProfile };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
};

// Helper to protect API routes
export const requireAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>,
  requiredRole?: UserRole
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authResult = await withAuth(req, res, requiredRole);
    
    if ('error' in authResult) {
      return res.status(authResult.status).json({ 
        success: false, 
        error: authResult.error 
      });
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = authResult.user;
    
    return handler(req as AuthenticatedRequest, res);
  };
};

// Helper to check if user has HR role
export const requireHR = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>
) => {
  return requireAuth(handler, 'HR');
};

// Helper to check if user has Interviewer role
export const requireInterviewer = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>
) => {
  return requireAuth(handler, 'INTERVIEWER');
};

// Utility function to create user profile after Supabase Auth signup
export const createUserProfile = async (
  userId: string,
  email: string,
  name: string,
  role: UserRole
) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        email,
        name,
        role
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}; 