import React from 'react';
import {
  BrainCircuit,
  ArrowRight,
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const LandingView: React.FC = () => {
  const { navigateTo, profile, loadDemoProfile } = useLearner();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-10 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Adaptive AI Tutor</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto">
          AI Learning <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">Twin</span>
        </h1>

        <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          &ldquo;An adaptive AI tutor that builds a live model of how each learner understands AI.&rdquo;
        </p>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Static tutorials treat every engineer the same. AI Learning Twin models your mental map, detects exact misconceptions, and adapts every lesson, quiz, and coding challenge in real time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('goals')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <span>Start Diagnostic</span>
            <ArrowRight className="w-5 h-5 font-bold" />
          </button>

          {profile.isDiagnosticComplete ? (
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-slate-200 hover:text-white transition"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Resume Active Twin ({profile.currentOverallMastery}%)</span>
            </button>
          ) : (
            <button
              onClick={loadDemoProfile}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-white transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Hackathon Demo Mode</span>
            </button>
          )}
        </div>

        {/* Live Metrics preview banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black text-amber-400">10-Q</span>
            <p className="text-xs text-slate-400 mt-0.5">Adaptive Diagnostic</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black text-amber-400">Live</span>
            <p className="text-xs text-slate-400 mt-0.5">Cognitive Twin Graph</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black text-amber-400">Gemini</span>
            <p className="text-xs text-slate-400 mt-0.5">Misconception Detection</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black text-amber-400">Dynamic</span>
            <p className="text-xs text-slate-400 mt-0.5">Code & Quiz Adaptation</p>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Paradigm Shift</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Why traditional AI courses leave learners stuck with silent misconceptions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem Card */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-200">The Problem: Static AI Learning</h3>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Linear Syllabus:</strong> Beginners and experienced developers are forced through the identical rigid curriculum.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Invisible Misconceptions:</strong> Passing a multiple-choice quiz by guessing hides fundamental flaws (like confusing overfitting with optimal training).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Disconnected Chatbots:</strong> Standard LLM chatbots forget your previous mistakes, repeating the same generic tutorials.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.08)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/40">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-amber-200">The Solution: AI Learning Twin</h3>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Persistent Cognitive Model:</strong> Builds a live digital twin tracking your exact mastery across Python, Data Handling, ML, and Evaluation.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Deep Misconception Diagnosis:</strong> Google Gemini analyzes the reasoning behind wrong answers, pinpointing cognitive pitfalls.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Adaptive Feedback Loop:</strong> Every quiz result and code submission updates your twin and re-routes your recommended next topic.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>The 5-Stage Adaptive Loop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How It Works</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Not just a question generator—a continuous feedback architecture
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm group-hover:scale-110 transition">
              01
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Diagnose</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take an 8–10 question multi-tier assessment covering Python, pandas, bias-variance tradeoffs, and evaluation metrics.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm group-hover:scale-110 transition">
              02
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Model Twin</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini analyzes answer patterns, categorizes cognitive friction points, and spawns your live Learning Twin dashboard.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm group-hover:scale-110 transition">
              03
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Personalized Tutor</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your weakest concepts with tailored explanations: Explain Simply, Give Example, Quiz Me, or Coding Tasks.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm group-hover:scale-110 transition">
              04
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Adapt & Elevate</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Targeted 5-question adaptive quizzes and coding challenges resolve the misconception and elevate your mastery level.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
          Ready to construct your AI Learning Twin?
        </h3>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          Start the 3-minute diagnostic assessment to map your current knowledge and discover your personalized learning pathway.
        </p>
        <button
          onClick={() => navigateTo('goals')}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-base font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition hover:scale-105"
        >
          <span>Start Diagnostic Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
};
