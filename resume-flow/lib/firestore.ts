import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions based on your schema
export interface UserProfile {
  email: string;
  displayName: string;
  createdAt: Timestamp;
  preferences: {
    targetRole: string;
    industry: string;
    experienceLevel: string;
  };
  subscription: {
    tier: string;
    expiresAt: Timestamp;
  };
}

export interface Resume {
  id?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  jobTitle: string;
  industry: string;
  uploadedAt: Timestamp;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error';
  analysisScore?: number;
  feedback?: {
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
  };
  analyzedAt?: Timestamp;
}

export interface InterviewSession {
  id?: string;
  userId: string;
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  questions: {
    technical: Question[];
    behavioral: Question[];
    situational: Question[];
  };
  responses: Response[];
  createdAt: Timestamp;
  status: 'active' | 'completed' | 'abandoned';
}

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: string;
}

interface Response {
  question: string;
  response: string;
  evaluation: {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    exampleResponse: string;
  };
  timestamp: Timestamp;
}

// User operations
export const createUserProfile = async (userId: string, userData: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
};

// Resume operations
export const createResume = async (resumeData: Omit<Resume, 'id'>): Promise<string> => {
  const resumesRef = collection(db, 'resumes');
  const docRef = await addDoc(resumesRef, {
    ...resumeData,
    uploadedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateResume = async (resumeId: string, updates: Partial<Resume>) => {
  const resumeRef = doc(db, 'resumes', resumeId);
  await updateDoc(resumeRef, {
    ...updates,
    ...(updates.feedback && { analyzedAt: serverTimestamp() })
  });
};

export const getResume = async (resumeId: string): Promise<Resume | null> => {
  const resumeRef = doc(db, 'resumes', resumeId);
  const resumeSnap = await getDoc(resumeRef);
  return resumeSnap.exists() ? { id: resumeSnap.id, ...resumeSnap.data() } as Resume : null;
};

export const getUserResumes = async (userId: string): Promise<Resume[]> => {
  const resumesRef = collection(db, 'resumes');
  const q = query(
    resumesRef, 
    where('userId', '==', userId),
    orderBy('uploadedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resume));
};

// Interview session operations
export const createInterviewSession = async (sessionData: Omit<InterviewSession, 'id'>): Promise<string> => {
  const sessionsRef = collection(db, 'interviewSessions');
  const docRef = await addDoc(sessionsRef, {
    ...sessionData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateInterviewSession = async (sessionId: string, updates: Partial<InterviewSession>) => {
  const sessionRef = doc(db, 'interviewSessions', sessionId);
  await updateDoc(sessionRef, updates);
};

export const getInterviewSession = async (sessionId: string): Promise<InterviewSession | null> => {
  const sessionRef = doc(db, 'interviewSessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  return sessionSnap.exists() ? { id: sessionSnap.id, ...sessionSnap.data() } as InterviewSession : null;
};

export const getUserInterviewSessions = async (userId: string): Promise<InterviewSession[]> => {
  const sessionsRef = collection(db, 'interviewSessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InterviewSession));
};