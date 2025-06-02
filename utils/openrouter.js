import OpenAI from 'openai';

// Initialize OpenRouter client using OpenAI SDK
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    'X-Title': 'KazeHire AI - Resume Matching System',
  },
});

/**
 * Call OpenRouter with Gemini 2.0 Flash Experimental for resume matching
 * @param {string} prompt - The text prompt for resume matching
 * @returns {Promise<Object>} AI response in expected format
 */
export async function callOpenRouterForResumeMatch(prompt) {
  try {
    console.log('Calling OpenRouter with Gemini 2.0 Flash Experimental for resume matching...');
    console.log('Prompt length:', prompt.length);

    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    console.log('OpenRouter response received');
    
    // Extract content from OpenAI-compatible response format
    const responseContent = response.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No content in OpenRouter response');
    }

    console.log('Response content:', responseContent);

    // Clean up markdown code blocks if present (same logic as original)
    let cleanedContent = responseContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    console.log('Cleaned response content:', cleanedContent);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response as JSON:', parseError);
      console.error('Original response content:', responseContent);
      console.error('Cleaned response content:', cleanedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure (same validation as original)
    if (!parsedResponse.top_candidates || !Array.isArray(parsedResponse.top_candidates)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    console.log(`OpenRouter processing successful: ${parsedResponse.top_candidates.length} candidates returned`);
    return parsedResponse;

  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    
    // Enhanced error logging for debugging
    if (error.response) {
      console.error('OpenRouter API Error Status:', error.response.status);
      console.error('OpenRouter API Error Data:', error.response.data);
    }
    
    // Provide more specific error messages based on status codes
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenRouter API key.');
    } else if (error.status === 403) {
      throw new Error('Access denied. Please check your OpenRouter subscription or model access.');
    } else if (error.status >= 500) {
      throw new Error('OpenRouter server error. Please try again later.');
    }
    
    throw error;
  }
}

/**
 * Log AI interaction for OpenRouter calls
 * @param {string} taskType - Type of AI task
 * @param {string} prompt - Prompt sent to AI
 * @param {Object} result - AI response
 * @param {string} status - Success/Failure status
 */
export async function logOpenRouterInteraction(taskType, prompt, result, status) {
  try {
    console.log('OpenRouter AI Interaction Log:', {
      taskType,
      promptLength: prompt.length,
      status,
      resultType: typeof result,
      provider: 'OpenRouter',
      model: 'google/gemini-2.0-flash-exp:free'
    });
  } catch (error) {
    console.error('Failed to log OpenRouter AI interaction:', error);
  }
}

/**
 * Call resume matching with fallback support
 * @param {string} prompt - The text prompt for resume matching
 * @param {boolean} enableFallback - Whether to fallback to original Gemini on failure
 * @returns {Promise<Object>} AI response in expected format
 */
export async function callResumeMatchWithFallback(prompt, enableFallback = false) {
  try {
    // Try OpenRouter first
    return await callOpenRouterForResumeMatch(prompt);
  } catch (error) {
    console.error('OpenRouter failed:', error.message);
    
    if (enableFallback) {
      console.log('Attempting fallback to original Gemini...');
      try {
        // Import original Gemini function dynamically
        const { callGeminiForTextResumeMatch } = await import('./ai.js');
        return await callGeminiForTextResumeMatch(prompt);
      } catch (fallbackError) {
        console.error('Fallback to Gemini also failed:', fallbackError.message);
        throw new Error(`Both OpenRouter and Gemini failed. OpenRouter: ${error.message}, Gemini: ${fallbackError.message}`);
      }
    }
    
    throw error;
  }
} 