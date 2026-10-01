import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { ProgressBar } from '../common/ProgressBar';

export const ProgressView: React.FC = () => {
  const { profile, resetProfile, navigateTo } = useLearner();

  const {
    initialOverallMastery,
    currentOverallMastery,
    initialMastery,
    currentMastery,
    strengths,
    weakConcepts,
    misconceptions,
    estimatedLevel,
    completedQuizzesCount,
    completedCodingTasksCount,
    activityHistory,
    recommendedNextTopic,
  } = profile;

  const netImprovement = currentOverallMastery - initialOverallMastery;

  // Identify concepts that improved
  const conceptsStatus = [
    {
      id: 'python',
      name: 'Python',
      initial: initialMastery.python,
      current: currentMastery.python,
      gain: currentMastery.python - initialMastery.python,
    },
    {
      id: 'data_handling',
      name: 'Data Handling',
      initial: initialMastery.data_handling,
      current: currentMastery.data_handling,
      gain: currentMastery.data_handling - initialMastery.data_handling,
    },
    {
      id: 'ml_fundamentals',
      name: 'ML Fundamentals',
      initial: initialMastery.ml_fundamentals,
      current: currentMastery.ml_fundamentals,
      gain: currentMastery.ml_fundamentals - initialMastery.ml_fundamentals,
    },
    {
      id: 'model_evaluation',
      name: 'Model Evaluation',
      initial: initialMastery.model_evaluation,
      current: currentMastery.model_evaluation,
      gain: currentMastery.model_evaluation - initialMastery.model_evaluation,
    },
  ];

  const improvedConcepts = conceptsStatus.filter((c) => c.gain > 0 || c.current >= 70);
  const remainingWeakConcepts = conceptsStatus.filter((c) => c.current < 65);

  const exportProfileJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai-learning-twin-profile-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Longitudinal Trajectory
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Cognitive Evolution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Learner Mastery & Growth Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking your baseline diagnostic calibration against adaptive remediations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportProfileJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Download Twin JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Twin JSON</span>
          </button>
        </div>
      </div>

      {/* Primary Mastery Stats (Exact format required by prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Initial Diagnostic Mastery */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Initial Mastery
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-300">
            {initialOverallMastery}%
          </div>
          <p className="text-[11px] text-slate-500">Diagnostic baseline</p>
        </div>

        {/* Current Mastery */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
            Current Mastery
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {currentOverallMastery}%
          </div>
          <p className="text-[11px] text-slate-400">Post-adaptive interventions</p>
        </div>

        {/* Improvement */}
        <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-6 space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Net Improvement
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 flex items-center gap-1">
            <span>+{netImprovement}%</span>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-[11px] text-emerald-300/80">Skill delta gained</p>
        </div>

        {/* Calibrated Level */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cognitive Stage
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 pt-1">
            {estimatedLevel}
          </div>
          <p className="text-[11px] text-slate-400">
            {completedQuizzesCount} Quizzes • {completedCodingTasksCount} Code tasks
          </p>
        </div>
      </div>

      {/* Before vs After Detailed Progress Comparison Bars */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Conceptual Domain Breakdown</h3>
            <p className="text-xs text-slate-400">Initial diagnostic baseline vs Current live mastery</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> Initial
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Current
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {conceptsStatus.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white">{c.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Baseline: {c.initial}%</span>
                  <span className="font-bold text-amber-400">Now: {c.current}%</span>
                  {c.gain > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      +{c.gain}%
                    </span>
                  )}
                </div>
              </div>

              {/* Dual progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 flex">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                  style={{ width: `${c.current}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Concepts Improved vs Remaining Weak Concepts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Concepts Improved */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Concepts Improved / Mastered</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
            {improvedConcepts.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>{c.name}:</strong> advanced to {c.current}% (+{c.gain}% gain)
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Remaining Weak Concepts */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Remaining Focus & Weak Concepts</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {misconceptions.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-rose-400 font-bold">⚠</span>
                <span>{m}</span>
              </li>
            ))}
            {weakConcepts.map((w, idx) => (
              <li key={`weak-${idx}`} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Session Activity Log</span>
        </h3>

        {activityHistory.length === 0 ? (
          <p className="text-xs text-slate-500">No activities logged yet.</p>
        ) : (
          <div className="space-y-3">
            {activityHistory.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-white block">{act.title}</span>
                  <span className="text-slate-400 leading-relaxed">{act.details}</span>
                </div>
                {act.score !== undefined && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 self-start sm:self-center">
                    Score: {act.score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Step Navigation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Next Recommended Milestone
          </span>
          <h4 className="text-lg font-bold text-white">{recommendedNextTopic}</h4>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigateTo('tutor')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105"
          >
            <span>Continue in AI Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
