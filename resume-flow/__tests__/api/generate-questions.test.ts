import { POST } from '../../app/api/gemini/generate-questions/route';
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { generateInterviewQuestions } from '../../lib/gemini';

// Mock dependencies
jest.mock('firebase-admin/auth');
jest.mock('../../lib/gemini');
jest.mock('firebase-admin/app');

const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
const mockGenerateInterviewQuestions = generateInterviewQuestions as jest.MockedFunction<typeof generateInterviewQuestions>;

describe('/api/gemini/generate-questions', () => {
  const mockQuestionsResult = {
    technical: [
      {
        id: 'tech_1',
        text: 'Explain REST API principles',
        category: 'technical' as const,
        difficulty: 'medium' as const
      }
    ],
    behavioral: [
      {
        id: 'behav_1',
        text: 'Tell me about a challenging project',
        category: 'behavioral' as const,
        difficulty: 'medium' as const
      }
    ],
    situational: [
      {
        id: 'sit_1',
        text: 'How would you handle a tight deadline?',
        category: 'situational' as const,
        difficulty: 'medium' as const
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase Admin Auth
    mockGetAuth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' })
    } as any);
  });

  it('successfully generates questions with valid request', async () => {
    mockGenerateInterviewQuestions.mockResolvedValueOnce(mockQuestionsResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'mid-level',
        resumeContent: 'Sample resume content'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockQuestionsResult);
    expect(mockGenerateInterviewQuestions).toHaveBeenCalledWith(
      'Software Engineer',
      'Technology',
      'mid-level',
      'Sample resume content'
    );
  });

  it('works without resume content', async () => {
    mockGenerateInterviewQuestions.mockResolvedValueOnce(mockQuestionsResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'senior-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockGenerateInterviewQuestions).toHaveBeenCalledWith(
      'Software Engineer',
      'Technology',
      'senior-level',
      undefined
    );
  });

  it('returns 401 when no authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'mid-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized - Missing or invalid token');
  });

  it('returns 400 when required fields are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        // Missing industry and experienceLevel
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields: jobTitle, industry, experienceLevel');
  });

  it('returns 400 when experience level is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'invalid-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid experience level. Must be one of: entry-level, mid-level, senior-level, executive');
  });

  it('returns 400 when job title or industry is too long', async () => {
    const longTitle = 'a'.repeat(101);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: longTitle,
        industry: 'Technology',
        experienceLevel: 'mid-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Job title and industry must be under 100 characters');
  });

  it('returns 400 when resume content is too long', async () => {
    const longContent = 'a'.repeat(50001);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'mid-level',
        resumeContent: longContent
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Resume content too long (max 50,000 characters)');
  });

  it('returns 503 when AI service fails', async () => {
    mockGenerateInterviewQuestions.mockRejectedValueOnce(new Error('Failed to generate interview questions'));

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'mid-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('AI question generation service temporarily unavailable. Please try again.');
  });

  it('returns 502 when AI service returns invalid data', async () => {
    mockGenerateInterviewQuestions.mockResolvedValueOnce({
      technical: [],
      // Missing behavioral and situational
    } as any);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'mid-level'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('AI service returned invalid data. Please try again.');
  });

  it('sanitizes input data', async () => {
    mockGenerateInterviewQuestions.mockResolvedValueOnce(mockQuestionsResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: '  Software Engineer  ',
        industry: '  Technology  ',
        experienceLevel: '  mid-level  ',
        resumeContent: '  Sample resume content  '
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateInterviewQuestions).toHaveBeenCalledWith(
      'Software Engineer',
      'Technology',
      'mid-level',
      'Sample resume content'
    );
  });

  it('validates experience level case insensitively', async () => {
    mockGenerateInterviewQuestions.mockResolvedValueOnce(mockQuestionsResult);

    const request = new NextRequest('http://localhost:3000/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobTitle: 'Software Engineer',
        industry: 'Technology',
        experienceLevel: 'MID-LEVEL'
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});