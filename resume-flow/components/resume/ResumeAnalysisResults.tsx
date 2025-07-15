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
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
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
            className={`transition-all duration-1000 ease-out ${
              score >= 80 ? 'text-green-500' :
              score >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Resume Analysis Results</h3>
            <p className="text-sm text-slate-600 mt-1">
              {fileName} • {jobTitle} • {industry}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Overall Score */}
        <div className="text-center mb-8">
          <CircularProgress score={result.overallScore} />
          <h4 className="text-lg font-semibold text-slate-900 mt-4">Overall Score</h4>
          <p className="text-sm text-slate-600">
            {result.overallScore >= 80 ? 'Excellent resume!' :
             result.overallScore >= 60 ? 'Good resume with room for improvement' :
             'Needs significant improvement'}
          </p>
        </div>

        {/* Section Scores */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Section Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(result.sectionScores).map(([section, score]) => (
              <div key={section} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getScoreBgColor(score)}`}>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 mt-2 capitalize">
                  {section}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Compatibility */}
        <div className="mb-8 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-slate-900">ATS Compatibility</h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.atsCompatibility.score)} ${getScoreColor(result.atsCompatibility.score)}`}>
              {result.atsCompatibility.score}/100
            </div>
          </div>
          {result.atsCompatibility.issues.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Issues to address:</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {result.atsCompatibility.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h4>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start">
                  <span className="text-yellow-500 mr-2">⚠</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </h4>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}