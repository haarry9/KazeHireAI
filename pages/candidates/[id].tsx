import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Candidate } from '@/lib/supabase';
import Link from 'next/link';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/candidates/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (response.status === 404) {
          setError('Candidate not found');
          return;
        }
        throw new Error('Failed to fetch candidate');
      }

      const data = await response.json();
      setCandidate(data);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (amount: number | null | undefined) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-xl">Loading candidate...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-xl text-red-600 mb-4">{error}</div>
              <Link href="/candidates">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Back to Candidates
                </button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!candidate) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-xl">Candidate not found</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
              <p className="text-gray-600 mt-2">View detailed candidate information</p>
            </div>
            <Link href="/candidates">
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Back to Candidates
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Candidate Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  <p className="text-lg font-medium text-gray-900">{candidate.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900">{candidate.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <p className="text-gray-900">{candidate.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">LinkedIn</label>
                  {candidate.linkedin ? (
                    <a 
                      href={candidate.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {candidate.linkedin}
                    </a>
                  ) : (
                    <p className="text-gray-900">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Job Position</label>
                  <p className="text-gray-900">
                    {(candidate as Candidate & { jobs?: { title: string } }).jobs?.title || 'No job assigned'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Applied Date</label>
                  <p className="text-gray-900">{formatDate(candidate.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Resume</h2>
              
              {candidate.resume_url ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Resume file uploaded</p>
                    <a 
                      href={candidate.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Download PDF
                    </a>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                      src={candidate.resume_url}
                      className="w-full h-96"
                      title="Resume Preview"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No resume uploaded</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Cover Letter</h2>
              {candidate.cover_letter ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.cover_letter}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No cover letter provided</p>
              )}
            </div>

            {/* AI Summary & Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">AI Summary & Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Availability</label>
                  <p className="text-gray-900">
                    {candidate.start_date || candidate.end_date 
                      ? `${formatDate(candidate.start_date)} - ${formatDate(candidate.end_date)}`
                      : 'Not specified'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Salary Range</label>
                  <p className="text-gray-900">
                    {candidate.min_salary || candidate.max_salary
                      ? `${formatSalary(candidate.min_salary)} - ${formatSalary(candidate.max_salary)}`
                      : 'Not specified'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Interest Level</label>
                  <p className="text-gray-900">
                    {candidate.interest_level 
                      ? `${candidate.interest_level}/5`
                      : 'Not specified'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">AI Summary</label>
                  {candidate.summary_text ? (
                    <p className="text-gray-700">{candidate.summary_text}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-500 italic">No AI summary generated yet</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                        Upload Chat Transcript
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 