import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { BiasCheckResult } from '../../../../types';

// Simple auth validation function
async function validateUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { isValid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { isValid: false, error: 'Invalid token' };
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { isValid: false, error: 'User profile not found' };
  }

  return { isValid: true, user: profile };
}

// Build prompt for bias detection
function buildBiasDetectionPrompt(feedback: string) {
  return `You are an expert HR manager tasked with detecting bias in interview feedback. 

Analyze the following interview feedback for any biased language or terms that could indicate discrimination based on:
- Gender, age, race, ethnicity, religion
- Physical appearance, accent, or cultural background
- Personal characteristics unrelated to job performance
- Subjective judgments about personality that could mask bias

Feedback to analyze: "${feedback}"

Respond with ONLY this JSON structure:
{
  "flags": [
    {
      "term": "exact biased word or phrase",
      "justification": "brief explanation of why this could indicate bias"
    }
  ]
}

If no bias is detected, return: {"flags": []}

Be thorough but only flag terms that could reasonably indicate bias or discrimination.`;
}

// Call Gemini AI for bias detection
async function callGeminiForBiasDetection(feedback: string) {
  try {
    console.log('Calling Gemini AI for bias detection...');
    console.log('Feedback length:', feedback.length);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = buildBiasDetectionPrompt(feedback);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    console.log('Gemini AI response received');
    
    // Extract text from response - using .text property, not .text() method
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
    let parsedResponse: BiasCheckResult;
    try {
      parsedResponse = JSON.parse(responseText) as BiasCheckResult;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Original response text:', response.text);
      console.error('Cleaned response text:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (typeof parsedResponse !== 'object' || parsedResponse === null) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    // Ensure flags array exists
    if (!Array.isArray(parsedResponse.flags)) {
      console.error('Invalid flags array in response:', parsedResponse);
      throw new Error('Invalid flags array in AI response');
    }

    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

// Log AI interaction (optional)
async function logAIInteraction(taskType: string, prompt: string, result: BiasCheckResult | null, status: string) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Validate authentication and role
  const { isValid, user, error: authError } = await validateUser(req);
  if (!isValid) {
    return res.status(401).json({ success: false, error: authError });
  }

  // Check if user is HR
  if (user.role !== 'HR') {
    return res.status(403).json({ success: false, error: 'Access denied. HR role required.' });
  }

  try {
    // Fetch the interview and its feedback
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id, raw_feedback')
      .eq('id', id)
      .single();

    if (interviewError || !interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    if (!interview.raw_feedback) {
      return res.status(400).json({ success: false, error: 'No feedback available for bias check' });
    }

    console.log(`Processing bias detection for interview ${id}...`);

    // Call Gemini AI for bias detection
    let aiResponse;
    const prompt = buildBiasDetectionPrompt(interview.raw_feedback);
    
    try {
      aiResponse = await callGeminiForBiasDetection(interview.raw_feedback);
      await logAIInteraction('bias_detection', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logAIInteraction('bias_detection', prompt, null, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed. Please try again.' });
    }

    console.log(`Successfully processed bias detection for interview ${id}`);

    return res.status(200).json({ 
      success: true, 
      flags: aiResponse.flags || [],
      interview_id: id,
      feedback: interview.raw_feedback
    });

  } catch (error) {
    console.error('Unexpected error in bias detection:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 