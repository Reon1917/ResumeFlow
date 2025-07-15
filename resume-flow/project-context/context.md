It appears you've provided a very comprehensive project context for your "ResumeFlow" web app, which is great\! I'll go through and update it to reflect the latest information and best practices regarding Gemini and related technologies.

Here's an updated version of your project context, incorporating the most current details from Gemini documentation:

-----

# Resume Scanning & Interview Prep Web App - Project Context

## Project Overview

**Project Name**: ResumeFlow (or similar resume optimization platform)
**Tech Stack**: Next.js 15 (App Router), Firebase, Gemini 2.5 Flash API
**Purpose**: Comprehensive resume analysis, scoring, feedback generation, and interview preparation platform

## Core Features

### 1\. Resume Analysis System

  - **Upload & Parse**: Support for PDF, DOCX, and text file uploads. Gemini 2.5 Flash supports PDF and plain text inputs natively for analysis (up to 50MB per file for API/Cloud Storage, 7MB for direct console uploads). For DOCX, client-side parsing (e.g., using `mammoth.js`) to extract text before sending to Gemini remains the recommended approach.
  - **AI-Powered Analysis**: Gemini 2.5 Flash integration for comprehensive resume evaluation. Leverages the model's enhanced reasoning capabilities and long context window (up to 1 million tokens).
  - **Scoring Framework**: 100-point scoring system across 5 key areas.
  - **ATS Compatibility**: Applicant Tracking System optimization recommendations.
  - **Industry Customization**: Role-specific and industry-specific analysis, enhanced by Gemini's ability to understand nuanced context.

### 2\. Interview Preparation Module

  - **Question Generation**: AI-generated interview questions based on resume and job requirements, leveraging Gemini's ability to generate structured output.
  - **Response Evaluation**: Real-time feedback on interview answers, potentially using Gemini's text generation and evaluation capabilities. For real-time spoken responses, consider exploring Gemini 2.5 Flash with Live API native audio (currently in preview) for even lower latency and enhanced voice quality.
  - **Practice Sessions**: Interactive interview simulation environment.
  - **Progress Tracking**: Performance analytics and improvement recommendations.

### 3\. User Management

  - **Authentication**: Firebase Auth integration.
  - **Profile Management**: User preferences, job targets, industry focus.
  - **History Tracking**: Resume versions, analysis results, interview sessions.
  - **Dashboard**: Centralized user interface for all features.

## Technical Architecture

### Frontend (Next.js 15)

```
src/app/
├── (auth)/             # Authentication pages
├── dashboard/          # Main application interface
├── api/                # API routes (for server-side Gemini calls)
├── components/         # Reusable UI components
├── lib/                # Utility libraries and configurations
└── hooks/              # Custom React hooks
```

*Note: Next.js 15 is the latest version, ensuring you're using the most up-to-date features like the App Router.*

### Backend (Firebase + API Routes)

  - **Authentication**: Firebase Auth for user management.
  - **Database**: Firestore for user data, resume metadata, analysis results.
  - **Storage**: Firebase Storage for secure resume file uploads.
  - **API Layer**: Next.js API routes for business logic. This is the recommended place to make calls to the Gemini API to keep your API key secure.
  - **AI Integration**: Gemini 2.5 Flash for content analysis and generation.

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
  fileUrl: string, // URL from Firebase Storage
  jobTitle: string,
  industry: string,
  uploadedAt: timestamp,
  status: string, // 'uploaded', 'parsing', 'analyzing', 'analyzed', 'error'
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
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // API key loaded securely

const model = geminiClient.getGenerativeModel({
  model: 'gemini-2.5-flash', // Using the generally available model name
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192, // Max output tokens for Gemini 2.5 Flash is 65,535 (default)
  },
  // thinkingBudget: 'adaptive' or 'calibrated' for finer control (optional, more advanced)
});
```

*Note: `gemini-2.0-flash-exp` might be an older preview model. The current generally available model is typically just `gemini-2.5-flash`. The `maxOutputTokens` for Gemini 2.5 Flash can go up to 65,535 tokens.*

### Resume Analysis Prompt Structure

```
Role: Expert resume analyzer and career coach. Your goal is to provide comprehensive, actionable feedback to help job seekers optimize their resumes for [JOB_TITLE] positions in the [INDUSTRY] sector.
Task: Analyze the provided resume content. Evaluate it based on modern hiring practices, Applicant Tracking System (ATS) compatibility, and industry standards.
Input: [RESUME_CONTENT] (This will be the extracted text from PDF/DOCX or plain text)
Output Format: JSON with the following structure, including detailed scoring criteria, specific strengths, areas for improvement, and ATS compatibility issues.
Context: Consider the nuances of the specified job title and industry. Emphasize quantifiable achievements and keywords relevant to [JOB_TITLE] in [INDUSTRY]. Ensure feedback is constructive and clear.
```

### Interview Question Generation Prompt Structure

```
Role: Senior technical recruiter and interview specialist.
Task: Generate role-specific interview questions for a [JOB_TITLE] position at [EXPERIENCE_LEVEL] in the [INDUSTRY] based on the provided resume and general job requirements.
Input:
- Resume Content: [RESUME_CONTENT]
- Job Requirements (if available): [JOB_REQUIREMENTS_TEXT]
- Experience Level: [EXPERIENCE_LEVEL] (e.g., "Entry-level", "Mid-level", "Senior")
Output Format: Categorized questions (Technical, Behavioral, Situational) with suggested evaluation criteria for each question. The output should be a JSON array of question objects, each including the question text, category, and key points for evaluation.
Context: Focus on competency-based assessment and current interview trends. Ensure questions are challenging yet fair, designed to elicit detailed and relevant responses.
```

## API Route Specifications

### Authentication Endpoints

  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/logout` - User logout

### Resume Management Endpoints

  - `POST /api/resume/upload` - File upload to Firebase Storage and metadata storage in Firestore.
  - `POST /api/resume/analyze` - Trigger AI analysis. This endpoint would receive the file URL/content and initiate the Gemini call.
  - `GET /api/resume/[id]` - Retrieve specific resume analysis.
  - `GET /api/resume/history` - User's resume history.

### Interview Preparation Endpoints

  - `POST /api/interview/generate-questions` - Create interview questions based on user input and potentially stored resume data.
  - `POST /api/interview/evaluate-response` - Analyze user responses (text or potentially audio if Live API is integrated).
  - `GET /api/interview/session/[id]` - Retrieve interview session data.

## Security Implementation

### Authentication & Authorization

  - Firebase Auth token verification on all protected API routes.
  - Next.js middleware for route protection.
  - User data isolation by `userId` in Firestore Security Rules.
  - Robust input validation and sanitization on all API inputs to prevent injection attacks.

### Data Protection

  - File upload size limits and type validation on the client and server.
  - Secure file storage with Firebase Storage (e.g., granular security rules).
  - Environment variable management for API keys and sensitive configurations (never hardcode).
  - CORS configuration for API endpoints to restrict access.
  - **Crucially, Gemini API keys should *never* be exposed on the client-side.** All calls to the Gemini API should be proxied through your Next.js API routes or Firebase Functions.

## Performance Considerations

### Optimization Strategies

  - Next.js 15 App Router for optimized routing and server components.
  - Component lazy loading for improved initial load times.
  - Image optimization with Next.js Image component.
  - API response caching for repeated requests (e.g., resume history).
  - Database query optimization (e.g., efficient Firestore queries, indexing).
  - **Gemini's `thinkingBudget`**: For Gemini 2.5 Flash, you can use `thinkingBudget` in `generationConfig` to control the balance between response quality, latency, and cost. This allows for fine-tuning performance for different use cases.

### Monitoring & Analytics

  - Error tracking and logging (e.g., Firebase Crashlytics, Cloud Logging).
  - Performance metrics collection (e.g., Vercel Analytics, Google Cloud Monitoring).
  - User engagement analytics (e.g., Google Analytics, Firebase Analytics).
  - AI API usage monitoring to track costs and quota limits.

## Development Workflow

### Project Setup

```bash


# Install dependencies
npm install firebase @google/gen-ai
npm install pdf-parse mammoth # For client-side parsing of DOCX/PDF if needed before sending to AI


# Environment setup
cp .env.example .env.local
```

### Key Dependencies

  - **Next.js 15**: React framework with App Router, server components, and API routes.
  - **Firebase**: Authentication, Firestore (NoSQL database), Firebase Storage (file storage).
  - **@google/generative-ai**: Official Google SDK for interacting with Gemini API.
  - **pdf-parse**: For extracting text content from PDF files on the server-side.
  - **mammoth**: For converting DOCX files to HTML/text on the server or client-side.
  - **Tailwind CSS**: Utility-first CSS framework for styling.
  - **@headlessui/react, @tailwindcss/forms**: For building accessible and styled UI components.

### Development Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
```

## Business Logic

### Resume Scoring Algorithm

1.  **Content Quality (30%)**: Relevance to target role, impact of achievements, clarity and conciseness of descriptions, alignment with job requirements.
2.  **Structure & Format (25%)**: Logical organization, readability, consistent formatting, effective use of white space, ATS scannability (e.g., standard headings, simple fonts).
3.  **Impact & Quantification (20%)**: Use of metrics, quantifiable results, action verbs, demonstration of direct contributions and value.
4.  **Keyword Optimization (15%)**: Inclusion of relevant industry-specific terms, role-specific keywords, and phrases commonly found in job descriptions for the target role.
5.  **Professional Presentation (10%)**: Grammar, spelling, punctuation, consistency in tense and style, overall visual appeal.

### Interview Evaluation Criteria

1.  **Relevance (30%)**: Directly answers the question, avoids tangential information, addresses all parts of a multi-part question.
2.  **Structure (20%)**: Clear and logical organization of thoughts, especially using frameworks like STAR (Situation, Task, Action, Result) for behavioral questions.
3.  **Depth & Detail (20%)**: Provides sufficient detail, specific examples, and insights without excessive rambling. Demonstrates a clear understanding of the topic.
4.  **Professionalism & Communication (20%)**: Appropriate tone and language, clear articulation, confidence, enthusiasm, and effective communication skills.
5.  **Impact & Learning (10%)**: Highlights lessons learned, demonstrates problem-solving abilities, and showcases positive outcomes or growth from experiences.

## User Experience Flow

### Resume Analysis Journey

1.  User authenticates and navigates to the resume upload section.
2.  User uploads their resume file (PDF, DOCX, or text).
3.  The system parses the file content.
4.  The extracted content is sent to the Gemini API for comprehensive AI analysis.
5.  A detailed report is generated, displaying the overall score, section-specific scores, strengths, areas for improvement, and ATS compatibility issues.
6.  Users can view their resume analysis history on their dashboard.

### Interview Preparation Journey

1.  User selects a target job role and industry.
2.  The AI generates a set of personalized interview questions based on the selected criteria and potentially the user's analyzed resume.
3.  User practices responding to questions in an interactive environment (e.g., typing or speaking).
4.  For each response, the system provides real-time AI-powered evaluation, feedback, and improvement suggestions.
5.  The session results, including questions, responses, and evaluations, are saved for later review and progress tracking.

## Error Handling Strategy

### Client-Side Error Handling

  - Robust form validation with immediate user feedback.
  - Clear loading states, progress indicators, and informative error messages during API calls.
  - Graceful degradation for API failures (e.g., showing a generic error message, suggesting retry).
  - Client-side retry mechanisms for transient network failures.

### Server-Side Error Handling

  - Comprehensive error logging (e.g., using a dedicated logging service or Firebase Cloud Logging) for all API routes and AI interactions.
  - Structured error responses from API endpoints (e.g., JSON with `code`, `message` for client consumption).
  - Fallback mechanisms for AI failures (e.g., if Gemini API returns an error, use a default response or log the issue for manual review).
  - Rate limiting and abuse prevention on API endpoints to protect resources and prevent excessive AI usage.
  - Centralized error handling middleware in Next.js API routes.

## Deployment & Scaling

### Deployment Strategy

  - **Primary**: Vercel for Next.js optimization and seamless deployment.
  - **Alternative**: Firebase Hosting for static assets, Next.js server rendered pages could be deployed as Cloud Functions.
  - **Database**: Firebase Firestore provides auto-scaling and serverless capabilities, well-suited for varying loads.
  - **File Storage**: Firebase Storage scales automatically for file uploads.
  - **AI**: Gemini API handles its own scaling, you primarily manage your quota.

This updated context reflects current best practices and the capabilities of Gemini 2.5 Flash, particularly emphasizing the secure use of API keys via server-side calls in Next.js API routes.