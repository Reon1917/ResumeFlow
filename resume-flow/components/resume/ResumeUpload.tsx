'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../lib/auth-context';
import { createResume } from '../../lib/firestore';

interface ResumeUploadProps {
  onUploadComplete?: () => void;
  onAnalysisComplete?: (result: any, fileName: string, jobTitle: string, industry: string) => void;
  onProcessingStart?: () => void;
  onError?: () => void;
}

export default function ResumeUpload({ onUploadComplete, onAnalysisComplete, onProcessingStart, onError }: ResumeUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user || !selectedFile || !jobTitle || !industry) {
      alert('Please fill in all fields and select a file');
      return;
    }

    const file = selectedFile;
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      console.log('📄 Starting resume analysis (no database storage)');

      // Trigger the processing steps animation
      onProcessingStart?.();

      // Convert file to base64 for AI processing
      const fileData = await fileToBase64(file);
      
      // Add a small delay to let the processing steps animation start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send directly to AI API for analysis (bypass Firestore)
      const response = await fetch('/api/gemini/analyze-resume-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData,
          fileType: file.type,
          jobTitle,
          industry
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();
      console.log('🤖 AI Analysis Result:', result);

      // Add a small delay to let the processing steps complete their animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Pass results directly to dashboard
      onAnalysisComplete?.(result.data, file.name, jobTitle, industry);

      // Reset form
      setJobTitle('');
      setIndustry('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadComplete?.();
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Reset processing state on error
      onError?.();
      
      // Show user-friendly error message
      let errorMessage = 'Failed to analyze resume. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Failed to extract text')) {
          errorMessage = 'Could not extract text from the PDF. Please ensure the file is not corrupted or password-protected.';
        } else if (error.message.includes('Failed to parse PDF')) {
          errorMessage = 'Invalid PDF file. Please try uploading a different PDF.';
        } else if (error.message.includes('AI analysis service')) {
          errorMessage = 'AI analysis service is temporarily unavailable. Please try again in a few minutes.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-5 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Upload Resume for Analysis</h3>
        <p className="text-sm text-slate-600 mt-1">Get AI-powered feedback on your resume</p>
      </div>
      
      <form onSubmit={handleUpload} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-2">
              Target Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Frontend Developer"
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={uploading}
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Consulting">Consulting</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-2">
            Resume File
          </label>
          <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
            selectedFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-slate-300 hover:border-slate-400'
          }`}>
            <div className="space-y-1 text-center">
              {selectedFile ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-600">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-green-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="resume" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Change file</span>
                      <input
                        type="file"
                        id="resume"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        required
                        disabled={uploading}
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="resume" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        id="resume"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        required
                        disabled={uploading}
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF or Word document up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-600">
            {uploading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Analyzing your resume with AI...</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              'Upload & Analyze'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}