import { analyzeResume, generateInterviewQuestions, evaluateInterviewResponse } from '../lib/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Gemini SDK
jest.mock('@google/generative-ai');

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent
}));

const MockedGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

describe('Gemini API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel
    } as any));
  });

  describe('analyzeResume', () => {
    const mockAnalysisResult = {
      overallScore: 85,
      sectionScores: {
        content: 18,
        structure: 16,
        impact: 17,
        keywords: 15,
        presentation: 19
      },
      strengths: [
        'Strong technical skills demonstrated',
        'Clear project descriptions with quantifiable results',
        'Relevant experience for the target role'
      ],
      improvements: [
        'Add more industry-specific keywords',
        'Include more metrics and numbers',
        'Improve formatting consistency'
      ],
      recommendations: [
        'Consider adding a professional summary',
        'Highlight leadership experience more prominently',
        'Include relevant certifications'
      ],
      atsCompatibility: {
        score: 78,
        issues: [
          'Use standard section headings',
          'Avoid complex formatting'
        ]
      }
    };

    it('successfully analyzes a resume', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockAnalysisResult)
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeResume(
        'Sample resume content',
        'Software Engineer',
        'Technology'
      );

      expect(result).toEqual(mockAnalysisResult);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Software Engineer')
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Technology')
      );
    });

    it('handles JSON response with code blocks', async () => {
      const mockResponse = {
        response: {
          text: () => `\`\`\`json\n${JSON.stringify(mockAnalysisResult)}\n\`\`\``
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeResume(
        'Sample resume content',
        'Software Engineer',
        'Technology'
      );

      expect(result).toEqual(mockAnalysisResult);
    });

    it('throws error when API call fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        analyzeResume('Sample resume content', 'Software Engineer', 'Technology')
      ).rejects.toThrow('Failed to analyze resume');
    });

    it('throws error when response is invalid JSON', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid JSON response'
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      await expect(
        analyzeResume('Sample resume content', 'Software Engineer', 'Technology')
      ).rejects.toThrow('Failed to analyze resume');
    });
  });

  describe('generateInterviewQuestions', () => {
    const mockQuestionsResult = {
      technical: [
        {
          id: 'tech_1',
          text: 'Explain the difference between REST and GraphQL APIs',
          category: 'technical' as const,
          difficulty: 'medium' as const
        },
        {
          id: 'tech_2',
          text: 'How would you optimize a slow database query?',
          category: 'technical' as const,
          difficulty: 'hard' as const
        }
      ],
      behavioral: [
        {
          id: 'behav_1',
          text: 'Tell me about a time when you had to work with a difficult team member',
          category: 'behavioral' as const,
          difficulty: 'medium' as const
        }
      ],
      situational: [
        {
          id: 'sit_1',
          text: 'How would you handle a situation where a project deadline is at risk?',
          category: 'situational' as const,
          difficulty: 'medium' as const
        }
      ]
    };

    it('successfully generates interview questions', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockQuestionsResult)
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await generateInterviewQuestions(
        'Software Engineer',
        'Technology',
        'mid-level',
        'Sample resume content'
      );

      expect(result).toEqual(mockQuestionsResult);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Software Engineer')
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('mid-level')
      );
    });

    it('works without resume content', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockQuestionsResult)
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await generateInterviewQuestions(
        'Software Engineer',
        'Technology',
        'senior-level'
      );

      expect(result).toEqual(mockQuestionsResult);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.not.stringContaining('Candidate Resume Context')
      );
    });

    it('throws error when API call fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        generateInterviewQuestions('Software Engineer', 'Technology', 'mid-level')
      ).rejects.toThrow('Failed to generate interview questions');
    });
  });

  describe('evaluateInterviewResponse', () => {
    const mockEvaluationResult = {
      score: 82,
      strengths: [
        'Clear structure using STAR method',
        'Specific examples provided'
      ],
      improvements: [
        'Could provide more quantifiable results',
        'Expand on lessons learned'
      ],
      suggestions: [
        'Practice articulating impact more clearly',
        'Prepare more detailed examples'
      ],
      exampleResponse: 'Here is an example of a strong response...'
    };

    it('successfully evaluates an interview response', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockEvaluationResult)
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await evaluateInterviewResponse(
        'Tell me about a challenging project you worked on',
        'I worked on a project where we had to migrate our entire system...',
        'Software Engineer',
        'behavioral'
      );

      expect(result).toEqual(mockEvaluationResult);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Software Engineer')
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('behavioral')
      );
    });

    it('throws error when API call fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        evaluateInterviewResponse(
          'Test question',
          'Test response',
          'Software Engineer',
          'behavioral'
        )
      ).rejects.toThrow('Failed to evaluate interview response');
    });
  });

  describe('Gemini Client Configuration', () => {
    it('initializes with correct model and configuration', () => {
      expect(MockedGoogleGenerativeAI).toHaveBeenCalledWith(
        process.env.GEMINI_API_KEY
      );
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          thinkingBudget: 0
        }
      });
    });

    it('throws error when API key is missing', () => {
      const originalEnv = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => {
        jest.resetModules();
        require('../lib/gemini');
      }).toThrow('GEMINI_API_KEY is not set in environment variables');

      process.env.GEMINI_API_KEY = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        analyzeResume('Sample resume', 'Engineer', 'Tech')
      ).rejects.toThrow('Failed to analyze resume');
    });

    it('handles quota exceeded errors', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));

      await expect(
        analyzeResume('Sample resume', 'Engineer', 'Tech')
      ).rejects.toThrow('Failed to analyze resume');
    });

    it('handles malformed JSON responses', async () => {
      const mockResponse = {
        response: {
          text: () => '{ invalid json'
        }
      };
      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      await expect(
        analyzeResume('Sample resume', 'Engineer', 'Tech')
      ).rejects.toThrow('Failed to analyze resume');
    });
  });
});