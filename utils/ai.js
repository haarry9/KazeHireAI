import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Call Gemini AI for resume matching
 * @param {string} prompt - The text prompt
 * @param {Array} images - Array of image objects for vision processing
 * @returns {Promise<Object>} AI response
 */
export async function callGeminiForResumeMatch(prompt, images = []) {
  try {
    console.log('Calling Gemini AI for resume matching...');
    console.log('Prompt length:', prompt.length);
    console.log('Number of images:', images.length);

    // Build contents array with prompt and images
    const contents = [prompt, ...images];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp:free',
      contents: contents,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2000
      }
    });

    console.log('Gemini AI response received');
    
    // Extract text from response
    let responseText = response.text;
    console.log('Response text:', responseText);

    // Clean up markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    console.log('Cleaned response text:', responseText);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Original response text:', response.text);
      console.error('Cleaned response text:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (!parsedResponse.top_candidates || !Array.isArray(parsedResponse.top_candidates)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    // Validate each candidate has required fields including technical_skills
    for (let i = 0; i < parsedResponse.top_candidates.length; i++) {
      const candidate = parsedResponse.top_candidates[i];
      if (!candidate.candidate_id || !candidate.candidate_name || !candidate.fit_score) {
        console.error(`Invalid candidate structure at index ${i}:`, candidate);
        throw new Error(`Invalid candidate structure from AI at index ${i}`);
      }
      
      // Ensure arrays exist and technical_skills is present
      if (!Array.isArray(candidate.strengths)) candidate.strengths = [];
      if (!Array.isArray(candidate.concerns)) candidate.concerns = [];
      if (!Array.isArray(candidate.technical_skills)) candidate.technical_skills = [];
      
      // Warn if concerns is empty (since we specifically requested concerns for all candidates)
      if (candidate.concerns.length === 0) {
        console.warn(`Candidate ${candidate.candidate_name} has no concerns listed - AI may not have followed instructions properly`);
      }
    }

    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

/**
 * Call Gemini AI with text only (no images)
 * @param {string} prompt - The text prompt
 * @returns {Promise<Object>} AI response
 */
export async function callGeminiWithText(prompt) {
  try {
    console.log('Calling Gemini AI with text-only prompt...');
    console.log('Prompt length:', prompt.length);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp:free',
      contents: [prompt],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2000
      }
    });

    console.log('Gemini AI response received');
    
    // Extract text from response
    let responseText = response.text;
    console.log('Response text:', responseText);

    // Clean up markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    console.log('Cleaned response text:', responseText);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Original response text:', response.text);
      console.error('Cleaned response text:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (!parsedResponse.top_candidates || !Array.isArray(parsedResponse.top_candidates)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    // Validate each candidate has required fields including technical_skills
    for (let i = 0; i < parsedResponse.top_candidates.length; i++) {
      const candidate = parsedResponse.top_candidates[i];
      if (!candidate.candidate_id || !candidate.candidate_name || !candidate.fit_score) {
        console.error(`Invalid candidate structure at index ${i}:`, candidate);
        throw new Error(`Invalid candidate structure from AI at index ${i}`);
      }
      
      // Ensure arrays exist and technical_skills is present
      if (!Array.isArray(candidate.strengths)) candidate.strengths = [];
      if (!Array.isArray(candidate.concerns)) candidate.concerns = [];
      if (!Array.isArray(candidate.technical_skills)) candidate.technical_skills = [];
      
      // Warn if concerns is empty (since we specifically requested concerns for all candidates)
      if (candidate.concerns.length === 0) {
        console.warn(`Candidate ${candidate.candidate_name} has no concerns listed - AI may not have followed instructions properly`);
      }
    }

    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

/**
 * Call Gemini AI for text-based resume matching
 * @param {string} prompt - The text prompt
 * @returns {Promise<Object>} AI response
 */
export async function callGeminiForTextResumeMatch(prompt) {
  try {
    console.log('Calling Gemini AI for text-based resume matching...');
    console.log('Prompt length:', prompt.length);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp:free',
      contents: [prompt],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2000
      }
    });

    console.log('Gemini AI response received');
    
    // Extract text from response
    let responseText = response.text;
    console.log('Response text:', responseText);

    // Clean up markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    console.log('Cleaned response text:', responseText);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Original response text:', response.text);
      console.error('Cleaned response text:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (!parsedResponse.top_candidates || !Array.isArray(parsedResponse.top_candidates)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    // Validate each candidate has required fields including technical_skills
    for (let i = 0; i < parsedResponse.top_candidates.length; i++) {
      const candidate = parsedResponse.top_candidates[i];
      if (!candidate.candidate_id || !candidate.candidate_name || !candidate.fit_score) {
        console.error(`Invalid candidate structure at index ${i}:`, candidate);
        throw new Error(`Invalid candidate structure from AI at index ${i}`);
      }
      
      // Ensure arrays exist and technical_skills is present
      if (!Array.isArray(candidate.strengths)) candidate.strengths = [];
      if (!Array.isArray(candidate.concerns)) candidate.concerns = [];
      if (!Array.isArray(candidate.technical_skills)) candidate.technical_skills = [];
      
      // Warn if concerns is empty (since we specifically requested concerns for all candidates)
      if (candidate.concerns.length === 0) {
        console.warn(`Candidate ${candidate.candidate_name} has no concerns listed - AI may not have followed instructions properly`);
      }
    }

    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

/**
 * Build prompt for existing pool matching
 * @param {Object} job - Job object with title and description
 * @param {Array} candidates - Array of candidate objects with IDs
 * @param {string} comments - Optional additional comments
 * @returns {string} Formatted prompt
 */
export function buildExistingPoolPrompt(job, candidates, comments = '') {
  const candidateList = candidates.map((candidate, index) => 
    `- Candidate ID: ${candidate.id}, Name: ${candidate.name}, Resume: [image${index + 1}]`
  ).join('\n');

  let prompt = `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Title: ${job.title}
Job Description: ${job.description}

Candidate Data:
${candidateList}

Instructions:
1. Analyze each resume image carefully
2. Rank candidates based on their fit for the job requirements
3. Provide exactly the top 5 candidates (or all if fewer than 5)
4. Use the exact Candidate IDs provided above in your response
5. For EVERY candidate, provide at least 1-2 concerns (even if minor) - do NOT leave concerns empty
6. Extract technical skills separately from general strengths
7. Be specific and detailed in your analysis

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string", 
      "fit_score": number (1-10),
      "strengths": ["general strength1", "general strength2", "general strength3"],
      "concerns": ["concern1", "concern2", "concern3"],
      "technical_skills": ["technical skill1", "technical skill2", "technical skill3"],
      "reasoning": "2-3 sentence explanation of ranking and fit assessment"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Every candidate MUST have at least 1-2 concerns listed (never empty array)
- Technical skills should be programming languages, frameworks, tools, technologies only
- Strengths should be soft skills, experience level, domain knowledge, etc.
- Be thorough in analysis - provide meaningful insights

Order candidates from best to worst fit. Include up to 5 candidates.`;

  if (comments && comments.trim()) {
    prompt += `\n\nAdditional Comments: ${comments}`;
  }

  return prompt;
}

/**
 * Build prompt for existing pool matching with text content
 * @param {Object} job - Job object with title and description
 * @param {Array} candidateTexts - Array of objects with {id, name, text}
 * @param {string} comments - Optional additional comments
 * @returns {string} Formatted prompt
 */
export function buildExistingPoolTextPrompt(job, candidateTexts, comments = '') {
  const candidateList = candidateTexts.map((candidate, index) => 
    `- Candidate ID: ${candidate.id}, Name: ${candidate.name}
Resume Content: ${candidate.text.substring(0, 2000)}...
`
  ).join('\n');

  let prompt = `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Title: ${job.title}
Job Description: ${job.description}

Candidate Data:
${candidateList}

Instructions:
1. Analyze each resume text content carefully
2. Rank candidates based on their fit for the job requirements
3. Provide exactly the top 5 candidates (or all if fewer than 5)
4. Use the exact Candidate IDs provided above in your response
5. For EVERY candidate, provide at least 1-2 concerns (even if minor) - do NOT leave concerns empty
6. Extract technical skills separately from general strengths
7. Be specific and detailed in your analysis

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string", 
      "fit_score": number (1-10),
      "strengths": ["general strength1", "general strength2", "general strength3"],
      "concerns": ["concern1", "concern2", "concern3"],
      "technical_skills": ["technical skill1", "technical skill2", "technical skill3"],
      "reasoning": "2-3 sentence explanation of ranking and fit assessment"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Every candidate MUST have at least 1-2 concerns listed (never empty array)
- Technical skills should be programming languages, frameworks, tools, technologies only
- Strengths should be soft skills, experience level, domain knowledge, etc.
- Be thorough in analysis - provide meaningful insights

Order candidates from best to worst fit. Include up to 5 candidates.`;

  if (comments && comments.trim()) {
    prompt += `\n\nAdditional Comments: ${comments}`;
  }

  return prompt;
}

/**
 * Build prompt for manual upload matching
 * @param {string} jobDescription - Job description text
 * @param {Array} fileNames - Array of uploaded file names
 * @returns {string} Formatted prompt
 */
export function buildManualUploadPrompt(jobDescription, fileNames) {
  const candidateList = fileNames.map((fileName, index) => 
    `- Candidate ID: file_${index + 1}, Name: ${fileName}, Resume: [image${index + 1}]`
  ).join('\n');

  return `You are an expert HR manager tasked with ranking candidates based on their resumes and a job description.

Job Description: ${jobDescription}

Candidate Data:
${candidateList}

Instructions:
1. Analyze each resume image carefully
2. Rank ALL candidates based on their fit for the job requirements
3. If there are 5 or fewer candidates, return ALL of them sorted by fit score
4. If there are more than 5 candidates, return only the TOP 5
5. Use the exact Candidate IDs provided above in your response
6. For EVERY candidate, provide at least 1-2 concerns (even if minor) - do NOT leave concerns empty
7. Extract technical skills separately from general strengths
8. Be specific and detailed in your analysis

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string",
      "fit_score": number (1-10),
      "strengths": ["general strength1", "general strength2", "general strength3"],
      "concerns": ["concern1", "concern2", "concern3"],
      "technical_skills": ["technical skill1", "technical skill2", "technical skill3"],
      "reasoning": "2-3 sentence explanation of ranking and fit assessment"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Every candidate MUST have at least 1-2 concerns listed (never empty array)
- Technical skills should be programming languages, frameworks, tools, technologies only
- Strengths should be soft skills, experience level, domain knowledge, etc.
- Be thorough in analysis - provide meaningful insights

Order candidates from best to worst fit. Return ${fileNames.length <= 5 ? 'ALL candidates' : 'top 5 candidates'}.`;
}

/**
 * Log AI interaction to database (optional)
 * @param {string} taskType - Type of AI task
 * @param {string} prompt - Prompt sent to AI
 * @param {Object} result - AI response
 * @param {string} status - Success/Failure status
 */
export async function logAIInteraction(taskType, prompt, result, status) {
  try {
    // For MVP, we'll just console log. In production, save to ai_logs table
    console.log('AI Interaction Log:', {
      taskType,
      promptLength: prompt.length,
      status,
      resultType: typeof result
    });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
} 