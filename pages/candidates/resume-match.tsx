import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { jobsAPI } from '../../lib/api';
import { Job } from '../../lib/supabase';
import { toast } from 'sonner';

export default function ResumeMatch() {
  const [activeMode, setActiveMode] = useState<'existing' | 'manual'>('existing');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [comments, setComments] = useState('');

  // Fetch jobs for the dropdown
  const { data: jobsResponse, isLoading: isLoadingJobs, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsAPI.getAll,
    retry: 1,
  });

  const jobs = jobsResponse?.data || [];

  if (jobsError) {
    toast.error('Failed to load jobs');
  }

  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Matcher</h1>
            <p className="text-gray-600 mt-2">Match candidates to job requirements using AI</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <Button
                variant={activeMode === 'existing' ? 'default' : 'ghost'}
                onClick={() => setActiveMode('existing')}
                className="px-6 py-2"
              >
                Existing Pool
              </Button>
              <Button
                variant={activeMode === 'manual' ? 'default' : 'ghost'}
                onClick={() => setActiveMode('manual')}
                className="px-6 py-2"
              >
                Manual Upload
              </Button>
            </div>
          </div>

          {/* Content based on active mode */}
          <div className="max-w-2xl mx-auto">
            {activeMode === 'existing' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Match From Existing Pool</CardTitle>
                  <p className="text-gray-600">Select a job and match against existing candidates</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                    {isLoadingJobs ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        <span className="text-gray-500">Loading jobs...</span>
                      </div>
                    ) : (
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                      >
                        <option value="">Choose a job...</option>
                        {jobs.filter((job: Job) => job.status === 'Active').map((job: Job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    )}
                    {jobs.length === 0 && !isLoadingJobs && (
                      <p className="text-sm text-gray-500 mt-1">
                        No active jobs found. <a href="/jobs/create" className="text-blue-600 hover:underline">Create a job first</a>.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                    <textarea 
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific requirements or preferences..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!selectedJobId || isLoadingJobs}
                  >
                    Match Candidates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Manual Upload & Match</CardTitle>
                  <p className="text-gray-600">Upload job description and resumes for comparison</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Paste or type the job description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resumes (1-5 PDFs)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">Choose Files No file chosen</p>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Upload & Match
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Match Results Section */}
          <div className="max-w-4xl mx-auto mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Match Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No matches yet. Use one of the options above to get started.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 