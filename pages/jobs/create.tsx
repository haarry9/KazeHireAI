import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import Navbar from '../../components/shared/Navbar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { jobsAPI } from '../../lib/api';
import { JobStatus } from '../../lib/supabase';
import { toast } from 'sonner';

interface CreateJobFormData {
  title: string;
  description: string;
  status: JobStatus;
}

export default function CreateJob() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm<CreateJobFormData>({
    defaultValues: {
      status: 'Active'
    }
  });

  // Watch description field for character count
  const description = watch('description', '');

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      toast.success('Job created successfully!');
      // Invalidate jobs query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Redirect to jobs list
      router.push('/jobs');
    },
    onError: (error: Error) => {
      console.error('Job creation error:', error);
      let errorMessage = 'Failed to create job';
      
      if (error?.message?.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.message?.includes('403')) {
        errorMessage = 'You do not have permission to create jobs.';
      } else if ((error as any)?.response?.data?.error) {
        errorMessage = (error as any).response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });

  const onSubmit = async (data: CreateJobFormData) => {
    createJobMutation.mutate(data);
  };

  const handleCancel = () => {
    router.back();
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600 mt-2">Add a new job posting to your recruitment pipeline</p>
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
                  <div className="flex justify-between items-center mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                    <p className={`text-sm ml-auto ${
                      description.length > 5000 ? 'text-red-600' : 
                      description.length > 4500 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {description.length}/5000 characters
                    </p>
                  </div>
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
                    Active jobs are visible to potential candidates
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createJobMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    {createJobMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Job
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createJobMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Tips for creating effective job postings:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use clear, specific job titles that candidates will search for</li>
                <li>• Include key responsibilities, required skills, and qualifications</li>
                <li>• Mention company culture, benefits, and growth opportunities</li>
                <li>• Specify experience level and any required certifications</li>
                <li>• Keep the description concise but comprehensive</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 