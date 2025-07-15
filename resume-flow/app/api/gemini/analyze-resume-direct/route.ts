import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '../../../../lib/gemini';

const PDFParser = require('pdf2json');

interface AnalyzeResumeDirectRequest {
  fileName: string;
  fileData: string; // base64 encoded file
  fileType: string;
  jobTitle: string;
  industry: string;
}

// Helper function to extract text using pdf2json
async function extractTextWithPdf2Json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('❌ pdf2json error:', errData);
      reject(new Error('Failed to parse PDF with pdf2json'));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let text = '';
        
        // Extract text from all pages
        if (pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const textObj of page.Texts) {
                if (textObj.R) {
                  for (const run of textObj.R) {
                    if (run.T) {
                      text += decodeURIComponent(run.T) + ' ';
                    }
                  }
                }
              }
            }
            text += '\n'; // Add line break between pages
          }
        }
        
        resolve(text.trim());
      } catch (error) {
        reject(error);
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: NextRequest) {
  console.log('🚀 Direct resume analysis API called (no database storage)');
  
  try {
    // Parse and validate request body
    const body: AnalyzeResumeDirectRequest = await request.json();
    console.log('📋 Request body received:', {
      fileName: body.fileName,
      fileType: body.fileType,
      jobTitle: body.jobTitle,
      industry: body.industry,
      fileDataLength: body.fileData?.length || 0
    });
    
    if (!body.fileName || !body.fileData || !body.jobTitle || !body.industry) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileData, jobTitle, industry' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(body.fileType)) {
      console.log('❌ Invalid file type:', body.fileType);
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are supported.' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (body.jobTitle.length > 100 || body.industry.length > 100) {
      console.log('❌ Input validation failed - text too long');
      return NextResponse.json(
        { error: 'Job title and industry must be under 100 characters' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedJobTitle = body.jobTitle.trim();
    const sanitizedIndustry = body.industry.trim();

    console.log('🤖 Calling Gemini API for direct resume analysis...');
    
    // Extract text content from the file data
    let resumeContent = '';
    
    try {
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(body.fileData, 'base64');
      console.log('📄 File buffer created, size:', fileBuffer.length);
      
      if (body.fileType === 'application/pdf') {
        console.log('📄 Extracting text from PDF...');
        try {
          // Use pdf2json directly since pdf-parse has issues with test file references
          console.log('🔄 Using pdf2json for PDF extraction...');
          resumeContent = await extractTextWithPdf2Json(fileBuffer);
          console.log('✅ PDF text extracted with pdf2json');
          console.log('📏 Content length:', resumeContent.length);
          
          console.log('🔍 Content preview:', resumeContent.substring(0, 200) + '...');
        } catch (pdfError) {
          console.error('❌ PDF parsing error:', pdfError);
          throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
        }
      } else if (body.fileType.includes('word') || body.fileType.includes('document')) {
        console.log('📄 Word document detected - text extraction not implemented yet');
        resumeContent = `Word document: ${body.fileName}\nTarget Role: ${sanitizedJobTitle}\nIndustry: ${sanitizedIndustry}\n\nNote: Word document text extraction is not yet implemented. Please upload a PDF file for full analysis.`;
      } else {
        throw new Error('Unsupported file type for text extraction');
      }
      
      // Validate extracted content
      if (!resumeContent.trim()) {
        console.error('❌ No text content extracted from file');
        throw new Error('No text content could be extracted from the file. The file may be corrupted or contain only images.');
      }
      
      // Limit content length to avoid token limits
      if (resumeContent.length > 50000) {
        console.log('⚠️ Resume content too long, truncating...');
        resumeContent = resumeContent.substring(0, 50000) + '\n\n[Content truncated due to length]';
      }
      
    } catch (extractionError) {
      console.error('❌ Error extracting text from file:', extractionError);
      const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown error occurred';
      return NextResponse.json(
        { error: `Failed to extract text from the uploaded file: ${errorMessage}` },
        { status: 400 }
      );
    }
    
    // Call Gemini API
    const analysisResult = await analyzeResume(
      resumeContent,
      sanitizedJobTitle,
      sanitizedIndustry
    );

    console.log('✅ Gemini API response received:', {
      overallScore: analysisResult.overallScore,
      hasRecommendations: !!analysisResult.recommendations?.length,
      hasStrengths: !!analysisResult.strengths?.length,
      hasImprovements: !!analysisResult.improvements?.length
    });

    console.log('✅ Direct resume analysis completed successfully - no database storage needed');

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Resume analyzed successfully (results not stored)'
    });

  } catch (error) {
    console.error('❌ Direct resume analysis error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      console.log('🔍 Error details:', {
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
      
      if (error.message.includes('Failed to analyze resume')) {
        return NextResponse.json(
          { error: 'AI analysis service temporarily unavailable. Please try again.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Service temporarily at capacity. Please try again in a few minutes.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}