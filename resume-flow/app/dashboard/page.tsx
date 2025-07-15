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

    const handleProcessingComplete = () => {
        console.log('🎉 Processing completed, hiding steps');
        setProcessingSteps(false);
    };

    const handleAnalysisComplete = (result: any, fileName: string, jobTitle: string, industry: string) => {
        console.log('✅ Analysis completed, showing results');
        setAnalysisResult({
            result,
            fileName,
            jobTitle,
            industry
        });
        setShowUpload(false);
        setProcessingSteps(false);
        loadUserData();
    };

    const handleProcessingStart = () => {
        console.log('🚀 Processing started');
        setProcessingSteps(true);
    };

    const handleError = () => {
        console.log('❌ Error occurred, resetting states');
        setProcessingSteps(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-slate-700">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h1>
                    <p className="text-slate-600 mb-6">Please sign in to access your dashboard</p>
                    <a 
                        href="/login" 
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                                <p className="text-sm text-slate-600">
                                    Welcome back, {user.displayName || user.email?.split('@')[0]}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200 rounded-lg hover:bg-white hover:text-slate-900 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* AI Processing Steps */}
                {processingSteps && (
                    <AIProcessingSteps
                        isProcessing={processingSteps}
                        onComplete={handleProcessingComplete}
                    />
                )}

                {/* Main Resume Analysis Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Resume Analysis</h3>
                                    <p className="text-sm text-slate-600">Upload and analyze your resume to get AI-powered insights</p>
                                </div>
                            </div>
                            {!showUpload && !analysisResult && !processingSteps && (
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Resume
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Upload Form */}
                        {showUpload && !analysisResult && !processingSteps && (
                            <ResumeUpload
                                onUploadComplete={() => {
                                    setShowUpload(false);
                                    loadUserData();
                                }}
                                onAnalysisComplete={handleAnalysisComplete}
                                onProcessingStart={handleProcessingStart}
                                onError={handleError}
                            />
                        )}

                        {/* Analysis Results */}
                        {analysisResult && !processingSteps && (
                            <ResumeAnalysisResults
                                result={analysisResult.result}
                                fileName={analysisResult.fileName}
                                jobTitle={analysisResult.jobTitle}
                                industry={analysisResult.industry}
                                onClose={() => setAnalysisResult(null)}
                            />
                        )}

                        {/* Empty State */}
                        {!showUpload && !analysisResult && !processingSteps && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Start Your Resume Analysis</h3>
                                <p className="text-slate-600 mb-8 max-w-md mx-auto">Upload your resume to get detailed AI-powered feedback, scoring, and personalized recommendations</p>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Your Resume
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats and Interview Prep Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Stats */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Quick Stats</h3>
                                    <p className="text-sm text-slate-600">Your activity overview</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {resumes.filter(r => r.status === 'analyzed').length}
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">Analyzed</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {resumes.filter(r => r.analysisScore && r.analysisScore >= 80).length}
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">High Scores</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">{sessions.length}</div>
                                    <div className="text-sm font-medium text-slate-700">Interview Sessions</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                                        {resumes.filter(r => r.status === 'uploaded').length}
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">Uploaded</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interview Prep Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Interview Preparation</h3>
                                        <p className="text-sm text-slate-600">Practice with AI-generated questions</p>
                                    </div>
                                </div>
                                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Start Session
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            {sessions.length > 0 ? (
                                <div className="space-y-4">
                                    {sessions.slice(0, 3).map((session) => (
                                        <div key={session.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-200 cursor-pointer">
                                            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{session.jobTitle}</p>
                                                <p className="text-sm text-slate-600">{session.industry} • {session.experienceLevel}</p>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                                session.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-slate-900 mb-2">No interview sessions yet</h4>
                                    <p className="text-sm text-slate-600">Start your first interview preparation session to practice with AI-generated questions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}