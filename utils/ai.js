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
      model: 'gemini-2.0-flash-001',
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

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string", 
      "fit_score": number (1-10),
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"] or [],
      "reasoning": "1-2 sentence explanation of ranking"
    }
  ]
}

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

Respond with ONLY this JSON structure:
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "candidate_name": "string",
      "fit_score": number (1-10),
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"] or [],
      "reasoning": "1-2 sentence explanation of ranking"
    }
  ]
}

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