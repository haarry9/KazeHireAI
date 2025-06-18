import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { ChatSummaryResult, Candidate } from '../../../../types';

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

// Build prompt for chat summarization
function buildChatSummarizationPrompt(transcript: string) {
  return `You are an expert HR manager tasked with extracting key information from a chat transcript between an HR representative and a job candidate.

Chat Transcript:
${transcript}

Instructions:
1. Extract availability dates (start_date and end_date) in YYYY-MM-DD format
2. Extract salary expectations (min_salary and max_salary) as numeric values
3. Extract interest level (1-5 scale, where 1 = very low interest, 5 = very high interest)
4. Provide a brief summary of the candidate's profile and key points

If any information is not mentioned or unclear, use null for that field.

Respond with ONLY this JSON structure:
{
  "start_date": "YYYY-MM-DD" or null,
  "end_date": "YYYY-MM-DD" or null,
  "min_salary": number or null,
  "max_salary": number or null,
  "interest_level": number (1-5) or null,
  "summary_text": "string"
}`;
}

// Call Gemini AI for chat summarization
async function callGeminiForChatSummary(transcript: string) {
  try {
    console.log('Calling Gemini AI for chat summarization...');
    console.log('Transcript length:', transcript.length);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = buildChatSummarizationPrompt(transcript);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1000
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
    let parsedResponse: ChatSummaryResult;
    try {
      parsedResponse = JSON.parse(responseText) as ChatSummaryResult;
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

    return parsedResponse;
  } catch (error) {
    console.error('Gemini AI call failed:', error);
    throw error;
  }
}

// Log AI interaction (optional)
async function logAIInteraction(taskType: string, prompt: string, result: ChatSummaryResult | null, status: string) {
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
    return res.status(405).json({ error: "Method not allowed" });
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
    const { transcript } = req.body;

    // Validate input
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Chat transcript is required' });
    }

    // Check if candidate exists and user has access
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (candidateError || !candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    console.log(`Processing chat summarization for candidate ${id}...`);

    // Call Gemini AI for chat summarization
    let aiResponse;
    const prompt = buildChatSummarizationPrompt(transcript);
    
    try {
      aiResponse = await callGeminiForChatSummary(transcript);
      await logAIInteraction('chat_summarization', prompt, aiResponse, 'Success');
    } catch (aiError) {
      console.error('AI call failed:', aiError);
      await logAIInteraction('chat_summarization', prompt, null, 'Failure');
      return res.status(422).json({ success: false, error: 'AI processing failed. Please try again.' });
    }

    // Prepare update data, ensuring proper data types
    const updateData: Partial<Candidate> = {};
    
    if (aiResponse.start_date) {
      updateData.start_date = aiResponse.start_date;
    }
    if (aiResponse.end_date) {
      updateData.end_date = aiResponse.end_date;
    }
    if (aiResponse.min_salary !== null && aiResponse.min_salary !== undefined) {
      updateData.min_salary = Number(aiResponse.min_salary);
    }
    if (aiResponse.max_salary !== null && aiResponse.max_salary !== undefined) {
      updateData.max_salary = Number(aiResponse.max_salary);
    }
    if (aiResponse.interest_level !== null && aiResponse.interest_level !== undefined) {
      updateData.interest_level = Number(aiResponse.interest_level);
    }
    if (aiResponse.summary_text) {
      updateData.summary_text = aiResponse.summary_text;
    }

    // Update candidate with extracted information
    const { data: updatedCandidate, error: updateError } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update candidate information' });
    }

    console.log(`Successfully processed chat summarization for candidate ${id}`);

    return res.status(200).json({
      success: true,
      candidate: updatedCandidate,
      extracted_data: {
        start_date: aiResponse.start_date,
        end_date: aiResponse.end_date,
        min_salary: aiResponse.min_salary,
        max_salary: aiResponse.max_salary,
        interest_level: aiResponse.interest_level,
        summary_text: aiResponse.summary_text
      }
    });

  } catch (error) {
    console.error('Unexpected error in chat summarization:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 