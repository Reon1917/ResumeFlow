'use client';

interface AnalysisResult {
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

interface ResumeAnalysisResultsProps {
  result: AnalysisResult;
  fileName: string;
  jobTitle: string;
  industry: string;
  onClose: () => void;
}

export default function ResumeAnalysisResults({ 
  result, 
  fileName, 
  jobTitle, 
  industry, 
  onClose 
}: ResumeAnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-br from-green-50 to-green-100';
    if (score >= 60) return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
    return 'bg-gradient-to-br from-red-50 to-red-100';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const CircularProgress = ({ score, size = 120 }: { score: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${getScoreRingColor(score)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xs text-slate-500 font-medium">/ 100</div>
          </div>
        </div>
      </div>
    );
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'content':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'structure':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'impact':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'keywords':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'presentation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete!</h2>
        <p className="text-slate-600 mb-4">Here's your comprehensive resume analysis</p>
        <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {fileName} • {jobTitle} • {industry}
        </div>
      </div>

      {/* Overall Score */}
      <div className="text-center">
        <CircularProgress score={result.overallScore} size={140} />
        <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">Overall Score</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          {result.overallScore >= 80 ? 'Excellent resume! Your resume demonstrates strong professional presentation and content quality.' :
           result.overallScore >= 60 ? 'Good resume with room for improvement. Focus on the recommendations below to enhance your profile.' :
           'Significant improvements needed. Follow our detailed recommendations to strengthen your resume.'}
        </p>
      </div>

      {/* Section Scores */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Section Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(result.sectionScores).map(([section, score]) => (
            <div key={section} className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex flex-col items-center justify-center ${getScoreBgColor(score)} mb-4`}>
                <div className={`${getScoreColor(score)} mb-1`}>
                  {getSectionIcon(section)}
                </div>
                <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 capitalize">
                {section}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ATS Compatibility */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">ATS Compatibility</h3>
            <p className="text-slate-600">Applicant Tracking System Score</p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-6 py-3 rounded-xl ${getScoreBgColor(result.atsCompatibility.score)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(result.atsCompatibility.score)} mr-2`}>
              {result.atsCompatibility.score}
            </span>
            <span className="text-slate-600">/100</span>
          </div>
        </div>

        {result.atsCompatibility.issues.length > 0 && (
          <div className="bg-white/80 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Issues to Address:
            </h4>
            <div className="space-y-3">
              {result.atsCompatibility.issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-700">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strengths, Improvements, and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Strengths
          </h3>
          <div className="space-y-3">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-700 text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {result.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-700 text-sm">{improvement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            Recommendations
          </h3>
          <div className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-700 text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium"
        >
          Analyze Another Resume
        </button>
        <button
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
        >
          Generate Interview Questions
        </button>
      </div>
    </div>
  );
}