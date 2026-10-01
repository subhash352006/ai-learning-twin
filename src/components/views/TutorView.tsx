import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Code2,
  CheckSquare,
  Terminal,
  Send,
  Copy,
  Check,
  ArrowRight,
  BrainCircuit,
  Lightbulb,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { GeminiService } from '../../services/gemini';
import { TutorResponse } from '../../types';

const PRESET_TOPICS = [
  'Overfitting & Underfitting: Bias-Variance Tradeoff',
  'Precision vs. Recall & Confusion Matrices',
  'Data Leakage & Preprocessing Scalers',
  'NumPy Vectorization & Performance Idioms',
  'Gradient Descent & Learning Rate Dynamics',
];

export const TutorView: React.FC = () => {
  const { profile, selectedTopicForTutor, setSelectedTopicForTutor, navigateTo } = useLearner();
  const [currentTopic, setCurrentTopic] = useState(
    selectedTopicForTutor || profile.recommendedNextTopic || PRESET_TOPICS[0]
  );
  const [activeMode, setActiveMode] = useState<'explain' | 'example' | 'quiz' | 'coding'>('explain');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorData, setTutorData] = useState<TutorResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');

  // Fetch tutor response on topic or mode change
  const fetchTutorResponse = async (topic: string, mode: 'explain' | 'example' | 'quiz' | 'coding') => {
    setIsLoading(true);
    try {
      const { response } = await GeminiService.generateTutorResponse(topic, mode, profile);
      setTutorData(response);
    } catch (err) {
      console.error('Error generating tutor response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorResponse(currentTopic, activeMode);
  }, [currentTopic, activeMode]);

  const handleModeClick = (mode: 'explain' | 'example' | 'quiz' | 'coding') => {
    if (mode === 'quiz') {
      navigateTo('quiz');
      return;
    }
    if (mode === 'coding') {
      navigateTo('coding');
      return;
    }
    setActiveMode(mode);
  };

  const handleSelectTopic = (topic: string) => {
    setCurrentTopic(topic);
    setSelectedTopicForTutor(topic);
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopicInput.trim()) {
      handleSelectTopic(customTopicInput.trim());
      setCustomTopicInput('');
    }
  };

  const copySnippet = () => {
    if (tutorData?.codeSnippet) {
      navigator.clipboard.writeText(tutorData.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Adaptive AI Tutor
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Calibrated for {profile.estimatedLevel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized AI Learning Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explanations adapted dynamically to your cognitive twin profile and identified friction points.
          </p>
        </div>

        {/* Quick Twin Context badge */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1 sm:text-right">
          <div className="text-slate-400">Targeting Misconception:</div>
          <div className="text-amber-400 font-semibold truncate max-w-xs">
            {profile.misconceptions[0] || 'Overfitting vs Underfitting'}
          </div>
        </div>
      </div>

      {/* Topic Selector Bar */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Select Topic to Explore
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((topic) => {
            const isSelected = currentTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => handleSelectTopic(topic)}
                className={`text-xs px-3.5 py-2 rounded-xl font-medium transition ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Custom topic input */}
        <form onSubmit={handleCustomTopicSubmit} className="flex gap-2 max-w-md pt-1">
          <input
            type="text"
            placeholder="Or type any AI/ML topic (e.g. Backprop)..."
            value={customTopicInput}
            onChange={(e) => setCustomTopicInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-700"
          >
            <Send className="w-3 h-3" />
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Action Mode Buttons: Explain Simply, Give Example, Quiz Me, Give Coding Task */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => handleModeClick('explain')}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
            activeMode === 'explain'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Explain Simply</span>
          <span className="text-[10px] text-slate-400">Analogy & Intuition</span>
        </button>

        <button
          onClick={() => handleModeClick('example')}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
            activeMode === 'example'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Give Example</span>
          <span className="text-[10px] text-slate-400">Scikit-Learn / Code</span>
        </button>

        <button
          onClick={() => handleModeClick('quiz')}
          className="p-3.5 rounded-xl border bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40 hover:bg-slate-800/60 flex flex-col items-center justify-center gap-1.5 transition text-center group"
        >
          <CheckSquare className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>Quiz Me</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </span>
          <span className="text-[10px] text-slate-400">Adaptive 5 Questions</span>
        </button>

        <button
          onClick={() => handleModeClick('coding')}
          className="p-3.5 rounded-xl border bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 hover:bg-slate-800/60 flex flex-col items-center justify-center gap-1.5 transition text-center group"
        >
          <Terminal className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>Give Coding Task</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </span>
          <span className="text-[10px] text-slate-400">Interactive Coding</span>
        </button>
      </div>

      {/* Tutor Response Output Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-amber-300 font-medium">
              Gemini is tailoring an explanation for your {profile.estimatedLevel} mental model...
            </p>
          </div>
        ) : tutorData ? (
          <div className="space-y-6">
            {/* Topic pill */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">{tutorData.topic}</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 capitalize">
                Mode: {tutorData.mode}
              </span>
            </div>

            {/* Markdown content formatted */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4 font-sans">
              {tutorData.content}
            </div>

            {/* Code Snippet Box (if available) */}
            {tutorData.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Python Example</span>
                  <button
                    onClick={copySnippet}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300/90 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{tutorData.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Key Takeaways */}
            {tutorData.keyTakeaways && tutorData.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Key Takeaways
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {tutorData.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Follow Up Action Banner */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {tutorData.suggestedFollowUp || 'Ready to test your understanding? Take the 5-question Adaptive Quiz.'}
              </span>
              <button
                onClick={() => navigateTo('quiz')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105"
              >
                <span>Take Adaptive Quiz Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Select a mode above to start learning with AI.
          </div>
        )}
      </div>
    </div>
  );
};
