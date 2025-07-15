'use client';

import { useAuth } from '../../lib/auth-context';
import { useEffect, useState } from 'react';
import { getUserResumes, getUserInterviewSessions, Resume, InterviewSession } from '../../lib/firestore';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.displayName || user.email}
            </h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Resume Analysis Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Resume Analysis
                </h3>
                
                {loadingData ? (
                  <div className="text-gray-500">Loading resumes...</div>
                ) : resumes.length > 0 ? (
                  <div className="space-y-3">
                    {resumes.slice(0, 3).map((resume) => (
                      <div key={resume.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{resume.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {resume.jobTitle} • {resume.industry}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              resume.status === 'analyzed' 
                                ? 'bg-green-100 text-green-800'
                                : resume.status === 'analyzing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {resume.status}
                            </span>
                            {resume.analysisScore && (
                              <p className="text-sm font-medium mt-1">
                                Score: {resume.analysisScore}/100
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No resumes uploaded yet</div>
                )}
                
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Upload New Resume
                  </button>
                </div>
              </div>
            </div>

            {/* Interview Prep Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Interview Preparation
                </h3>
                
                {loadingData ? (
                  <div className="text-gray-500">Loading sessions...</div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{session.jobTitle}</p>
                            <p className="text-sm text-gray-500">
                              {session.industry} • {session.experienceLevel}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No interview sessions yet</div>
                )}
                
                <div className="mt-4">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Start Interview Prep
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
                  <div className="text-sm text-gray-500">Resumes Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessions.length}</div>
                  <div className="text-sm text-gray-500">Interview Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {resumes.filter(r => r.analysisScore && r.analysisScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-500">High-Scoring Resumes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}