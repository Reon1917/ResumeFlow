import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

export interface ResumeAnalysisResult {
  overallScore: number;
  sectionScores: {
    content: number;
    structure: number;
    impact: number;
    keywords: number;
    presentation: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  atsCompatibility: {
    score: number;
    issues: string[];
  };
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ResponseEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  exampleResponse: string;
}

export const analyzeResume = async (
  resumeContent: string,
  jobTitle: string,
  industry: string
): Promise<ResumeAnalysisResult> => {
  const prompt = `
Role: Expert resume analyzer and career coach with 15+ years of experience in recruitment and talent acquisition.

Task: Analyze the following resume for a ${jobTitle} position in the ${industry} industry. Provide comprehensive feedback with specific, actionable recommendations.

Resume Content:
${resumeContent}

Analysis Requirements:
1. Score each section out of 20 points (100 total):
   - Content Quality (30%): Relevance, achievements, experience alignment
   - Structure & Format (25%): Organization, readability, ATS compatibility  
   - Impact & Quantification (20%): Metrics, results, concrete outcomes
   - Keyword Optimization (15%): Industry terms, role-specific keywords
   - Professional Presentation (10%): Grammar, consistency, visual appeal

2. Identify 3-5 key strengths
3. Provide 3-5 specific improvement areas
4. Give 3-5 actionable recommendations
5. Assess ATS compatibility with specific issues

Output Format: Valid JSON only, no additional text:
{
  "overallScore": number,
  "sectionScores": {
    "content": number,
    "structure": number,
    "impact": number,
    "keywords": number,
    "presentation": number
  },
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "atsCompatibility": {
    "score": number,
    "issues": ["issue1", "issue2", ...]
  }
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
};

export const generateInterviewQuestions = async (
  jobTitle: string,
  industry: string,
  experienceLevel: string,
  resumeContent?: string
): Promise<{
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  situational: InterviewQuestion[];
}> => {
  const prompt = `
Role: Senior technical recruiter and interview specialist with expertise in ${industry} industry.

Task: Generate comprehensive interview questions for a ${jobTitle} position targeting ${experienceLevel} level candidates.

${resumeContent ? `Candidate Resume Context:\n${resumeContent}\n` : ''}

Requirements:
1. Generate 5 technical questions relevant to ${jobTitle} role
2. Generate 5 behavioral questions using STAR method framework
3. Generate 5 situational questions for problem-solving assessment
4. Vary difficulty levels appropriately for ${experienceLevel} level
5. Ensure questions are current with industry standards and practices

Output Format: Valid JSON only, no additional text:
{
  "technical": [
    {
      "id": "tech_1",
      "text": "question text",
      "category": "technical",
      "difficulty": "easy|medium|hard"
    }
  ],
  "behavioral": [
    {
      "id": "behav_1", 
      "text": "question text",
      "category": "behavioral",
      "difficulty": "easy|medium|hard"
    }
  ],
  "situational": [
    {
      "id": "sit_1",
      "text": "question text", 
      "category": "situational",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const evaluateInterviewResponse = async (
  question: string,
  response: string,
  jobTitle: string,
  questionCategory: string
): Promise<ResponseEvaluation> => {
  const prompt = `
Role: Expert interview coach and assessment specialist.

Task: Evaluate the candidate's interview response for a ${jobTitle} position.

Question: ${question}
Category: ${questionCategory}
Candidate Response: ${response}

Evaluation Criteria:
1. Relevance (30%): Direct question addressing
2. Structure (20%): Clear organization (STAR method for behavioral)
3. Depth (20%): Sufficient detail and insight
4. Professionalism (20%): Appropriate tone and language
5. Impact (10%): Demonstrates value and results

Provide:
- Overall score (0-100)
- 2-3 specific strengths
- 2-3 areas for improvement
- 2-3 actionable suggestions
- Example of a strong response

Output Format: Valid JSON only, no additional text:
{
  "score": number,
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "exampleResponse": "example response text"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response_result = await result.response;
    const text = response_result.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error evaluating interview response:', error);
    throw new Error('Failed to evaluate interview response');
  }
};