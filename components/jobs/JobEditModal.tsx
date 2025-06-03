import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Job, JobStatus } from '../../lib/supabase';
import { jobsAPI } from '../../lib/api';
import { toast } from 'sonner';

interface JobEditModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobEditModal({ job, open, onOpenChange }: JobEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<JobStatus>('Active');
  
  const queryClient = useQueryClient();

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description);
      setStatus(job.status);
    }
  }, [job]);

  const updateJobMutation = useMutation({
    mutationFn: (data: { title: string; description: string; status: JobStatus }) => 
      jobsAPI.update(job!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateJobMutation.mutate({ title: title.trim(), description: description.trim(), status });
  };

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Paused': return 'secondary'; 
      case 'Closed': return 'destructive';
      default: return 'outline';
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Job
            </DialogTitle>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Job Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter job title"
              required
              className="w-full"
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Job Description *
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description"
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Job Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <div className="flex items-center space-x-4">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
              <Badge variant={getStatusBadgeVariant(status)}>
                {status}
              </Badge>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateJobMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateJobMutation.isPending ? 'Updating...' : 'Update Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 