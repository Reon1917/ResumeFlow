import { POST } from '../../app/api/gemini/analyze-resume/route';
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { analyzeResume } from '../../lib/gemini';

// Mock dependencies
jest.mock('firebase-admin/auth');
jest.mock('../../lib/gemini');
jest.mock('firebase-admin/app');

const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
const mockAnalyzeResume = analyzeResume as jest.MockedFunction<typeof analyzeResume>;

describe('/api/gemini/analyze-resume', () => {
  const mockAnalysisResult = {
    overallScore: 85,
    sectionScores: {
      content: 18,
      structure: 16,
      impact: 17,
      keywords: 15,
      presentation: 19
    },
    strengths: ['Strong technical skills'],
    improvements: ['Add more keywords'],
    recommendations: ['Include summary'],
    atsCompatibility: {
      score: 78,
      issues: ['Use standard headings']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase Admin Auth
    mockGetAuth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' })
    } as any);
  });

  it('successfully analyzes resume with valid request', async () => {
    mockAnalyzeResume.mockResolvedValueOnce(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockAnalysisResult);
    expect(mockAnalyzeResume).toHaveBeenCalledWith(
      'Sample resume content',
      'Software Engineer',
      'Technology'
    );
  });

  it('returns 401 when no authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized - Missing or invalid token');
  });

  it('returns 401 when token verification fails', async () => {
    mockGetAuth.mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
    } as any);

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized - Token verification failed');
  });

  it('returns 400 when required fields are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        // Missing jobTitle and industry
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: resumeContent, jobTitle, industry');
  });

  it('returns 400 when resume content is too long', async () => {
    const longContent = 'a'.repeat(50001);

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: longContent,
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Resume content too long (max 50,000 characters)');
  });

  it('returns 400 when job title or industry is too long', async () => {
    const longTitle = 'a'.repeat(101);

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: longTitle,
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Job title and industry must be under 100 characters');
  });

  it('returns 503 when AI service fails', async () => {
    mockAnalyzeResume.mockRejectedValueOnce(new Error('Failed to analyze resume'));

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('AI analysis service temporarily unavailable. Please try again.');
  });

  it('returns 429 when quota is exceeded', async () => {
    mockAnalyzeResume.mockRejectedValueOnce(new Error('quota exceeded'));

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: 'Sample resume content',
        jobTitle: 'Software Engineer',
        industry: 'Technology'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Service temporarily at capacity. Please try again in a few minutes.');
  });

  it('sanitizes input data', async () => {
    mockAnalyzeResume.mockResolvedValueOnce(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/analyze-resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeContent: '  Sample resume content  ',
        jobTitle: '  Software Engineer  ',
        industry: '  Technology  '
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockAnalyzeResume).toHaveBeenCalledWith(
      'Sample resume content',
      'Software Engineer',
      'Technology'
    );
  });
});