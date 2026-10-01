import React from 'react';
import {
  BrainCircuit,
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Code2,
  Database,
  Gauge,
  Sliders,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const LandingView: React.FC = () => {
  const { navigateTo, profile, loadDemoProfile } = useLearner();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Central Product Differentiator Badge (Requirement 17) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/10">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Most AI tutors adapt the answer. AI Learning Twin adapts the learning experience.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto">
          AI Learning{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
            Twin
          </span>
        </h1>

        <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          &ldquo;An adaptive AI tutor that builds a live model of how each learner understands AI.&rdquo;
        </p>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Instead of generic chatbot explanations, AI Learning Twin builds a living cognitive model tracking your knowledge, mental misconceptions, confidence calibration, and learning behaviors.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('goals')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <span>Start Adaptive Diagnostic</span>
            <ArrowRight className="w-5 h-5 font-bold" />
          </button>

          {profile.isDiagnosticComplete ? (
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white transition"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Resume Learner Twin ({profile.currentOverallMastery}%)</span>
            </button>
          ) : (
            <button
              onClick={loadDemoProfile}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Hackathon Demo Twin</span>
            </button>
          )}
        </div>

        {/* 4 Topic Modes Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Python</span>
            <span className="text-base font-bold text-white">Debug Mode</span>
            <p className="text-[11px] text-slate-400">Fix reasoning bugs in model code</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Data</span>
            <span className="text-base font-bold text-white">Cleaning Mode</span>
            <p className="text-[11px] text-slate-400">Decide how to fix dirty data</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">ML</span>
            <span className="text-base font-bold text-white">Experiment Mode</span>
            <p className="text-[11px] text-slate-400">Live bias-variance simulator</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Evaluation</span>
            <span className="text-base font-bold text-white">Reasoning Mode</span>
            <p className="text-[11px] text-slate-400">Defend metric choice in oncology</p>
          </div>
        </div>
      </section>

      {/* CORE LEARNING LOOP (Requirement 3) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Adaptive Loop Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How The Learner Twin Evolves
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Not a static question bot: a closed-loop system updating difficulty and activity selection after every action
          </p>
        </div>

        {/* 9-step visible loop cards */}
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 1</span>
            <div className="text-xs font-bold text-white">DIAGNOSE</div>
            <p className="text-[10px] text-slate-400">Multi-tier test with confidence</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 2</span>
            <div className="text-xs font-bold text-white">BUILD TWIN</div>
            <p className="text-[10px] text-slate-400">Model mastery & mental state</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 3</span>
            <div className="text-xs font-bold text-white">FIND FRICTION</div>
            <p className="text-[10px] text-slate-400">Pinpoint exact misconception</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 4</span>
            <div className="text-xs font-bold text-white">SELECT MODE</div>
            <p className="text-[10px] text-slate-400">Teach-Back, Experiment, etc.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 5</span>
            <div className="text-xs font-bold text-white">EVALUATE & ADAPT</div>
            <p className="text-[10px] text-slate-400">Update mastery & difficulty</p>
          </div>
        </div>
      </section>

      {/* TEACH-BACK MODE HIGHLIGHT (Requirement 7) */}
      <section className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Differentiating Feature: Teach-Back Mode</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Instead of the AI teaching you, you teach the AI.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When learners only read explanations, they fall into passive comprehension illusions. In Teach-Back mode, you articulate concepts in your own words. The Learning Twin identifies subtle reasoning reversals (e.g. confusing training accuracy with generalization) and delivers pinpoint cognitive corrections.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigateTo('goals')}
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition hover:scale-105"
            >
              Start Diagnostic Experience
            </button>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Paradigm Shift</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Why traditional static chatbots fail to resolve deep cognitive misconceptions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-200">The Problem: Generic Chatbots</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>No Persistent Learner Model:</strong> The AI forgets previous mistakes and treats every interaction like a fresh query.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Unchecked Overconfidence:</strong> Learners guess correct answers on multiple-choice quizzes while holding severe misconceptions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Identical Interaction Modes:</strong> Reading walls of text for Python, Data, and Math without subject-specific practice.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/40">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-amber-200">The Solution: AI Learning Twin</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Live Cognitive Model:</strong> Tracks mastery, strengths, weaknesses, and confidence calibration across 4 AI domains.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Confidence vs Knowledge Detection:</strong> Distinguishes true conceptual mastery from dangerous overconfidence.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Subject-Specific Workspaces:</strong> Debugging code for Python, cleaning tables for Data, experiments for ML, and reasoning for Evaluation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
