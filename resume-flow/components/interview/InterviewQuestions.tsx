'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import AILoadingStates from '../ui/AILoadingStates';
import { InterviewQuestion } from '../../lib/gemini';

interface InterviewQuestionsProps {
  jobTitle: string;
  industry: string;
  resumeContent?: string;
}

interface QuestionsResult {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  situational: InterviewQuestion[];
}

export default function InterviewQuestions({ jobTitle, industry, resumeContent }: InterviewQuestionsProps) {
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuestionsResult | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleGenerateQuestions = async () => {
    if (!experienceLevel || !user) {
      setError('Please select your experience level.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Get user's auth token
      const token = await user.getIdToken();

      // Call the API
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle,
          industry,
          experienceLevel,
          resumeContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.data);
    } catch (error) {
      console.error('Questions generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <AILoadingStates 
        phase="interview-generation" 
        onComplete={() => setIsGenerating(false)}
      />
    );
  }

  if (questions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Questions Ready!</h2>
            <p className="text-gray-600">
              Personalized questions for {jobTitle} in {industry} ({experienceLevel})
            </p>
          </div>

          {/* Questions Sections */}
          <div className="space-y-8">
            {/* Technical Questions */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                Technical Questions ({questions.technical.length})
              </h3>
              <div className="grid gap-4">
                {questions.technical.map((question, index) => (
                  <QuestionCard key={question.id} question={question} index={index + 1} />
                ))}
              </div>
            </div>

            {/* Behavioral Questions */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Behavioral Questions ({questions.behavioral.length})
              </h3>
              <div className="grid gap-4">
                {questions.behavioral.map((question, index) => (
                  <QuestionCard key={question.id} question={question} index={index + 1} />
                ))}
              </div>
            </div>

            {/* Situational Questions */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                </div>
                Situational Questions ({questions.situational.length})
              </h3>
              <div className="grid gap-4">
                {questions.situational.map((question, index) => (
                  <QuestionCard key={question.id} question={question} index={index + 1} />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => {
                setQuestions(null);
                setExperienceLevel('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Generate New Questions
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Print Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h2>
          <p className="text-gray-600">
            Generate personalized interview questions for {jobTitle} in {industry}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Experience Level */}
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select your experience level</option>
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid-level">Mid Level (3-5 years)</option>
              <option value="senior-level">Senior Level (6+ years)</option>
              <option value="executive">Executive/Leadership</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">What you'll get:</h3>
                <div className="mt-2 text-sm text-purple-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>5 technical questions tailored to your role</li>
                    <li>5 behavioral questions using STAR method</li>
                    <li>5 situational problem-solving questions</li>
                    <li>Questions personalized based on your resume</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleGenerateQuestions}
            disabled={!experienceLevel || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isGenerating ? 'Generating Questions...' : 'Generate Interview Questions'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({ question, index }: { question: InterviewQuestion; index: number }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mr-3">
            {index}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
      </div>
      <p className="text-gray-900 font-medium leading-relaxed">
        {question.text}
      </p>
    </div>
  );
}