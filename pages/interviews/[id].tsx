import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Eye, Diamond, User } from 'lucide-react';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Interview {
  id: number;
  candidate_id: number;
  job_id: number;
  interviewer_id: string;
  scheduled_time: string;
  status: 'Scheduled' | 'Completed';
  raw_feedback: string | null;
  ai_summary: string | null;
  fit_score: number | null;
  created_at: string;
  candidate: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    linkedin: string | null;
    resume_url: string | null;
  };
  job: {
    id: number;
    title: string;
    description: string;
  };
  interviewer: {
    id: string;
    name: string;
  };
}

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: { id: number; title: string; description: string } | null;
}

function JobDescriptionModal({ isOpen, onClose, job }: JobDescriptionModalProps) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">{job.title}</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewDetails() {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: '',
    status: 'Completed' as 'Scheduled' | 'Completed'
  });
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ fit_score: number; summary: string } | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const fetchUserRole = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, []);

  const fetchInterview = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      // Fetch interview with all related data
      const { data: interviewData, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates (
            id,
            name,
            email,
            phone,
            linkedin,
            resume_url
          ),
          job:jobs (
            id,
            title,
            description
          ),
          interviewer:users!interviews_interviewer_id_fkey (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error || !interviewData) {
        toast.error('Interview not found');
        router.push('/interviews');
        return;
      }

      setInterview(interviewData);
      
      // Pre-fill form if feedback already exists
      if (interviewData.raw_feedback) {
        setFeedbackForm({
          feedback: interviewData.raw_feedback,
          status: interviewData.status
        });
      }
      
      // Set AI summary if it exists
      if (interviewData.ai_summary && interviewData.fit_score) {
        setAiSummary({
          fit_score: interviewData.fit_score,
          summary: interviewData.ai_summary
        });
      }
    } catch (error) {
      console.error('Error fetching interview:', error);
      toast.error('Failed to fetch interview');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInterview();
    fetchUserRole();
  }, [fetchInterview, fetchUserRole]);

  const handleGenerateSummary = async () => {
    if (!feedbackForm.feedback.trim()) {
      toast.error('Please provide feedback first');
      return;
    }

    try {
      setSummaryGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetch(`/api/interviews/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackForm.feedback,
          status: feedbackForm.status
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAiSummary({
          fit_score: data.fit_score,
          summary: data.summary
        });
        toast.success('AI summary generated successfully');
        // Refresh the interview data
        await fetchInterview();
      } else {
        toast.error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setSummaryGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'Scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getFitScoreBadge = (score: number) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    if (score >= 4) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (score >= 3) {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const isInterviewer = userRole === 'INTERVIEWER' && interview?.interviewer_id === currentUserId;
  const canEditFeedback = isInterviewer && interview?.status === 'Scheduled' && !interview?.raw_feedback;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['HR', 'INTERVIEWER']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading interview details...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!interview) {
    return (
      <ProtectedRoute allowedRoles={['HR', 'INTERVIEWER']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Interview not found</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['HR', 'INTERVIEWER']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Interview Details</h1>
            <p className="text-gray-600 mt-2">Review candidate information and provide feedback</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Candidate Information */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Candidate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{interview.candidate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{interview.candidate.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{interview.candidate.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                    {interview.candidate.linkedin ? (
                      <a href={interview.candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {interview.candidate.linkedin}
                      </a>
                    ) : (
                      <p className="text-gray-400">Not provided</p>
                    )}
                  </div>
                </div>
                
                {interview.candidate.resume_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Resume</p>
                    <a 
                      href={interview.candidate.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <User className="w-4 h-4 mr-1" />
                      View Resume
                    </a>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Job Description</h3>
                  <button
                    onClick={() => setJobModalOpen(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Full Description
                  </button>
                </div>
                <div className="prose prose-sm">
                  <h4 className="text-xl font-semibold text-gray-900">{interview.job.title}</h4>
                  <p className="text-gray-700 line-clamp-3">{interview.job.description}</p>
                </div>
              </div>

              {/* Interview Feedback - Only for Interviewers */}
              {canEditFeedback && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Interview Feedback</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback *
                      </label>
                      <textarea
                        rows={6}
                        value={feedbackForm.feedback}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your thoughts about the candidate..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select 
                        value={feedbackForm.status}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value as 'Scheduled' | 'Completed' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={summaryGenerating || !feedbackForm.feedback.trim()}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Diamond className="w-4 h-4 mr-2" />
                        {summaryGenerating ? 'Generating...' : 'Generate AI Summary'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Read-only feedback for HR or completed interviews */}
              {(userRole === 'HR' || interview.raw_feedback) && interview.raw_feedback && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Interview Feedback</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{interview.raw_feedback}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Interview Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Interview Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <p className="text-gray-900">{formatDate(interview.scheduled_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interviewer</p>
                    <p className="text-gray-900">{interview.interviewer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={getStatusBadge(interview.status)}>
                      {interview.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Diamond className="w-5 h-5 mr-2 text-purple-600" />
                  AI Summary
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fit Score</p>
                    {aiSummary?.fit_score || interview.fit_score ? (
                      <span className={getFitScoreBadge(aiSummary?.fit_score || interview.fit_score!)}>
                        {aiSummary?.fit_score || interview.fit_score}/5
                      </span>
                    ) : (
                      <p className="text-gray-400">Not generated yet</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Summary</p>
                    {aiSummary?.summary || interview.ai_summary ? (
                      <div className="bg-purple-50 rounded-lg p-3 mt-2">
                        <p className="text-gray-700 text-sm">{aiSummary?.summary || interview.ai_summary}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Generate feedback first</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <JobDescriptionModal 
          isOpen={jobModalOpen}
          onClose={() => setJobModalOpen(false)}
          job={interview.job}
        />
      </div>
    </ProtectedRoute>
  );
} 