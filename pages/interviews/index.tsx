import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, User, FileText, CheckCircle, ChevronRight, Eye, Diamond } from 'lucide-react';
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

interface BiasFlag {
  term: string;
  justification: string;
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

interface BiasDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: string | null;
  flags: BiasFlag[];
  loading: boolean;
}

function BiasDetectionModal({ isOpen, onClose, feedback, flags, loading }: BiasDetectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Diamond className="w-5 h-5 mr-2 text-purple-600" />
            AI Bias Detection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Interview Feedback */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Interview Feedback</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {feedback ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{feedback}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No feedback available</p>
              )}
            </div>
          </div>

          {/* AI Analysis Results */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Diamond className="w-4 h-4 mr-1 text-purple-600" />
              AI Bias Analysis
            </h4>
            
            {loading ? (
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-center space-x-3">
                  <Diamond className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="text-purple-700 font-medium">Analyzing feedback for bias...</span>
                </div>
              </div>
            ) : flags.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-red-800 mb-2">
                        Potential Bias Detected ({flags.length} issue{flags.length !== 1 ? 's' : ''})
                      </h5>
                      <div className="space-y-3">
                        {flags.map((flag, index) => (
                          <div key={index} className="bg-white rounded-md p-3 border border-red-200">
                            <div className="flex items-start space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                &quot;{flag.term}&quot;
                              </span>
                            </div>
                            <p className="text-sm text-red-700 mt-2">{flag.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h6 className="text-sm font-medium text-amber-800">Recommendation</h6>
                      <p className="text-sm text-amber-700 mt-1">
                        Consider reviewing this feedback for potential bias. You may want to discuss with the interviewer 
                        to ensure fair and objective evaluation criteria.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="text-sm font-medium text-green-800">No Bias Detected</h5>
                    <p className="text-sm text-green-700 mt-1">
                      The feedback appears to be objective and free from obvious bias indicators.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewManagement() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [biasCheckLoading, setBiasCheckLoading] = useState<number | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: number; title: string; description: string } | null>(null);
  const [biasModalOpen, setBiasModalOpen] = useState(false);
  const [biasResults, setBiasResults] = useState<{ feedback: string; flags: BiasFlag[] }>({ feedback: '', flags: [] });
  const router = useRouter();

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(data.interviews);
      } else {
        toast.error(data.error || 'Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleBiasCheck = async (interviewId: number) => {
    try {
      setBiasCheckLoading(interviewId);
      setBiasModalOpen(true);
      setBiasResults({ feedback: '', flags: [] });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetch(`/api/interviews/${interviewId}/bias_check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setBiasResults({
          feedback: data.feedback,
          flags: data.flags || []
        });
        
        if (data.flags && data.flags.length > 0) {
          toast.error(`${data.flags.length} potential bias issue${data.flags.length !== 1 ? 's' : ''} detected`);
        } else {
          toast.success('No bias detected in the feedback');
        }
      } else {
        toast.error(data.error || 'Failed to check for bias');
        setBiasModalOpen(false);
      }
    } catch (error) {
      console.error('Error checking bias:', error);
      toast.error('Failed to check for bias');
      setBiasModalOpen(false);
    } finally {
      setBiasCheckLoading(null);
    }
  };

  const handleViewJobDescription = (job: { id: number; title: string; description: string }) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getFitScoreBadge = (score: number | null) => {
    if (!score) return undefined;
    
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (score >= 4) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (score >= 3) {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const upcomingInterviews = interviews.filter(i => i.status === 'Scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'Completed');

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading interviews...</div>
            </div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
              <p className="text-gray-600 mt-2">Manage upcoming and completed interviews</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => router.push('/interviews/schedule')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Interview</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{upcomingInterviews.length}</p>
                  <p className="text-gray-600">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{completedInterviews.length}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{interviews.length}</p>
                  <p className="text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interviews Tables */}
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Upcoming Interviews ({upcomingInterviews.length})
                </h3>
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interviewer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {upcomingInterviews.map((interview) => (
                        <tr key={interview.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-8 h-8 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {interview.candidate.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {interview.candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-900">{interview.job.title}</div>
                              <button
                                onClick={() => handleViewJobDescription(interview.job)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View job description"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{interview.interviewer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(interview.scheduled_time)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(interview.status)}>
                              {interview.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => router.push(`/candidates/${interview.candidate_id}`)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              View Candidate
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming interviews scheduled</p>
                </div>
              )}
            </div>

            {/* Completed Interviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Completed Interviews ({completedInterviews.length})
                </h3>
              </div>
              
              {completedInterviews.length > 0 ? (
                <div className="space-y-6 p-6">
                  {completedInterviews.map((interview) => (
                    <div key={interview.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center">
                              <User className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">{interview.candidate.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{interview.job.title}</span>
                              <button
                                onClick={() => handleViewJobDescription(interview.job)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View job description"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Interviewer: {interview.interviewer.name}</span>
                            <span>Date: {formatDate(interview.scheduled_time)}</span>
                            {interview.fit_score && (
                              <span className={getFitScoreBadge(interview.fit_score)}>
                                Fit Score: {interview.fit_score}/5
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {interview.raw_feedback && (
                            <button
                              onClick={() => handleBiasCheck(interview.id)}
                              disabled={biasCheckLoading === interview.id}
                              className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
                              title="Run AI Bias Detection"
                            >
                              <Diamond className="w-4 h-4" />
                              <span className="text-sm">
                                {biasCheckLoading === interview.id ? 'Checking...' : 'Bias Check'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Interview Feedback */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Interview Feedback</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            {interview.raw_feedback ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.raw_feedback}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No feedback provided</p>
                            )}
                          </div>
                        </div>
                        
                        {/* AI Summary */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Diamond className="w-4 h-4 mr-1 text-purple-600" />
                            AI Summary
                          </h4>
                          <div className="bg-purple-50 rounded-lg p-4">
                            {interview.ai_summary ? (
                              <p className="text-sm text-gray-700">{interview.ai_summary}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No AI summary available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed interviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <JobDescriptionModal 
          isOpen={jobModalOpen}
          onClose={() => setJobModalOpen(false)}
          job={selectedJob}
        />

        <BiasDetectionModal 
          isOpen={biasModalOpen}
          onClose={() => setBiasModalOpen(false)}
          feedback={biasResults.feedback}
          flags={biasResults.flags}
          loading={biasCheckLoading !== null}
        />
      </div>
    </ProtectedRoute>
  );
} 