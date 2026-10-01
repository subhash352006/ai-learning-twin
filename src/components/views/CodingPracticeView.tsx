import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Code2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearner } from '../../context/LearnerContext';
import { GeminiService } from '../../services/gemini';
import { CodingTask, CodingEvaluationResult } from '../../types';
import { FALLBACK_CODING_TASK } from '../../data/fallbackData';

export const CodingPracticeView: React.FC = () => {
  const { profile, updateCodingMastery, navigateTo } = useLearner();
  const [task, setTask] = useState<CodingTask>(FALLBACK_CODING_TASK);
  const [code, setCode] = useState<string>(FALLBACK_CODING_TASK.starterCode);
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CodingEvaluationResult | null>(null);

  const targetTopic = profile.recommendedNextTopic || 'Overfitting & Underfitting';

  // Load or generate coding task
  const loadTask = async () => {
    setIsGenerating(true);
    try {
      const { task: fetchedTask } = await GeminiService.generateCodingTask(targetTopic, profile);
      setTask(fetchedTask);
      setCode(fetchedTask.starterCode);
      setEvaluation(null);
    } catch (err) {
      console.warn('Coding task generation error:', err);
      setTask(FALLBACK_CODING_TASK);
      setCode(FALLBACK_CODING_TASK.starterCode);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [targetTopic]);

  const handleFillDemoSolution = () => {
    const demoSolution = `def evaluate_overfitting(train_acc: float, test_acc: float, threshold: float = 0.15) -> str:
    # 1. Check if the gap between train and test exceeds threshold (High Variance)
    if (train_acc - test_acc) > threshold:
        return "OVERFITTING"
    # 2. Check if both accuracies are low (< 0.60) (High Bias)
    elif train_acc < 0.60 and test_acc < 0.60:
        return "UNDERFITTING"
    # 3. Otherwise model generalizes well
    return "GOOD_FIT"`;
    setCode(demoSolution);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const { evaluation: evalResult } = await GeminiService.evaluateCodeSubmission(
        task,
        code,
        profile
      );
      setEvaluation(evalResult);
      updateCodingMastery(evalResult, task);

      if (evalResult.correctness) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error('Code evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetCode = () => {
    setCode(task.starterCode);
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Hands-On AI Coding Challenge
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {task.difficulty}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {task.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Focus: <strong className="text-amber-400">{task.topic}</strong> (Cognitive Twin Remediation)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFillDemoSolution}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
            title="Auto-fill benchmark working solution"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Fill Solution</span>
          </button>
        </div>
      </div>

      {isGenerating ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Synthesizing coding challenge with Gemini...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Task Instructions & Test Cases (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Task Prompt Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Task Description</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
                {task.description}
              </div>

              {/* Expected Test Cases */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Target Verification Test Cases:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {task.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-slate-300"
                    >
                      <span className="text-slate-400">{tc.input}</span>
                      <span className="text-emerald-400 font-bold">&rarr; {tc.expected}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint Accordion */}
              <div className="pt-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Solution Hint' : 'Need a Hint?'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed animate-fade-in">
                    {task.solutionHint}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Submission (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  solution.py (Python 3)
                </span>
                <button
                  onClick={handleResetCode}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Editor Textarea */}
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 leading-relaxed resize-none"
                  placeholder="# Write your Python implementation here..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Evaluated via Gemini structured syntax & logic engine
                </span>

                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Code with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Code & Calibrate Twin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evaluation Results Card (Exact required fields from prompt) */}
            {evaluation && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in shadow-xl">
                {/* Status banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {evaluation.correctness ? (
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {evaluation.correctness ? 'Implementation Approved!' : 'Needs Adjustment'}
                      </h4>
                      <p className="text-xs text-slate-400">Score: {evaluation.score}/100</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{evaluation.masterySignal}</span>
                  </span>
                </div>

                {/* Feedback */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Feedback:</strong>
                  {evaluation.feedback}
                </div>

                {/* Mistake if any */}
                {evaluation.mistake && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                    <strong className="text-rose-400 block mb-0.5">Identified Issue:</strong>
                    {evaluation.mistake}
                  </div>
                )}

                {/* Improvement suggestion */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <strong className="text-amber-400 block mb-0.5">Improvement Suggestion:</strong>
                  {evaluation.improvementSuggestion}
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={loadTask}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Generate Another Challenge</span>
                  </button>
                  <button
                    onClick={() => navigateTo('progress')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition"
                  >
                    <span>View Overall Progress</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
