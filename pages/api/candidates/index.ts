import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import formidable, { File } from 'formidable';
import fs from 'fs';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function validateUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', status: 404 };
  }

  return { user: profile };
}

async function handleFileUpload(file: File): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.originalFilename}`;
    const filePath = `resumes/${fileName}`;
    
    console.log('Starting file upload:', { fileName, filePath });
    
    // Read file content
    const fileContent = fs.readFileSync(file.filepath);
    console.log('File read successfully, size:', fileContent.length);
    
    // Upload to Supabase Storage (no authentication needed for MVP)
    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, fileContent, {
        contentType: file.mimetype || 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    console.log('File uploaded to storage successfully');

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userValidation = await validateUser(req);
  if ('error' in userValidation) {
    return res.status(userValidation.status).json({ success: false, error: userValidation.error });
  }

  const { user } = userValidation;

  // Only HR can access candidates
  if (user.role !== 'HR') {
    return res.status(403).json({ success: false, error: 'HR access required' });
  }

  if (req.method === 'GET') {
    try {
      const { data: candidates, error } = await supabase
        .from('candidates')
        .select(`
          *,
          jobs:job_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch candidates' });
      }

      res.status(200).json(candidates);
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }

  } else if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir: '/tmp',
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
      });

      const [fields, files] = await form.parse(req);
      
      // Extract form data
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
      const cover_letter = Array.isArray(fields.cover_letter) ? fields.cover_letter[0] : fields.cover_letter;
      const linkedin = Array.isArray(fields.linkedin) ? fields.linkedin[0] : fields.linkedin;
      const job_id = Array.isArray(fields.job_id) ? fields.job_id[0] : fields.job_id;

      console.log('Form data received:', { name, email, phone, linkedin, job_id, hasResume: !!files.resume });

      // Validation
      if (!name || !email) {
        console.log('Validation failed: Missing name or email');
        return res.status(400).json({ success: false, error: 'Name and email are required' });
      }

      // Handle resume upload
      let resume_url = null;
      if (files.resume) {
        console.log('Processing resume upload...');
        const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume;
        
        console.log('Resume file details:', {
          name: resumeFile.originalFilename,
          size: resumeFile.size,
          type: resumeFile.mimetype
        });

        // Check file type
        if (!resumeFile.mimetype?.includes('pdf')) {
          console.log('File type validation failed:', resumeFile.mimetype);
          return res.status(400).json({ success: false, error: 'Resume must be a PDF file' });
        }

        resume_url = await handleFileUpload(resumeFile);
        if (!resume_url) {
          console.log('File upload failed');
          return res.status(500).json({ success: false, error: 'Failed to upload resume' });
        }
        console.log('Resume uploaded successfully:', resume_url);
      }

      console.log('Inserting candidate into database...');
      // Insert candidate into database
      const { data: candidate, error } = await supabase
        .from('candidates')
        .insert({
          name,
          email,
          phone: phone || null,
          resume_url,
          cover_letter: cover_letter || null,
          linkedin: linkedin || null,
          job_id: job_id ? parseInt(job_id) : null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, error: `Database error: ${error.message}` });
      }

      console.log('Candidate created successfully:', candidate.id);
      res.status(201).json({ success: true, candidate });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }

  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
} 