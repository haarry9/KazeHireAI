import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function ScheduleInterview() {
  const router = useRouter();
  const [candidateInfo, setCandidateInfo] = useState({
    id: '',
    name: ''
  });

  useEffect(() => {
    if (router.query.candidate_id && router.query.candidate_name) {
      setCandidateInfo({
        id: router.query.candidate_id as string,
        name: decodeURIComponent(router.query.candidate_name as string)
      });
    }
  }, [router.query]);

  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Resume Matcher
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Schedule Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidateInfo.name && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">Selected Candidate</h3>
                  <p className="text-blue-700">{candidateInfo.name}</p>
                  <p className="text-blue-600 text-sm">ID: {candidateInfo.id}</p>
                </div>
              )}

              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Interview Scheduling Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  This feature will be available in Phase 7 of the development.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>✅ Phase 6: Resume Matching AI (Current)</p>
                  <p>🔄 Phase 7: Interview Scheduling & Management</p>
                  <p>📅 Phase 8: Chat Summarization AI</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Back to Matching
                </Button>
                <Button 
                  disabled
                  className="flex-1 opacity-50 cursor-not-allowed"
                >
                  Schedule Interview (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 