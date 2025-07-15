# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:coverage` - Run Jest tests with coverage report

## Project Architecture

**ResumeFlow** is a Next.js 15 AI-powered resume analysis and interview preparation platform using Firebase and Google Gemini AI.

### Core Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth with Google SSO
- **Database**: Firestore
- **AI Integration**: Google Gemini 2.5 Flash API
- **Testing**: Jest with React Testing Library

### Key Directory Structure
```
app/
├── api/                    # API routes for server-side operations
│   ├── auth/              # Authentication endpoints
│   ├── gemini/            # AI analysis endpoints
│   └── resume/            # Resume processing endpoints
├── dashboard/             # Main authenticated user interface
├── login/                 # Authentication pages
└── page.tsx               # Landing page

components/
├── landing/               # Landing page components
├── resume/                # Resume upload and analysis components
├── interview/             # Interview preparation components
└── ui/                    # Shared UI components

lib/
├── firebase.ts            # Firebase configuration
├── gemini.ts              # Gemini AI integration
├── auth-context.tsx       # Authentication context provider
├── firestore.ts           # Firestore operations
└── hooks/                 # Custom React hooks
```

### Authentication Flow
The app uses Firebase Auth with Google SSO integration. The `AuthProvider` context manages authentication state and automatically creates/updates user profiles in Firestore upon sign-in.

### AI Integration Pattern
- All Gemini API calls are made server-side through Next.js API routes
- The `lib/gemini.ts` file contains three main functions:
  - `analyzeResume()` - Comprehensive resume analysis with scoring
  - `generateInterviewQuestions()` - Generate role-specific interview questions
  - `evaluateInterviewResponse()` - Evaluate user responses to interview questions
- Token usage is tracked and logged for cost monitoring

### Database Schema
- **Users**: Profile data, preferences, and authentication info
- **Resumes**: Resume metadata, analysis results, and feedback
- **Interview Sessions**: Questions, responses, and evaluations

### Environment Variables Required
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
GEMINI_API_KEY
```

### Testing Configuration
Jest is configured with jsdom environment and module name mapping for path aliases. Tests are located in `__tests__/` directory with coverage collection from `lib/`, `components/`, and `app/` directories.

### Key Features
1. **Resume Analysis**: AI-powered scoring across content, structure, impact, keywords, and presentation
2. **Interview Preparation**: Generated questions with response evaluation
3. **User Dashboard**: Centralized interface for all features
4. **Cost Tracking**: Token usage monitoring for AI API calls