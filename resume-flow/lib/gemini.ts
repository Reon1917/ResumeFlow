import { GoogleGenerativeAI } from "@google/generative-ai";
import { estimateTokenCount, logTokenCostAnalysis } from './utils/tokenUtils';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite-preview-06-17',
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
Role: Senior technical recruiter and resume analyst with 20+ years of experience. You are known for your rigorous, honest assessments and helping candidates improve through critical feedback.

Task: Conduct a thorough, critical analysis of this resume for a ${jobTitle} position in ${industry}. Be honest and realistic in your scoring - most resumes have significant room for improvement.

Resume Content:
${resumeContent}

CRITICAL SCORING GUIDELINES:
- 90-100: Exceptional resume, minimal improvements needed (rare - only 5% of resumes)
- 80-89: Strong resume with minor improvements needed (15% of resumes)
- 70-79: Good resume with moderate improvements needed (25% of resumes)
- 60-69: Average resume with significant improvements needed (35% of resumes)
- 50-59: Below average resume with major improvements needed (15% of resumes)
- Below 50: Poor resume requiring complete overhaul (5% of resumes)

EVALUATION CRITERIA (be critical and specific):

1. CONTENT QUALITY (30 points):
   - Relevance to ${jobTitle} role (does experience directly match?)
   - Achievement focus vs. job duties (quantified results vs. responsibilities)
   - Experience progression and growth
   - Skills alignment with industry standards
   - Professional impact and value proposition
   COMMON ISSUES: Generic job descriptions, lack of quantifiable achievements, irrelevant experience, no clear value proposition

2. STRUCTURE & FORMAT (25 points):
   - ATS-friendly format (proper headings, no tables/graphics)
   - Logical flow and organization
   - Appropriate length (1-2 pages for most roles)
   - Consistent formatting and spacing
   - Professional font and design choices
   COMMON ISSUES: Poor formatting, inconsistent styling, ATS-incompatible elements, too long/short, illogical structure

3. IMPACT & QUANTIFICATION (20 points):
   - Specific metrics and numbers (revenue, percentages, team sizes)
   - Results-oriented language (action verbs, outcomes)
   - Concrete examples of contributions
   - Evidence of problem-solving and leadership
   COMMON ISSUES: Vague statements, no metrics, focus on duties rather than achievements, weak action verbs

4. KEYWORD OPTIMIZATION (15 points):
   - Industry-specific terminology
   - Role-relevant technical skills
   - Modern tools and technologies
   - Certification and qualification mentions
   COMMON ISSUES: Outdated terminology, missing key skills, generic language, no industry buzzwords

5. PROFESSIONAL PRESENTATION (10 points):
   - Grammar and spelling accuracy
   - Consistent tense usage
   - Professional language and tone
   - Contact information completeness
   COMMON ISSUES: Typos, grammatical errors, unprofessional email, missing contact info, inconsistent formatting

ATS COMPATIBILITY ASSESSMENT:
Check for: Complex formatting, tables, images, non-standard fonts, unusual section headers, missing keywords, poor file format.

Be ruthlessly honest - identify specific weaknesses and provide actionable improvements. Most resumes score 60-75.

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
        console.log('🤖 Sending resume analysis request to Gemini API...');
        console.log('📊 Analysis parameters:', { jobTitle, industry, contentLength: resumeContent.length });

        // Estimate input tokens
        const inputTokens = estimateTokenCount(prompt);
        console.log('📥 Estimated input tokens:', inputTokens.toLocaleString());

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Estimate output tokens
        const outputTokens = estimateTokenCount(text);
        const totalTokens = inputTokens + outputTokens;

        console.log('✅ Gemini API response received');
        console.log('📝 Raw response length:', text.length);
        console.log('🔍 Raw response preview:', text.substring(0, 200) + '...');

        // Log cost analysis using the utility function
        logTokenCostAnalysis({
            inputTokens,
            outputTokens,
            totalTokens
        });

        // Clean the response to ensure it's valid JSON
        let cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        // Handle cases where AI returns explanatory text before JSON
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
        
        console.log('🧹 Cleaned response preview:', cleanedText.substring(0, 200) + '...');

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanedText);
        } catch (jsonError) {
            console.error('❌ JSON parsing failed, attempting to extract JSON from response');
            // Try to find JSON pattern in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[0]);
            } else {
                console.error('❌ No valid JSON found in response:', text);
                throw new Error('AI response did not contain valid JSON');
            }
        }
        console.log('✅ Successfully parsed JSON response');
        console.log('📈 Analysis results:', {
            overallScore: parsedResult.overallScore,
            strengthsCount: parsedResult.strengths?.length || 0,
            improvementsCount: parsedResult.improvements?.length || 0,
            recommendationsCount: parsedResult.recommendations?.length || 0,
            atsScore: parsedResult.atsCompatibility?.score || 0
        });

        return parsedResult;
    } catch (error) {
        console.error('❌ Error analyzing resume:', error);
        if (error instanceof SyntaxError) {
            console.error('🔧 JSON parsing error - raw response may be malformed');
        }
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
Role: Senior technical recruiter and interview specialist with 15+ years in ${industry}. You design challenging, realistic interview questions that accurately assess candidate capabilities.

Task: Create comprehensive, role-specific interview questions for a ${jobTitle} position at ${experienceLevel} level. Questions should be challenging yet fair, designed to reveal true competency.

${resumeContent ? `Candidate Resume Context (tailor questions based on their background):\n${resumeContent}\n` : ''}

QUESTION DESIGN PRINCIPLES:
- Technical questions should test practical knowledge, not just theory
- Behavioral questions must use STAR method and probe for specific examples
- Situational questions should present realistic ${industry} scenarios
- Difficulty should match ${experienceLevel} expectations
- Questions should differentiate between strong and weak candidates

DIFFICULTY GUIDELINES:
- Easy: Fundamental concepts, basic scenarios (${experienceLevel === 'entry' ? '60%' : experienceLevel === 'mid' ? '30%' : '10%'})
- Medium: Practical application, moderate complexity (${experienceLevel === 'entry' ? '30%' : experienceLevel === 'mid' ? '50%' : '40%'})
- Hard: Advanced concepts, complex scenarios (${experienceLevel === 'entry' ? '10%' : experienceLevel === 'mid' ? '20%' : '50%'})

TECHNICAL QUESTIONS (5 total):
- Focus on ${jobTitle}-specific skills and tools
- Include problem-solving scenarios
- Test both knowledge and application
- Consider current industry trends and best practices

BEHAVIORAL QUESTIONS (5 total):
- Use STAR method framework (Situation, Task, Action, Result)
- Probe for leadership, teamwork, problem-solving
- Ask for specific examples with measurable outcomes
- Focus on competencies critical for ${jobTitle} success

SITUATIONAL QUESTIONS (5 total):
- Present realistic ${industry} challenges
- Test decision-making and problem-solving
- Assess cultural fit and work style
- Include scenarios specific to ${jobTitle} responsibilities

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
        console.log('🎯 Generating interview questions for:', { jobTitle, industry, experienceLevel });

        // Estimate input tokens
        const inputTokens = estimateTokenCount(prompt);
        console.log('📥 Estimated input tokens:', inputTokens.toLocaleString());

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Estimate output tokens and log cost analysis
        const outputTokens = estimateTokenCount(text);
        logTokenCostAnalysis({
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens
        });

        console.log('✅ Interview questions response received');
        console.log('📝 Response length:', text.length);

        let cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        // Handle cases where AI returns explanatory text before JSON
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanedText);
        } catch (jsonError) {
            console.error('❌ JSON parsing failed, attempting to extract JSON from response');
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[0]);
            } else {
                console.error('❌ No valid JSON found in response:', text);
                throw new Error('AI response did not contain valid JSON');
            }
        }

        console.log('📋 Generated questions:', {
            technicalCount: parsedResult.technical?.length || 0,
            behavioralCount: parsedResult.behavioral?.length || 0,
            situationalCount: parsedResult.situational?.length || 0
        });

        return parsedResult;
    } catch (error) {
        console.error('❌ Error generating interview questions:', error);
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
Role: Senior interview coach and assessment specialist with expertise in ${jobTitle} evaluations. You provide honest, constructive feedback to help candidates improve.

Task: Critically evaluate this interview response for a ${jobTitle} position. Be realistic in scoring - most responses have significant room for improvement.

Question: ${question}
Category: ${questionCategory}
Candidate Response: ${response}

SCORING GUIDELINES (be realistic):
- 90-100: Exceptional response, minimal improvements needed (rare - top 5%)
- 80-89: Strong response with minor improvements (15%)
- 70-79: Good response with moderate improvements (25%)
- 60-69: Average response with significant improvements (35%)
- 50-59: Below average response with major improvements (15%)
- Below 50: Poor response requiring complete rework (5%)

EVALUATION CRITERIA:

1. RELEVANCE & DIRECTNESS (30%):
   - Directly addresses all parts of the question
   - Stays on topic throughout response
   - Provides specific, relevant examples
   - Avoids tangential information
   COMMON ISSUES: Vague answers, missing question components, irrelevant examples

2. STRUCTURE & CLARITY (25%):
   - Clear, logical organization
   - Uses STAR method for behavioral questions (Situation, Task, Action, Result)
   - Smooth transitions between points
   - Appropriate length and pacing
   COMMON ISSUES: Rambling, poor organization, missing STAR components, too brief/verbose

3. DEPTH & INSIGHT (20%):
   - Provides sufficient detail and context
   - Demonstrates deep understanding
   - Shows problem-solving process
   - Reveals learning and growth mindset
   COMMON ISSUES: Surface-level answers, lack of detail, no evidence of learning

4. PROFESSIONALISM & COMMUNICATION (15%):
   - Appropriate tone and language
   - Clear articulation of ideas
   - Confident delivery
   - Professional vocabulary
   COMMON ISSUES: Unprofessional language, unclear communication, lack of confidence

5. IMPACT & VALUE (10%):
   - Demonstrates tangible results
   - Shows value creation
   - Quantifies achievements where possible
   - Connects to business outcomes
   COMMON ISSUES: No measurable results, vague outcomes, minimal business impact

Be honest and specific in your feedback. Identify concrete areas for improvement and provide actionable advice.

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
        console.log('🎤 Evaluating interview response for:', { jobTitle, questionCategory });
        console.log('📝 Response length:', response.length);

        // Estimate input tokens
        const inputTokens = estimateTokenCount(prompt);
        console.log('📥 Estimated input tokens:', inputTokens.toLocaleString());

        const result = await model.generateContent(prompt);
        const response_result = result.response;
        const text = response_result.text();

        // Estimate output tokens and log cost analysis
        const outputTokens = estimateTokenCount(text);
        logTokenCostAnalysis({
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens
        });

        console.log('✅ Interview evaluation response received');
        console.log('📊 Response length:', text.length);

        let cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        // Handle cases where AI returns explanatory text before JSON
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanedText);
        } catch (jsonError) {
            console.error('❌ JSON parsing failed, attempting to extract JSON from response');
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[0]);
            } else {
                console.error('❌ No valid JSON found in response:', text);
                throw new Error('AI response did not contain valid JSON');
            }
        }

        console.log('📈 Evaluation results:', {
            score: parsedResult.score,
            strengthsCount: parsedResult.strengths?.length || 0,
            improvementsCount: parsedResult.improvements?.length || 0,
            suggestionsCount: parsedResult.suggestions?.length || 0
        });

        return parsedResult;
    } catch (error) {
        console.error('❌ Error evaluating interview response:', error);
        throw new Error('Failed to evaluate interview response');
    }
};