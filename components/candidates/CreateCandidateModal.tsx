import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Job } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface CreateCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCandidateCreated?: () => void;
}

export default function CreateCandidateModal({ 
  open, 
  onOpenChange, 
  onCandidateCreated 
}: CreateCandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    cover_letter: '',
    job_id: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open]);

  const fetchJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setJobs(result.data);
        } else {
          setJobs(Array.isArray(result) ? result : []);
        }
      } else {
        console.error('Failed to fetch jobs:', response.status);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('pdf')) {
        toast.error('Please select a PDF file for the resume');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume file must be smaller than 10MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      cover_letter: '',
      job_id: '',
    });
    setResumeFile(null);
    
    // Reset file input
    const fileInput = document.getElementById('resume-modal') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        toast.error('Name and email are required');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.linkedin) data.append('linkedin', formData.linkedin);
      if (formData.cover_letter) data.append('cover_letter', formData.cover_letter);
      if (formData.job_id) data.append('job_id', formData.job_id);
      if (resumeFile) data.append('resume', resumeFile);

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create candidate');
      }

      toast.success('Candidate created successfully!');
      resetForm();
      onOpenChange(false);
      onCandidateCreated?.();

    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Candidate
          </DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resume-modal" className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF)
              </Label>
              <Input
                id="resume-modal"
                name="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full"
              />
              {resumeFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="job_id" className="block text-sm font-medium text-gray-700 mb-2">
                Job Position
              </Label>
              <select
                id="job_id"
                name="job_id"
                value={formData.job_id}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </Label>
              <Textarea
                id="cover_letter"
                name="cover_letter"
                rows={4}
                value={formData.cover_letter}
                onChange={handleInputChange}
                placeholder="Optional cover letter or additional notes..."
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Create Candidate'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 