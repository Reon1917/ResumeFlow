'use client';

import { useAuth } from '../../lib/auth-context';
import { useEffect, useState } from 'react';
import { getUserResumes, getUserInterviewSessions, Resume, InterviewSession } from '../../lib/firestore';
import ResumeUpload from '../../components/resume/ResumeUpload';
import ResumeAnalysisResults from '../../components/resume/ResumeAnalysisResults';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);

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
                {/* Quick Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Total Resumes</p>
                                <p className="text-2xl font-semibold text-slate-900">{resumes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">High Scores (80+)</p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {resumes.filter(r => r.analysisScore && r.analysisScore >= 80).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Interview Sessions</p>
                                <p className="text-2xl font-semibold text-slate-900">{sessions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resume Analysis Section */}
                    <div className="bg-white rounded-xl border border-slate-200">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">Resume Analysis</h3>
                                <button
                                    onClick={() => setShowUpload(!showUpload)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    {showUpload ? 'Cancel' : '+ Upload Resume'}
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
                            ) : resumes.length > 0 ? (
                                <div className="space-y-4">
                                    {resumes.slice(0, 3).map((resume) => (
                                        <div key={resume.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{resume.fileName}</p>
                                                <p className="text-sm text-slate-500">{resume.jobTitle} • {resume.industry}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {resume.status === 'analyzing' && (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                        <span className="text-xs text-blue-600 font-medium">Analyzing...</span>
                                                    </div>
                                                )}
                                                {resume.analysisScore && (
                                                    <div className="text-right">
                                                        <div className={`text-lg font-semibold ${resume.analysisScore >= 80 ? 'text-green-600' :
                                                            resume.analysisScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {resume.analysisScore}
                                                        </div>
                                                        <div className="text-xs text-slate-500">/ 100</div>
                                                    </div>
                                                )}
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${resume.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                                                    resume.status === 'analyzing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {resume.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">No resumes yet</h3>
                                    <p className="mt-1 text-sm text-slate-500">Get started by uploading your first resume for analysis.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interview Prep Section */}
                    <div className="bg-white rounded-xl border border-slate-200">
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

                {/* Resume Upload Form */}
                {showUpload && !analysisResult && (
                    <div className="mt-8">
                        <ResumeUpload
                            onUploadComplete={() => {
                                setShowUpload(false);
                            }}
                            onAnalysisComplete={(result, fileName, jobTitle, industry) => {
                                setAnalysisResult({
                                    result,
                                    fileName,
                                    jobTitle,
                                    industry
                                });
                                setShowUpload(false);
                            }}
                        />
                    </div>
                )}

                {/* Analysis Results Display */}
                {analysisResult && (
                    <div className="mt-8">
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
                )}
            </main>
        </div>
    );
}