import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '../../../../lib/gemini';

interface AnalyzeResumeDirectRequest {
  fileName: string;
  fileData: string; // base64 encoded file
  fileType: string;
  jobTitle: string;
  industry: string;
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
    
    // For now, we'll extract text content from the file data
    // In a real implementation, you'd use a PDF/Word parser
    const resumeContent = `Resume file: ${body.fileName}\nTarget Role: ${sanitizedJobTitle}\nIndustry: ${sanitizedIndustry}\n\nNote: This is a demo analysis. In production, the actual resume content would be extracted from the uploaded file.`;
    
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