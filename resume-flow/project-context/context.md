# Resume Scanning & Interview Prep Web App - Project Context

## Project Overview

**Project Name**: ResumeFlow (or similar resume optimization platform)
**Tech Stack**: Next.js 15 (App Router), Firebase, Gemini 2.5 Flash API
**Purpose**: Comprehensive resume analysis, scoring, feedback generation, and interview preparation platform

## Core Features

### 1. Resume Analysis System
- **Upload & Parse**: Support for PDF, DOCX, and text file uploads
- **AI-Powered Analysis**: Gemini 2.5 Flash integration for comprehensive resume evaluation
- **Scoring Framework**: 100-point scoring system across 5 key areas
- **ATS Compatibility**: Applicant Tracking System optimization recommendations
- **Industry Customization**: Role-specific and industry-specific analysis

### 2. Interview Preparation Module
- **Question Generation**: AI-generated interview questions based on resume and job requirements
- **Response Evaluation**: Real-time feedback on interview answers
- **Practice Sessions**: Interactive interview simulation environment
- **Progress Tracking**: Performance analytics and improvement recommendations

### 3. User Management
- **Authentication**: Firebase Auth integration
- **Profile Management**: User preferences, job targets, industry focus
- **History Tracking**: Resume versions, analysis results, interview sessions
- **Dashboard**: Centralized user interface for all features

## Technical Architecture

### Frontend (Next.js 14)
```
src/app/
├── (auth)/                 # Authentication pages
├── dashboard/              # Main application interface
├── api/                    # API routes
├── components/             # Reusable UI components
├── lib/                    # Utility libraries and configurations
└── hooks/                  # Custom React hooks
```

### Backend (Firebase + API Routes)
- **Authentication**: Firebase Auth for user management
- **Database**: Firestore for user data, resume metadata, analysis results
- **Storage**: Firebase Storage for resume file uploads
- **API Layer**: Next.js API routes for business logic
- **AI Integration**: Gemini 2.5 Flash for content analysis and generation

### Database Schema (Firestore)

#### Users Collection
```javascript
users/{userId} = {
  email: string,
  displayName: string,
  createdAt: timestamp,
  preferences: {
    targetRole: string,
    industry: string,
    experienceLevel: string
  },
  subscription: {
    tier: string,
    expiresAt: timestamp
  }
}
```

#### Resumes Collection
```javascript
resumes/{resumeId} = {
  userId: string,
  fileName: string,
  fileUrl: string,
  jobTitle: string,
  industry: string,
  uploadedAt: timestamp,
  status: string, // 'uploaded', 'analyzing', 'analyzed', 'error'
  analysisScore: number,
  feedback: {
    overallScore: number,
    sectionScores: {
      content: number,
      structure: number,
      impact: number,
      keywords: number,
      presentation: number
    },
    strengths: string[],
    improvements: string[],
    recommendations: string[],
    atsCompatibility: {
      score: number,
      issues: string[]
    }
  },
  analyzedAt: timestamp
}
```

#### Interview Sessions Collection
```javascript
interviewSessions/{sessionId} = {
  userId: string,
  jobTitle: string,
  industry: string,
  experienceLevel: string,
  questions: {
    technical: Question[],
    behavioral: Question[],
    situational: Question[]
  },
  responses: {
    question: string,
    response: string,
    evaluation: {
      score: number,
      strengths: string[],
      improvements: string[],
      suggestions: string[],
      exampleResponse: string
    },
    timestamp: timestamp
  }[],
  createdAt: timestamp,
  status: string // 'active', 'completed', 'abandoned'
}
```

## AI Integration Specifications

### Gemini 2.5 Flash Configuration
```javascript
const geminiClient = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});
```

### Resume Analysis Prompt Structure
```
Role: Expert resume analyzer and career coach
Task: Analyze resume for [JOB_TITLE] position in [INDUSTRY]
Input: [RESUME_CONTENT]
Output Format: JSON with specific scoring criteria
Context: Modern hiring practices, ATS compatibility, industry standards
```

### Interview Question Generation Prompt Structure
```
Role: Senior technical recruiter and interview specialist
Task: Generate role-specific interview questions
Input: Job requirements, experience level, resume content
Output Format: Categorized questions with evaluation criteria
Context: Current interview trends, competency-based assessment
```

## API Route Specifications

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Resume Management Endpoints
- `POST /api/resume/upload` - File upload and metadata storage
- `POST /api/resume/analyze` - Trigger AI analysis
- `GET /api/resume/[id]` - Retrieve specific resume analysis
- `GET /api/resume/history` - User's resume history

### Interview Preparation Endpoints
- `POST /api/interview/generate-questions` - Create interview questions
- `POST /api/interview/evaluate-response` - Analyze user responses
- `GET /api/interview/session/[id]` - Retrieve interview session

## Security Implementation

### Authentication & Authorization
- Firebase Auth token verification
- Middleware protection for API routes
- User data isolation by userId
- Input validation and sanitization

### Data Protection
- File upload size limits and type validation
- Secure file storage with Firebase Storage
- Environment variable management
- CORS configuration for API endpoints

## Performance Considerations

### Optimization Strategies
- Next.js App Router for optimal routing
- Component lazy loading
- Image optimization with Next.js Image component
- API response caching for repeated requests
- Database query optimization

### Monitoring & Analytics
- Error tracking and logging
- Performance metrics collection
- User engagement analytics
- AI API usage monitoring

## Development Workflow

### Project Setup
```bash
# Initialize Next.js project
npx create-next-app@latest resume-app --app

# Install dependencies
npm install firebase @google/generative-ai
npm install pdf-parse mammoth multer sharp
npm install @tailwindcss/forms @headlessui/react

# Environment setup
cp .env.example .env.local
```

### Key Dependencies
- **Next.js 14**: React framework with App Router
- **Firebase**: Authentication, database, storage
- **@google/generative-ai**: Gemini API integration
- **pdf-parse**: PDF file parsing
- **mammoth**: DOCX file parsing
- **Tailwind CSS**: Styling framework

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Business Logic

### Resume Scoring Algorithm
1. **Content Quality (30%)**: Relevance, achievements, experience alignment
2. **Structure & Format (25%)**: Organization, readability, ATS compatibility
3. **Impact & Quantification (20%)**: Metrics, results, concrete outcomes
4. **Keyword Optimization (15%)**: Industry terms, role-specific keywords
5. **Professional Presentation (10%)**: Grammar, consistency, visual appeal

### Interview Evaluation Criteria
1. **Relevance (30%)**: Direct question addressing
2. **Structure (20%)**: Clear organization (STAR method for behavioral)
3. **Depth (20%)**: Sufficient detail and insight
4. **Professionalism (20%)**: Appropriate tone and language
5. **Impact (10%)**: Demonstrates value and results

## User Experience Flow

### Resume Analysis Journey
1. User uploads resume file
2. System parses and extracts content
3. AI analyzes content against job requirements
4. Detailed feedback and scores generated
5. Actionable recommendations provided
6. Progress tracking and history maintained

### Interview Preparation Journey
1. User selects job role and industry
2. AI generates relevant questions
3. User practices responses
4. Real-time evaluation and feedback
5. Improvement suggestions provided
6. Session results saved for review

## Error Handling Strategy

### Client-Side Error Handling
- Form validation and user feedback
- Loading states and progress indicators
- Graceful degradation for API failures
- Retry mechanisms for transient failures

### Server-Side Error Handling
- Comprehensive error logging
- Structured error responses
- Fallback mechanisms for AI failures
- Rate limiting and abuse prevention

## Deployment & Scaling

### Deployment Strategy
- **Primary**: Vercel for Next.js optimization
- **Alternative**: Firebase Hosting
- **Database**: Firebase Firestore with auto-scal