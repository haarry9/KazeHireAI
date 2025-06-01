import { useState, useEffect } from 'react';
import { supabase, getSession, getCurrentUser } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function TestAuth() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentSession = await getSession();
      const currentUser = await getCurrentUser();
      
      console.log('Session:', currentSession);
      console.log('User:', currentUser);
      
      setSession(currentSession);
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTokenExtraction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log('Token extraction test:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
    } catch (error) {
      console.error('Token extraction error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Session Status:</h3>
            <p>{session ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">User Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Session Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={checkAuth}>Refresh Auth</Button>
            <Button onClick={testTokenExtraction}>Test Token Extraction</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 