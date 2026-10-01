import React from 'react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BookOpen,
  CheckSquare,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { ProgressBar } from '../common/ProgressBar';
import { DigitalTwinVisualizer } from '../common/DigitalTwinVisualizer';

export const DashboardView: React.FC = () => {
  const { profile, navigateTo, setSelectedTopicForTutor, loadDemoProfile } = useLearner();

  if (!profile.isDiagnosticComplete) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">No Learning Twin Detected Yet</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Take the 3-minute adaptive diagnostic so our Gemini engine can construct your personalized cognitive model.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button
            onClick={() => navigateTo('goals')}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition"
          >
            Start Diagnostic Assessment
          </button>
          <button
            onClick={loadDemoProfile}
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition"
          >
            Load Demo Twin Profile
          </button>
        </div>
      </div>
    );
  }

  const {
    currentMastery,
    strongestArea,
    weakestArea,
    misconceptions,
    estimatedLevel,
    recommendedNextTopic,
    recommendedDifficulty,
    shortReason,
  } = profile;

  const handleStartTutor = () => {
    setSelectedTopicForTutor(recommendedNextTopic);
    navigateTo('tutor');
  };

  const handleStartQuiz = () => {
    navigateTo('quiz');
  };

  const handleStartCoding = () => {
    navigateTo('coding');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Learner Cognitive Dashboard
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Session Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            AI Learning Twin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live probabilistic model of your conceptual mastery and cognitive hurdles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartTutor}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span>Launch AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer + Knowledge Area Progress Bars */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Twin Neural Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DigitalTwinVisualizer profile={profile} />

          {/* Reasoning from Gemini */}
          {shortReason && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Brain className="w-3.5 h-3.5" />
                <span>Gemini Diagnostic Synthesis</span>
              </div>
              <p className="leading-relaxed text-slate-400">{shortReason}</p>
            </div>
          )}
        </div>

        {/* Right Column: Mastery Breakdown & Diagnostic Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Knowledge Area Progress Bars Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Knowledge Areas Mastery</h3>
                <p className="text-xs text-slate-400">Current skill levels based on assessments & coding tasks</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                4 Core Domains
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <ProgressBar
                  label="Python"
                  subLabel="Syntax & Idiomatic Operations"
                  value={currentMastery.python}
                  color={currentMastery.python >= 70 ? 'emerald' : currentMastery.python >= 50 ? 'amber' : 'rose'}
                />
              </div>

              <div>
                <ProgressBar
                  label="Data Handling"
                  subLabel="Pandas & Preprocessing Pipelines"
                  value={currentMastery.data_handling}
                  color={currentMastery.data_handling >= 70 ? 'emerald' : currentMastery.data_handling >= 50 ? 'amber' : 'rose'}
                />
              </div>

              <div>
                <ProgressBar
                  label="ML Fundamentals"
                  subLabel="Bias-Variance & Algorithms"
                  value={currentMastery.ml_fundamentals}
                  color={currentMastery.ml_fundamentals >= 70 ? 'emerald' : currentMastery.ml_fundamentals >= 50 ? 'amber' : 'rose'}
                />
              </div>

              <div>
                <ProgressBar
                  label="Model Evaluation"
                  subLabel="Metrics & Cross-Validation"
                  value={currentMastery.model_evaluation}
                  color={currentMastery.model_evaluation >= 70 ? 'emerald' : currentMastery.model_evaluation >= 50 ? 'amber' : 'rose'}
                />
              </div>
            </div>
          </div>

          {/* Cognitive Diagnostic Status Cards (Exact requested fields) */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strongest Area */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <TrendingUp className="w-4 h-4" /> Strongest Area
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentMastery.python}%
                </span>
              </div>
              <div className="text-lg font-bold text-white">{strongestArea}</div>
              <p className="text-xs text-slate-400">
                Demonstrated high accuracy and intuitive conceptual grasp.
              </p>
            </div>

            {/* Weakest Area */}
            <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <TrendingDown className="w-4 h-4" /> Weakest Area
                </span>
                <span className="text-rose-400 font-bold">
                  {currentMastery.ml_fundamentals}%
                </span>
              </div>
              <div className="text-lg font-bold text-white">{weakestArea}</div>
              <p className="text-xs text-slate-400">
                Identified friction point prioritized for targeted remediation.
              </p>
            </div>

            {/* Current Level */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Award className="w-4 h-4" /> Current Level
                </span>
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span>{estimatedLevel}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tutor explanations will calibrate tone and depth to this level.
              </p>
            </div>

            {/* Recommended Difficulty */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Layers className="w-4 h-4" /> Recommended Difficulty
                </span>
              </div>
              <div className="text-lg font-bold text-white">{recommendedDifficulty}</div>
              <p className="text-xs text-slate-400">
                Optimal zone of proximal development for maximum retention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Misconception & Recommendation Highlight Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Detected Misconception</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {misconceptions[0] || 'Confusing overfitting with underfitting'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Recommended Focus Topic:{' '}
              <strong className="text-amber-400 font-semibold">{recommendedNextTopic}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartTutor}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ask AI Tutor to Explain</span>
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Take Adaptive Quiz</span>
            </button>
            <button
              onClick={handleStartCoding}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Coding Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
