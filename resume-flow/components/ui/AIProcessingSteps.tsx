'use client';

import { useState, useEffect } from 'react';

interface ProcessingStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    duration: number; // in milliseconds
    completed: boolean;
}

interface AIProcessingStepsProps {
    isProcessing: boolean;
    onComplete?: () => void;
}

const getRandomSteps = (): ProcessingStep[] => {
    const stepVariations = [
        [
            { id: '1', title: 'Parsing Resume Structure', description: 'Analyzing document layout and extracting text content...', icon: '📄', duration: 1500, completed: false },
            { id: '2', title: 'Content Analysis', description: 'Evaluating work experience, skills, and achievements...', icon: '🔍', duration: 2000, completed: false },
            { id: '3', title: 'ATS Compatibility Check', description: 'Testing resume against applicant tracking systems...', icon: '🤖', duration: 1800, completed: false },
            { id: '4', title: 'Industry Benchmarking', description: 'Comparing against industry standards and best practices...', icon: '📊', duration: 2200, completed: false },
            { id: '5', title: 'Generating Recommendations', description: 'Creating personalized improvement suggestions...', icon: '💡', duration: 1600, completed: false },
        ],
        [
            { id: '1', title: 'Document Preprocessing', description: 'Extracting and cleaning resume content...', icon: '⚙️', duration: 1400, completed: false },
            { id: '2', title: 'Semantic Analysis', description: 'Understanding context and meaning of your experience...', icon: '🧠', duration: 2100, completed: false },
            { id: '3', title: 'Keyword Optimization', description: 'Identifying missing industry keywords and phrases...', icon: '🔑', duration: 1900, completed: false },
            { id: '4', title: 'Impact Assessment', description: 'Measuring the strength of your accomplishments...', icon: '🎯', duration: 2000, completed: false },
            { id: '5', title: 'Final Scoring', description: 'Calculating overall resume effectiveness score...', icon: '🏆', duration: 1500, completed: false },
        ],
        [
            { id: '1', title: 'AI Model Initialization', description: 'Loading specialized resume analysis algorithms...', icon: '🚀', duration: 1300, completed: false },
            { id: '2', title: 'Content Extraction', description: 'Intelligently parsing your professional information...', icon: '📋', duration: 1800, completed: false },
            { id: '3', title: 'Quality Assessment', description: 'Evaluating presentation and formatting quality...', icon: '✨', duration: 2200, completed: false },
            { id: '4', title: 'Market Analysis', description: 'Analyzing current job market trends and requirements...', icon: '📈', duration: 1700, completed: false },
            { id: '5', title: 'Report Generation', description: 'Compiling comprehensive feedback and insights...', icon: '📝', duration: 1900, completed: false },
        ]
    ];

    return stepVariations[Math.floor(Math.random() * stepVariations.length)];
};

export default function AIProcessingSteps({ isProcessing, onComplete }: AIProcessingStepsProps) {
    const [steps, setSteps] = useState<ProcessingStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isProcessing) {
            const randomSteps = getRandomSteps();
            setSteps(randomSteps);
            setCurrentStep(0);
            setIsVisible(true);

            console.log('🎭 AI Processing Steps initialized:', randomSteps.map(s => s.title));

            // Process steps sequentially
            let stepIndex = 0;
            const processNextStep = () => {
                if (stepIndex < randomSteps.length) {
                    const currentStepData = randomSteps[stepIndex];
                    console.log(`🔄 Step ${stepIndex + 1}: ${currentStepData.title} - ${currentStepData.description}`);

                    setCurrentStep(stepIndex);

                    setTimeout(() => {
                        setSteps(prev => prev.map((step, index) =>
                            index === stepIndex ? { ...step, completed: true } : step
                        ));

                        console.log(`✅ Step ${stepIndex + 1} completed: ${currentStepData.title}`);
                        stepIndex++;

                        if (stepIndex < randomSteps.length) {
                            setTimeout(processNextStep, 300); // Small delay between steps
                        } else {
                            console.log('🎉 All AI processing steps completed!');
                            setTimeout(() => {
                                setIsVisible(false);
                                onComplete?.();
                            }, 1000);
                        }
                    }, currentStepData.duration);
                }
            };

            processNextStep();
        }
    }, [isProcessing, onComplete]);

    if (!isVisible || steps.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">AI Analysis in Progress</h3>
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-slate-600">Processing...</span>
                </div>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${step.completed
                                ? 'bg-green-100 text-green-600'
                                : index === currentStep
                                    ? 'bg-blue-100 text-blue-600 animate-pulse'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                            {step.completed ? '✓' : step.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <h4 className={`text-sm font-medium transition-colors duration-300 ${step.completed
                                        ? 'text-green-900'
                                        : index === currentStep
                                            ? 'text-blue-900'
                                            : 'text-slate-500'
                                    }`}>
                                    {step.title}
                                </h4>
                                {index === currentStep && !step.completed && (
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                )}
                            </div>
                            <p className={`text-xs mt-1 transition-colors duration-300 ${step.completed
                                    ? 'text-green-700'
                                    : index === currentStep
                                        ? 'text-blue-700'
                                        : 'text-slate-400'
                                }`}>
                                {step.description}
                            </p>
                        </div>

                        {/* Progress bar for current step */}
                        {index === currentStep && !step.completed && (
                            <div className="flex-shrink-0 w-16">
                                <div className="w-full bg-slate-200 rounded-full h-1">
                                    <div
                                        className="bg-blue-600 h-1 rounded-full transition-all duration-300 animate-pulse"
                                        style={{ width: '60%' }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Overall progress */}
            <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(((currentStep + (steps[currentStep]?.completed ? 1 : 0)) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${((currentStep + (steps[currentStep]?.completed ? 1 : 0)) / steps.length) * 100}%`
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
}