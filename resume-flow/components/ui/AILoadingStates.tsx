'use client';

import { useEffect, useState } from 'react';

export interface AILoadingState {
  phase: 'resume-analysis' | 'interview-generation';
  step: number;
  totalSteps: number;
  message: string;
  progress: number; // 0-100
}

interface AILoadingStatesProps {
  phase: 'resume-analysis' | 'interview-generation';
  onComplete?: () => void;
}

const RESUME_ANALYSIS_STEPS = [
  { message: "🔍 Parsing your resume...", duration: 2000 },
  { message: "📊 Analyzing content structure...", duration: 3000 },
  { message: "🎯 Evaluating ATS compatibility...", duration: 2500 },
  { message: "📈 Calculating performance scores...", duration: 3500 },
  { message: "💡 Generating personalized recommendations...", duration: 4000 },
  { message: "✨ Finalizing your analysis...", duration: 2000 }
];

const INTERVIEW_GENERATION_STEPS = [
  { message: "🧠 Understanding your background...", duration: 2500 },
  { message: "💼 Researching industry standards...", duration: 3000 },
  { message: "❓ Crafting personalized questions...", duration: 4000 },
  { message: "🎯 Tailoring difficulty levels...", duration: 3000 },
  { message: "📝 Preparing your interview session...", duration: 2500 }
];

export default function AILoadingStates({ phase, onComplete }: AILoadingStatesProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = phase === 'resume-analysis' ? RESUME_ANALYSIS_STEPS : INTERVIEW_GENERATION_STEPS;
  const totalSteps = steps.length;

  useEffect(() => {
    if (currentStep >= totalSteps) {
      setIsComplete(true);
      setProgress(100);
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
      return;
    }

    const currentStepData = steps[currentStep];
    const stepProgress = (currentStep / totalSteps) * 100;
    
    // Animate progress within the current step
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextStepProgress = ((currentStep + 1) / totalSteps) * 100;
        const increment = (nextStepProgress - stepProgress) / (currentStepData.duration / 50);
        return Math.min(prev + increment, nextStepProgress);
      });
    }, 50);

    // Move to next step after duration
    const stepTimeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, currentStepData.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [currentStep, totalSteps, steps, onComplete]);

  const currentMessage = currentStep < totalSteps ? steps[currentStep].message : "🎉 Complete!";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* AI Brain Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <div className="text-3xl animate-pulse">🤖</div>
        </div>
        
        {/* Thinking Dots Animation */}
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Current Step Message */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'resume-analysis' ? 'Analyzing Your Resume' : 'Generating Interview Questions'}
        </h3>
        <p className="text-lg text-gray-600 animate-pulse">
          {currentMessage}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex space-x-2 mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-green-500 scale-110'
                : index === currentStep
                ? 'bg-indigo-500 animate-pulse scale-125'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Estimated Time */}
      {!isComplete && (
        <div className="text-sm text-gray-500 text-center">
          <p>This usually takes 15-30 seconds</p>
          <p className="mt-1">Our AI is working hard to give you the best results! ⚡</p>
        </div>
      )}

      {/* Completion State */}
      {isComplete && (
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-semibold text-green-600">
            {phase === 'resume-analysis' ? 'Analysis Complete!' : 'Questions Ready!'}
          </p>
        </div>
      )}
    </div>
  );
}

// Additional loading component for quick states
export function QuickLoadingState({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}