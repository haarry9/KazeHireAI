import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!user) {
      // User not authenticated, redirect to login
      router.push('/auth/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have required role
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Default redirect based on role
        if (user.role === 'HR') {
          router.push('/dashboard');
        } else if (user.role === 'INTERVIEWER') {
          router.push('/interviews/assigned');
        }
      }
      return;
    }
  }, [user, loading, router, allowedRoles, redirectTo]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have required role
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
} 