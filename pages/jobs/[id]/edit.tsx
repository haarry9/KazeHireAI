import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import Navbar from '../../../components/shared/Navbar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { jobsAPI } from '../../../lib/api';
import { JobStatus } from '../../../lib/supabase';
import { toast } from 'sonner';

interface EditJobFormData {
  title: string;
  description: string;
  status: JobStatus;
}

export default function EditJob() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue
  } = useForm<EditJobFormData>();

  // Fetch current job data
  const { data: jobResponse, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getById(id as string),
    enabled: !!id,
    retry: 1,
  });

  const job = jobResponse?.data;

  // Populate form with existing data
  useEffect(() => {
    if (job) {
      setValue('title', job.title);
      setValue('description', job.description);
      setValue('status', job.status);
    }
  }, [job, setValue]);

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: (data: EditJobFormData) => jobsAPI.update(id as string, data),
    onSuccess: () => {
      toast.success('Job updated successfully!');
      // Invalidate job queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Redirect to job detail page
      router.push(`/jobs/${id}`);
    },
    onError: (error: Error) => {
      const errorMessage = (error as any)?.response?.data?.error || error?.message || 'Failed to update job';
      toast.error(errorMessage);
    }
  });

  const onSubmit = async (data: EditJobFormData) => {
    updateJobMutation.mutate(data);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingJob) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute allowedRoles={['HR']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-8">
              <p className="text-gray-500">Job not found</p>
              <Button onClick={() => router.push('/jobs')} className="mt-4">
                Back to Jobs
              </Button>
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600 mt-2">Update job posting details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="title">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    {...register('title', { 
                      required: 'Job title is required',
                      minLength: {
                        value: 3,
                        message: 'Job title must be at least 3 characters'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Job title must be less than 100 characters'
                      }
                    })}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    rows={10}
                    placeholder="Describe the role, responsibilities, requirements, qualifications, and any other relevant details..."
                    {...register('description', { 
                      required: 'Job description is required',
                      minLength: {
                        value: 50,
                        message: 'Job description must be at least 50 characters'
                      },
                      maxLength: {
                        value: 5000,
                        message: 'Job description must be less than 5000 characters'
                      }
                    })}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Change status to control job visibility
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={updateJobMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    {updateJobMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Job
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateJobMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 