'use client';

import { useAuth } from '../../lib/auth-context';
import { useEffect, useState } from 'react';
import { getUserResumes, getUserInterviewSessions, Resume, InterviewSession } from '../../lib/firestore';
import ResumeUpload from '../../components/resume/ResumeUpload';
import ResumeAnalysisResults from '../../components/resume/ResumeAnalysisResults';
import AIProcessingSteps from '../../components/ui/AIProcessingSteps';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [processingSteps, setProcessingSteps] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        if (!user) return;

        try {
            const [userResumes, userSessions] = await Promise.all([
                getUserResumes(user.uid),
                getUserInterviewSessions(user.uid)
            ]);

            setResumes(userResumes);
            setSessions(userSessions);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
                    <a href="/login" className="text-blue-600 hover:underline">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                Dashboard
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Welcome back, {user.displayName || user.email?.split('@')[0]}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Main Analysis Section - Center Stage */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Resume Analysis</h3>
                                    <p className="text-sm text-slate-600 mt-1">Upload and analyze your resume to get AI-powered insights</p>
                                </div>
                                {!showUpload && !analysisResult && !processingSteps && (
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Resume
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Show current analysis status */}
                            {resumes.filter(r => r.status === 'analyzing').length > 0 && (
                                <div className="mb-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Analysis in Progress</p>
                                                <p className="text-xs text-blue-700">
                                                    {resumes.find(r => r.status === 'analyzing')?.fileName} is being analyzed...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Analysis Results */}
                            {!loadingData && resumes.filter(r => r.status === 'analyzed').length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-medium text-slate-900 mb-4">Recent Analysis Results</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {resumes.filter(r => r.status === 'analyzed').slice(0, 3).map((resume) => (
                                            <div key={resume.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors cursor-pointer">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className={`text-2xl font-bold ${resume.analysisScore >= 80 ? 'text-green-600' :
                                                            resume.analysisScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {resume.analysisScore}
                                                        </div>
                                                    </div>
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                        Analyzed
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 truncate">{resume.fileName}</p>
                                                    <p className="text-xs text-slate-500">{resume.jobTitle} • {resume.industry}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {resume.analyzedAt && new Date(resume.analyzedAt.toDate()).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload History */}
                            {!loadingData && resumes.filter(r => r.status === 'uploaded').length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-medium text-slate-900 mb-4">Uploaded Files</h4>
                                    <div className="space-y-3">
                                        {resumes.filter(r => r.status === 'uploaded').map((resume) => (
                                            <div key={resume.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{resume.fileName}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {resume.jobTitle} • {resume.industry}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                    Ready for Analysis
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loadingData && resumes.length === 0 && !showUpload && (
                                <div className="text-center py-12">
                                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Start Your Resume Analysis</h3>
                                    <p className="text-sm text-slate-500 mb-6">Upload your resume to get detailed AI-powered feedback and scoring</p>
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Your Resume
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">Quick Stats</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">{resumes.filter(r => r.status === 'analyzed').length}</div>
                                    <div className="text-sm text-slate-500">Analyzed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {resumes.filter(r => r.analysisScore && r.analysisScore >= 80).length}
                                    </div>
                                    <div className="text-sm text-slate-500">High Scores</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">{sessions.length}</div>
                                    <div className="text-sm text-slate-500">Interview Sessions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-600">
                                        {resumes.filter(r => r.status === 'uploaded').length}
                                    </div>
                                    <div className="text-sm text-slate-500">Uploaded</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interview Prep Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">Interview Preparation</h3>
                                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                                    + Start Session
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {loadingData ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                                </div>
                                                <div className="w-16 h-8 bg-slate-200 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : sessions.length > 0 ? (
                                <div className="space-y-4">
                                    {sessions.slice(0, 3).map((session) => (
                                        <div key={session.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{session.jobTitle}</p>
                                                <p className="text-sm text-slate-500">{session.industry} • {session.experienceLevel}</p>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">No interview sessions yet</h3>
                                    <p className="mt-1 text-sm text-slate-500">Start your first interview preparation session.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Processing Steps */}
                {processingSteps && (
                    <div className="mt-8">
                        <AIProcessingSteps
                            isProcessing={processingSteps}
                            onComplete={() => {
                                setProcessingSteps(false);
                            }}
                        />
                    </div>
                )}

                {/* Resume Upload Form */}
                {showUpload && !analysisResult && !processingSteps && (
                    <div className="mt-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-5 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Upload Resume</h3>
                                        <p className="text-sm text-slate-600 mt-1">Upload your resume for AI-powered analysis</p>
                                    </div>
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ResumeUpload
                                    onUploadComplete={() => {
                                        setShowUpload(false);
                                        setProcessingSteps(false); // Reset processing state
                                        loadUserData(); // Refresh data to show uploaded file
                                    }}
                                    onAnalysisComplete={(result, fileName, jobTitle, industry) => {
                                        setAnalysisResult({
                                            result,
                                            fileName,
                                            jobTitle,
                                            industry
                                        });
                                        setShowUpload(false);
                                        setProcessingSteps(false);
                                        loadUserData(); // Refresh data
                                    }}
                                    onProcessingStart={() => {
                                        setProcessingSteps(true);
                                    }}
                                    onError={() => {
                                        setProcessingSteps(false); // Reset processing state on error
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Results Display */}
                {analysisResult && (
                    <div className="mt-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-5 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Analysis Results</h3>
                                        <p className="text-sm text-slate-600 mt-1">Detailed feedback and recommendations for your resume</p>
                                    </div>
                                    <button
                                        onClick={() => setAnalysisResult(null)}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ResumeAnalysisResults
                                    result={analysisResult.result}
                                    fileName={analysisResult.fileName}
                                    jobTitle={analysisResult.jobTitle}
                                    industry={analysisResult.industry}
                                    onClose={() => {
                                        setAnalysisResult(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}