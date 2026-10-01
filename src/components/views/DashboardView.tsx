import React from 'react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  CheckSquare,
  Layers,
  Gauge,
  Code2,
  Database,
  BrainCircuit,
  Activity,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { ProgressBar } from '../common/ProgressBar';
import { DigitalTwinVisualizer } from '../common/DigitalTwinVisualizer';

export const DashboardView: React.FC = () => {
  const { profile, navigateTo, setSelectedAreaForWorkspace, loadDemoProfile } = useLearner();

  if (!profile.isDiagnosticComplete) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">No Learner Twin Calibrated Yet</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Complete the adaptive diagnostic assessment to build your live cognitive model.
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
            Load Demo Learner Twin
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
    level,
    confidenceAnalysis,
    recommendations,
  } = profile;

  const handleLaunchNextActivity = () => {
    if (recommendations.nextActivity === 'teach_back') {
      navigateTo('teach_back');
    } else if (recommendations.nextActivity === 'adaptive_quiz') {
      navigateTo('quiz');
    } else {
      setSelectedAreaForWorkspace('ml_fundamentals');
      navigateTo('workspace');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Learner Cognitive Twin
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Live Model Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            AI LEARNING TWIN
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Adapts your entire learning experience based on how you understand, answer, explain, and improve.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchNextActivity}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch Next Activity: Teach-Back</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer + Knowledge Area Progress Bars */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Twin Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DigitalTwinVisualizer profile={profile} />

          {/* Confidence vs Knowledge Card (Requirement 8) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Confidence vs Knowledge Calibration</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                  confidenceAnalysis.mismatch === 'overconfident'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : confidenceAnalysis.mismatch === 'underconfident'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {confidenceAnalysis.mismatch.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confidenceAnalysis.insight}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Avg Subjective Confidence: <strong className="text-amber-400">{confidenceAnalysis.avgConfidence} / 5.0</strong></span>
              <span>Objective Diagnostic Accuracy: <strong className="text-white">{confidenceAnalysis.accuracyPercent}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Knowledge Areas & Learner Model Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Knowledge Area Progress Bars Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Knowledge Areas Mastery</h3>
                <p className="text-xs text-slate-400">Probabilistic mastery modeled across core AI domains</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                Live Twin Sync
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <ProgressBar
                label="Python"
                subLabel="Syntax & Memory Idioms"
                value={currentMastery.python}
                color={currentMastery.python >= 70 ? 'emerald' : currentMastery.python >= 50 ? 'amber' : 'rose'}
              />

              <ProgressBar
                label="Data Handling"
                subLabel="Pandas & Preprocessing Pipelines"
                value={currentMastery.data_handling}
                color={currentMastery.data_handling >= 70 ? 'emerald' : currentMastery.data_handling >= 50 ? 'amber' : 'rose'}
              />

              <ProgressBar
                label="Machine Learning Fundamentals"
                subLabel="Bias-Variance & Optimization"
                value={currentMastery.ml_fundamentals}
                color={currentMastery.ml_fundamentals >= 70 ? 'emerald' : currentMastery.ml_fundamentals >= 50 ? 'amber' : 'rose'}
              />

              <ProgressBar
                label="Model Evaluation"
                subLabel="Metrics & Generalization Verification"
                value={currentMastery.model_evaluation}
                color={currentMastery.model_evaluation >= 70 ? 'emerald' : currentMastery.model_evaluation >= 50 ? 'amber' : 'rose'}
              />
            </div>
          </div>

          {/* Model Metrics Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strongest Area */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Strongest Area
                </span>
                <span className="font-bold">{currentMastery.python}%</span>
              </div>
              <div className="text-base font-bold text-white">{strongestArea}</div>
              <p className="text-[11px] text-slate-400">Demonstrated solid vectorized execution intuition.</p>
            </div>

            {/* Weakest Area */}
            <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-400">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Weakest Area
                </span>
                <span className="font-bold">{currentMastery.ml_fundamentals}%</span>
              </div>
              <div className="text-base font-bold text-white">{weakestArea}</div>
              <p className="text-[11px] text-slate-400">Friction detected in bias-variance boundary dynamics.</p>
            </div>

            {/* Current Level */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Current Level
                </span>
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{level}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Calibrated
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Activities scale difficulty as you achieve retention.</p>
            </div>

            {/* Next Activity Recommendation */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Recommended Activity
                </span>
              </div>
              <div className="text-base font-bold text-white">
                {recommendations.nextActivity === 'teach_back'
                  ? 'Teach-Back Mode'
                  : recommendations.nextActivity === 'adaptive_quiz'
                  ? 'Adaptive Quiz'
                  : 'Experiment Mode'}
              </div>
              <p className="text-[11px] text-slate-400">
                Targeting: {recommendations.nextTopic.split(':')[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Misconception & Adaptive Recommendation Highlight Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Detected Misconception</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {misconceptions[0]?.description || 'Confusing overfitting with underfitting'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>Cognitive Reason:</strong> {recommendations.reason}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('teach_back')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105 shadow-md shadow-amber-400/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Teach-Back Mode</span>
            </button>
            <button
              onClick={() => {
                setSelectedAreaForWorkspace('ml_fundamentals');
                navigateTo('workspace');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <span>Experiment Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Topic Workspaces Quick Launchpad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Topic-Specific Interaction Workspaces</h3>
            <p className="text-xs text-slate-400">Access interactions designed for each specific subject</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setSelectedAreaForWorkspace('python');
              navigateTo('workspace');
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Debug Mode</span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">Python</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find and repair reasoning bugs in feature cache code.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedAreaForWorkspace('data_handling');
              navigateTo('workspace');
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cleaning Mode</span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">Data Handling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect dirty data tables and choose optimal imputation strategies.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedAreaForWorkspace('ml_fundamentals');
              navigateTo('workspace');
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Experiment</span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">ML Fundamentals</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate bias-variance tradeoffs with live dataset and regularization sliders.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedAreaForWorkspace('model_evaluation');
              navigateTo('workspace');
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Reasoning</span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">Model Evaluation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Defend critical metric selections in clinical cancer screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
