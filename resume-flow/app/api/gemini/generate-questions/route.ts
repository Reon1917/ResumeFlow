import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '../../../../lib/gemini';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

interface GenerateQuestionsRequest {
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  resumeContent?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      if (!decodedToken.uid) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error('Auth verification error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Token verification failed' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: GenerateQuestionsRequest = await request.json();
    
    if (!body.jobTitle || !body.industry || !body.experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, industry, experienceLevel' },
        { status: 400 }
      );
    }

    // Validate experience level
    const validExperienceLevels = ['entry-level', 'mid-level', 'senior-level', 'executive'];
    if (!validExperienceLevels.includes(body.experienceLevel.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid experience level. Must be one of: entry-level, mid-level, senior-level, executive' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (body.jobTitle.length > 100 || body.industry.length > 100) {
      return NextResponse.json(
        { error: 'Job title and industry must be under 100 characters' },
        { status: 400 }
      );
    }

    if (body.resumeContent && body.resumeContent.length > 50000) {
      return NextResponse.json(
        { error: 'Resume content too long (max 50,000 characters)' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedJobTitle = body.jobTitle.trim();
    const sanitizedIndustry = body.industry.trim();
    const sanitizedExperienceLevel = body.experienceLevel.trim();
    const sanitizedResumeContent = body.resumeContent?.trim();

    // Call Gemini API
    const questionsResult = await generateInterviewQuestions(
      sanitizedJobTitle,
      sanitizedIndustry,
      sanitizedExperienceLevel,
      sanitizedResumeContent
    );

    // Validate the response structure
    if (!questionsResult.technical || !questionsResult.behavioral || !questionsResult.situational) {
      throw new Error('Invalid response structure from AI service');
    }

    return NextResponse.json({
      success: true,
      data: questionsResult
    });

  } catch (error) {
    console.error('Interview questions generation error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Failed to generate interview questions')) {
        return NextResponse.json(
          { error: 'AI question generation service temporarily unavailable. Please try again.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Service temporarily at capacity. Please try again in a few minutes.' },
          { status: 429 }
        );
      }

      if (error.message.includes('Invalid response structure')) {
        return NextResponse.json(
          { error: 'AI service returned invalid data. Please try again.' },
          { status: 502 }
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