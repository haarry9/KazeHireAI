import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Job, JobStatus } from '../../lib/supabase';

interface JobViewModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobViewModal({ job, open, onOpenChange }: JobViewModalProps) {
  if (!job) return null;

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Paused': return 'secondary';
      case 'Closed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Job Details
            </DialogTitle>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Title and Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
              <Badge variant={getStatusBadgeVariant(job.status)}>
                {job.status}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500">
              Created on {formatDate(job.created_at)}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Description</h3>
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-500">Job ID:</span>
              <p className="text-sm text-gray-900">{job.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <p className="text-sm text-gray-900">{job.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 