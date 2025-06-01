import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { validateUser } from '../../../lib/auth';
import { callGeminiForResumeMatch, buildManualUploadPrompt, logAIInteraction } from '../../../utils/ai';
import { convertMultiplePdfsToImages } from '../../../utils/pdf-converter';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Validate user and check role
    const userValidation = await validateUser(req);
    if (!userValidation.isValid) {
      return res.status(401).json({ success: false, error: userValidation.error });
    }

    const { user } = userValidation;
    if (user.role !== 'HR') {
      return res.status(403).json({ success: false, error: 'Access denied. HR role required.' });
    }

    // Parse multipart form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5, // Maximum 5 resume files
    });

    let fields, files;
    try {
      [fields, files] = await form.parse(req);
    } catch (parseError) {
      console.error('Form parsing error:', parseError);
      return res.status(400).json({ success: false, error: 'Failed to parse form data' });
    }

    // Extract job description
    const jobDescription = Array.isArray(fields.job_description) ? fields.job_description[0] : fields.job_description;
    
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json({ success: false, error: 'Job description is required' });
    }

    // Extract resume files
    const resumeFiles = files.resumes;
    if (!resumeFiles) {
      return res.status(400).json({ success: false, error: 'At least one resume file is required' });
    }

    // Normalize to array
    const resumeArray = Array.isArray(resumeFiles) ? resumeFiles : [resumeFiles];
    
    if (resumeArray.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one resume file is required' });
    }

    if (resumeArray.length > 5) {
      return res.status(400).json({ success: false, error: 'Maximum 5 resume files allowed' });
    }

    console.log(`Processing manual upload: ${resumeArray.length} resumes, job description length: ${jobDescription.length}`);

    // Validate file types and prepare data
    const pdfData = [];
    for (let i = 0; i < resumeArray.length; i++) {
      const file = resumeArray[i];
      
      // Check file type
      if (!file.mimetype?.includes('pdf')) {
        return res.status(400).json({ 
          success: false, 
          error: `File ${file.originalFilename} is not a PDF` 
        });
      }

      // Read file buffer
      try {
        const buffer = fs.readFileSync(file.filepath);
        pdfData.push({
          buffer,
          fileName: file.originalFilename || `resume_${i + 1}.pdf`
        });

        // Clean up temporary file
        fs.unlinkSync(file.filepath);
      } catch (fileError) {
        console.error(`Failed to read file ${file.originalFilename}:`, fileError);
        return res.status(500).json({ 
          success: false, 
          error: `Failed to process file ${file.originalFilename}` 
        });
      }
    }

    // Convert PDFs to images
    let images;
    try {
      images = await convertMultiplePdfsToImages(pdfData);
    } catch (conversionError) {
      console.error('PDF conversion failed:', conversionError);
      await logAIInteraction('resume_match_manual_upload', 'PDF conversion failed', null, 'Failure');
      return res.status(422).json({ success: false, error: 'Failed to process resume files' });
    }

    // Build prompt
    const fileNames = pdfData.map(data => data.fileName);
    const prompt = buildManualUploadPrompt(jobDescription, fileNames);

    // Call Gemini AI
    let aiResponse;
    try {
      aiResponse = await callGeminiForResumeMatch(prompt, images);
      await logAIInteraction('resume_match_manual_upload', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logAIInteraction('resume_match_manual_upload', prompt, null, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed' });
    }

    // Validate response structure
    if (!aiResponse.top_candidates || !Array.isArray(aiResponse.top_candidates)) {
      console.error('Invalid AI response structure:', aiResponse);
      return res.status(422).json({ success: false, error: 'Invalid AI response' });
    }

    // Map file indices back to actual file names for frontend
    const mappedCandidates = aiResponse.top_candidates.map(candidate => {
      // Extract file index from candidate_id (e.g., "file_1" -> 0)
      const fileIndex = parseInt(candidate.candidate_id.replace('file_', '')) - 1;
      const actualFileName = fileNames[fileIndex] || candidate.candidate_name;
      
      return {
        ...candidate,
        candidate_name: actualFileName,
        original_file_name: actualFileName
      };
    });

    console.log(`Successfully processed manual upload matching: ${mappedCandidates.length} candidates returned`);

    return res.status(200).json({
      success: true,
      top_candidates: mappedCandidates,
      job_description: jobDescription.substring(0, 100) + '...', // Preview only
      files_processed: fileNames.length
    });

  } catch (error) {
    console.error('Unexpected error in manual upload matching:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 