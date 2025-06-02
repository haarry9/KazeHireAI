import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Candidate } from '@/lib/supabase';
import Link from 'next/link';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import ChatSummarizer from '../../components/candidates/ChatSummarizer';
import { User, Mail, Phone, Linkedin, Calendar, DollarSign, Star, FileText, ArrowLeft } from 'lucide-react';

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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/candidates">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
                <p className="text-gray-600 mt-1">Candidate Profile</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Candidate Information */}
            <div className="xl:col-span-1 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{candidate.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">LinkedIn</p>
                      {candidate.linkedin ? (
                        <a 
                          href={candidate.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900">Not provided</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Applied Date</p>
                      <p className="font-medium text-gray-900">{formatDate(candidate.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Job Position</p>
                      <p className="font-medium text-gray-900">
                        {(candidate as Candidate & { jobs?: { title: string } }).jobs?.title || 'No job assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary Display */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  AI Insights
                </h2>
                
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

                  {candidate.summary_text && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">AI Summary</label>
                      <p className="text-gray-700 text-sm leading-relaxed">{candidate.summary_text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Resume and AI Chat Summarizer */}
            <div className="xl:col-span-2 space-y-8">
              {/* Resume Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Resume
                </h2>
                
                {candidate.resume_url ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Resume file uploaded</p>
                      <a 
                        href={candidate.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
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

              {/* AI Chat Summarizer - Prominent Position */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ChatSummarizer 
                  candidateId={id as string} 
                  onSuccess={fetchCandidate}
                />
              </div>

              {/* Cover Letter Section */}
              {candidate.cover_letter && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Cover Letter
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{candidate.cover_letter}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 