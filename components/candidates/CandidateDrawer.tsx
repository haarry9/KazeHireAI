import { useState, useEffect, useCallback } from 'react';
import { Candidate } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import ChatSummarizer from './ChatSummarizer';
import { User, Mail, Phone, Linkedin, Calendar, Star, FileText, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerDescription,
} from '../ui/drawer';

interface CandidateDrawerProps {
  candidateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateDrawer({ candidateId, open, onOpenChange }: CandidateDrawerProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = useCallback(async () => {
    if (!candidateId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`/api/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
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
  }, [candidateId]);

  useEffect(() => {
    if (open) {
      fetchCandidate();
    }
  }, [open, fetchCandidate]);

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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col relative">
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold text-gray-900 pr-8">
            {candidate?.name || 'Loading...'}
          </DrawerTitle>
          <DrawerDescription>
            Candidate Profile
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-lg">Loading candidate...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-lg text-red-600 mb-4">{error}</div>
              </div>
            </div>
          )}

          {candidate && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Candidate Information */}
              <div className="xl:col-span-1 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  
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

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    AI Insights
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Availability</p>
                      <p className="font-medium text-gray-900">
                        {candidate.start_date && candidate.end_date
                          ? `${formatDate(candidate.start_date)} - ${formatDate(candidate.end_date)}`
                          : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                      <p className="font-medium text-gray-900">
                        {candidate.min_salary && candidate.max_salary
                          ? `${formatSalary(candidate.min_salary)} - ${formatSalary(candidate.max_salary)}`
                          : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Interest Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={`w-4 h-4 ${
                                candidate.interest_level && rating <= candidate.interest_level
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {candidate.interest_level ? `${candidate.interest_level}/5` : 'Not rated'}
                        </span>
                      </div>
                    </div>

                    {candidate.summary_text && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Summary</p>
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                          {candidate.summary_text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Resume and Chat Summarizer */}
              <div className="xl:col-span-2 space-y-6">
                {/* Resume Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
                    {candidate.resume_url && (
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                  
                  {candidate.resume_url ? (
                    <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                      <iframe
                        src={candidate.resume_url}
                        className="w-full h-full"
                        title="Resume PDF"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Resume file uploaded
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                {candidate.cover_letter && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{candidate.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Chat Summarizer */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <ChatSummarizer 
                    candidateId={candidate.id.toString()} 
                    onSuccess={fetchCandidate}
                  />
                </div>
              </div>
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 