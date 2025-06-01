import pdf2pic from 'pdf2pic';
import fs from 'fs';
import path from 'path';

/**
 * Convert PDF buffer to base64 image for Gemini vision processing
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Original file name for logging
 * @returns {Promise<Object>} Image object for Gemini API
 */
export async function convertPdfToImage(pdfBuffer, fileName = 'unknown') {
  try {
    console.log(`Converting PDF to image: ${fileName}`);

    // Create pdf2pic instance with options
    const converter = pdf2pic.fromBuffer(pdfBuffer, {
      density: 100,           // DPI
      saveFilename: "page",   // Output filename prefix
      savePath: "/tmp",       // Temporary directory
      format: "png",          // Output format
      width: 800,             // Image width
      height: 1000            // Image height (approximate for A4)
    });

    // Convert first page only
    const pageInfo = await converter(1, { responseType: 'image' });
    
    if (!pageInfo) {
      throw new Error('Failed to convert PDF page');
    }

    // Read the converted image file
    const imagePath = pageInfo.path;
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Clean up temporary file
    try {
      fs.unlinkSync(imagePath);
    } catch (cleanupError) {
      console.warn(`Failed to cleanup temp file: ${imagePath}`, cleanupError);
    }

    console.log(`Successfully converted PDF to image: ${fileName}`);

    // Return format expected by Gemini API
    return {
      inlineData: {
        data: base64Image,
        mimeType: 'image/png'
      }
    };

  } catch (error) {
    console.error(`PDF conversion failed for ${fileName}:`, error);
    throw new Error(`Failed to convert PDF to image: ${error.message}`);
  }
}

/**
 * Convert multiple PDF buffers to images
 * @param {Array} pdfData - Array of objects with {buffer, fileName}
 * @returns {Promise<Array>} Array of image objects for Gemini API
 */
export async function convertMultiplePdfsToImages(pdfData) {
  try {
    console.log(`Converting ${pdfData.length} PDFs to images`);
    
    const images = [];
    
    for (let i = 0; i < pdfData.length; i++) {
      const { buffer, fileName } = pdfData[i];
      console.log(`Processing PDF ${i + 1}/${pdfData.length}: ${fileName}`);
      
      const image = await convertPdfToImage(buffer, fileName);
      images.push(image);
    }
    
    console.log(`Successfully converted ${images.length} PDFs to images`);
    return images;
    
  } catch (error) {
    console.error('Multiple PDF conversion failed:', error);
    throw error;
  }
}

/**
 * Download PDF from URL and convert to image
 * @param {string} url - PDF URL (from Supabase Storage)
 * @param {string} fileName - File name for logging
 * @returns {Promise<Object>} Image object for Gemini API
 */
export async function downloadAndConvertPdf(url, fileName = 'unknown') {
  try {
    console.log(`Downloading and converting PDF from URL: ${fileName}`);
    
    // Download PDF from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Downloaded PDF (${buffer.length} bytes): ${fileName}`);
    
    // Convert to image
    return await convertPdfToImage(buffer, fileName);
    
  } catch (error) {
    console.error(`Failed to download and convert PDF ${fileName}:`, error);
    throw error;
  }
}

/**
 * Download and convert multiple PDFs from URLs
 * @param {Array} urlData - Array of objects with {url, fileName}
 * @returns {Promise<Array>} Array of image objects for Gemini API
 */
export async function downloadAndConvertMultiplePdfs(urlData) {
  try {
    console.log(`Downloading and converting ${urlData.length} PDFs`);
    
    const images = [];
    
    for (let i = 0; i < urlData.length; i++) {
      const { url, fileName } = urlData[i];
      console.log(`Processing PDF ${i + 1}/${urlData.length}: ${fileName}`);
      
      const image = await downloadAndConvertPdf(url, fileName);
      images.push(image);
    }
    
    console.log(`Successfully processed ${images.length} PDFs`);
    return images;
    
  } catch (error) {
    console.error('Multiple PDF download and conversion failed:', error);
    throw error;
  }
} 