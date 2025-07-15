import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '../../../../lib/gemini';
import { createInterviewSession } from '../../../../lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      jobTitle, 
      industry, 
      experienceLevel, 
      resumeContent 
    } = await request.json();

    if (!userId || !jobTitle || !industry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Generate interview questions with Gemini
    const questions = await generateInterviewQuestions(
      jobTitle, 
      industry, 
      experienceLevel, 
      resumeContent
    );

    // Create interview session in Firestore
    const sessionId = await createInterviewSession({
      userId,
      jobTitle,
      industry,
      experienceLevel,
      questions,
      responses: [],
      status: 'active'
    });

    return NextResponse.json({ 
      success: true, 
      sessionId,
      questions 
    });

  } catch (error: any) {
    console.error('Interview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' }, 
      { status: 500 }
    );
  }
}