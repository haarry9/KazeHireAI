import pdfParse from 'pdf-parse';

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Original file name for logging
 * @returns {Promise<string>} Extracted text content
 */
export async function extractTextFromPdf(pdfBuffer, fileName = 'unknown') {
  try {
    console.log(`Extracting text from PDF: ${fileName}`);
    
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text.trim();
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('PDF appears to be empty or contains insufficient text');
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters from ${fileName}`);
    return extractedText;
  } catch (error) {
    console.error(`PDF text extraction failed for ${fileName}:`, error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Download PDF from URL and extract text
 * @param {string} url - PDF URL (from Supabase Storage)
 * @param {string} fileName - File name for logging
 * @returns {Promise<string>} Extracted text content
 */
export async function downloadAndExtractText(url, fileName = 'unknown') {
  try {
    console.log(`Downloading and extracting text from PDF: ${fileName}`);
    
    // Download PDF from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Downloaded PDF (${buffer.length} bytes): ${fileName}`);
    
    // Extract text
    return await extractTextFromPdf(buffer, fileName);
    
  } catch (error) {
    console.error(`Failed to download and extract text from PDF ${fileName}:`, error);
    throw error;
  }
}

/**
 * Download and extract text from multiple PDFs
 * @param {Array} urlData - Array of objects with {url, fileName}
 * @returns {Promise<Array>} Array of objects with {fileName, text}
 */
export async function downloadAndExtractMultipleTexts(urlData) {
  try {
    console.log(`Downloading and extracting text from ${urlData.length} PDFs`);
    
    const results = [];
    
    for (let i = 0; i < urlData.length; i++) {
      const { url, fileName } = urlData[i];
      console.log(`Processing PDF ${i + 1}/${urlData.length}: ${fileName}`);
      
      try {
        const text = await downloadAndExtractText(url, fileName);
        results.push({ fileName, text });
      } catch (error) {
        console.error(`Failed to process ${fileName}, skipping:`, error);
        // Continue with other files instead of failing completely
        continue;
      }
    }
    
    if (results.length === 0) {
      throw new Error('No PDF files could be processed successfully');
    }
    
    console.log(`Successfully processed ${results.length}/${urlData.length} PDFs`);
    return results;
    
  } catch (error) {
    console.error('Multiple PDF text extraction failed:', error);
    throw error;
  }
}

/**
 * Extract candidate name from resume text (simple heuristic)
 * @param {string} resumeText - Resume text content
 * @param {string} fallbackName - Fallback name if extraction fails
 * @returns {string} Extracted or fallback candidate name
 */
export function extractCandidateName(resumeText, fallbackName) {
  try {
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for name patterns in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      
      // Skip common headers/emails/phones
      if (line.toLowerCase().includes('resume') || 
          line.toLowerCase().includes('curriculum') ||
          line.includes('@') || 
          /^\+?\d[\d\s\-\(\)]+$/.test(line)) {
        continue;
      }
      
      // Look for name pattern (2-3 words, mostly letters)
      const namePattern = /^[A-Za-z\s]{2,50}$/;
      const words = line.split(/\s+/);
      
      if (words.length >= 2 && words.length <= 4 && namePattern.test(line)) {
        return line;
      }
    }
    
    return fallbackName;
  } catch (error) {
    console.error('Name extraction failed:', error);
    return fallbackName;
  }
} 