import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '../../../../lib/gemini';
import { updateResume } from '../../../../lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const { resumeId, resumeContent, jobTitle, industry } = await request.json();

    if (!resumeId || !resumeContent || !jobTitle || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Update resume status to analyzing
    await updateResume(resumeId, { status: 'analyzing' });

    // Analyze resume with Gemini
    const analysis = await analyzeResume(resumeContent, jobTitle, industry);

    // Update resume with analysis results
    await updateResume(resumeId, {
      status: 'analyzed',
      analysisScore: analysis.overallScore,
      feedback: analysis
    });

    return NextResponse.json({ 
      success: true, 
      analysis 
    });

  } catch (error: any) {
    console.error('Resume analysis error:', error);
    
    // Update resume status to error if resumeId is available
    const { resumeId } = await request.json().catch(() => ({}));
    if (resumeId) {
      await updateResume(resumeId, { status: 'error' });
    }

    return NextResponse.json(
      { error: 'Failed to analyze resume' }, 
      { status: 500 }
    );
  }
}