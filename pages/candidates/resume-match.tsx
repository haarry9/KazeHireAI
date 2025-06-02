import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import ResumeMatchResults from '../../components/candidates/ResumeMatchResults';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { jobsAPI, resumeMatchAPI } from '../../lib/api';
import { Job } from '../../lib/supabase';
import { ResumeMatchResult } from '../../types';
import { toast } from 'sonner';

export default function ResumeMatch() {
  const [activeMode, setActiveMode] = useState<'existing' | 'manual'>('existing');
  
  // Existing pool state
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Manual upload state
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Results state
  const [matchResults, setMatchResults] = useState<ResumeMatchResult[]>([]);
  const [totalResumesProcessed, setTotalResumesProcessed] = useState<number>(0);

  // Fetch jobs for the dropdown
  const { data: jobsResponse, isLoading: isLoadingJobs, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsAPI.getAll,
    retry: 1,
  });

  const jobs = jobsResponse?.data || [];

  // Existing pool mutation
  const existingPoolMutation = useMutation({
    mutationFn: (data: { job_id: string }) => 
      resumeMatchAPI.existingPool(data.job_id),
    onSuccess: (response) => {
      if (response.success) {
        setMatchResults(response.top_candidates || []);
        setTotalResumesProcessed(response.total_resumes_processed || 0);
        toast.success(`Resume matching completed! Processed ${response.total_resumes_processed} resumes.`);
      } else {
        toast.error(response.error || 'Failed to match resumes');
      }
    },
    onError: (error: Error) => {
      console.error('Existing pool matching failed:', error);
      toast.error('Failed to process resume matching');
    }
  });

  // Manual upload mutation
  const manualUploadMutation = useMutation({
    mutationFn: (formData: FormData) => resumeMatchAPI.manualUpload(formData),
    onSuccess: (response) => {
      if (response.success) {
        setMatchResults(response.top_candidates || []);
        setTotalResumesProcessed(response.files_processed || 0);
        toast.success(`Successfully matched ${response.files_processed} resumes!`);
      } else {
        toast.error(response.error || 'Failed to match resumes');
      }
    },
    onError: (error: Error) => {
      console.error('Manual upload matching failed:', error);
      toast.error('Failed to process resume matching');
    }
  });

  const handleExistingPoolMatch = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job');
      return;
    }

    existingPoolMutation.mutate({
      job_id: selectedJobId
    });
  };

  const handleManualUploadMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please select at least 2 resume files');
      return;
    }

    if (selectedFiles.length < 2) {
      toast.error('Minimum 2 resume files required');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    
    // Add all selected files
    selectedFiles.forEach((file) => {
      formData.append('resumes', file);
    });

    manualUploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;

    const newFilesArray = Array.from(newFiles);
    
    // Add new files to existing ones, avoiding duplicates
    const updatedFiles = [...selectedFiles];
    
    newFilesArray.forEach((file) => {
      // Check if file already exists (by name and size)
      const existingFile = updatedFiles.find(
        existing => existing.name === file.name && existing.size === file.size
      );
      if (!existingFile) {
        updatedFiles.push(file);
      }
    });
    
    setSelectedFiles(updatedFiles);
    
    // Reset the file input value so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    // Reset the file input
    const fileInput = document.getElementById('resume-files') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const isLoading = existingPoolMutation.isPending || manualUploadMutation.isPending;

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
            <p className="text-sm text-gray-500 mt-1">MVP Implementation - Simplified for testing</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <Button
                variant={activeMode === 'existing' ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveMode('existing');
                  setMatchResults([]); // Clear previous results
                  setTotalResumesProcessed(0);
                }}
                className="px-6 py-2"
                disabled={isLoading}
              >
                Existing Pool
              </Button>
              <Button
                variant={activeMode === 'manual' ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveMode('manual');
                  setMatchResults([]); // Clear previous results
                  setTotalResumesProcessed(0);
                }}
                className="px-6 py-2"
                disabled={isLoading}
              >
                Manual Upload
              </Button>
            </div>
          </div>

          {/* Content based on active mode */}
          <div className="max-w-2xl mx-auto mb-8">
            {activeMode === 'existing' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Match From Existing Pool</CardTitle>
                  <p className="text-gray-600">Select a job and match against ALL available resumes in the system</p>
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
                        disabled={isLoading}
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
                        No active jobs found. <Link href="/jobs/create" className="text-blue-600 hover:underline">Create a job first</Link>.
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>MVP Note:</strong> This will process ALL resumes in the system against the selected job, 
                      not just resumes specifically assigned to this job.
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!selectedJobId || isLoadingJobs || isLoading}
                    onClick={handleExistingPoolMatch}
                  >
                    {isLoading ? 'AI is analyzing resumes...' : 'Match All Resumes'}
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
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumes (Minimum 2 PDFs, Maximum 10)
                    </label>
                    <input
                      id="resume-files"
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    
                    {/* File List Display */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            Selected Files ({selectedFiles.length})
                          </p>
                          <button
                            type="button"
                            onClick={clearAllFiles}
                            className="text-sm text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 truncate flex-1">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-2 text-red-600 hover:text-red-800"
                                disabled={isLoading}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {selectedFiles.length < 2 && (
                          <p className="text-sm text-orange-600 mt-2">
                            ⚠️ Please select at least 2 resume files
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFiles.length > 0 
                        ? `${selectedFiles.length} file(s) selected` 
                        : 'Choose files - No files chosen'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Manual Upload:</strong> This processes uploaded resumes using AI text extraction 
                      and ranking without saving anything to the database.
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!jobDescription.trim() || selectedFiles.length < 2 || isLoading}
                    onClick={handleManualUploadMatch}
                  >
                    {isLoading ? 'AI is processing...' : `Upload & Match ${selectedFiles.length} Resumes`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Match Results Section */}
          <div className="max-w-4xl mx-auto">
            <ResumeMatchResults 
              results={matchResults}
              isLoading={isLoading}
              totalResumesProcessed={totalResumesProcessed}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 