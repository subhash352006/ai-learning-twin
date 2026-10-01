import React, { useState } from 'react';
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { DIAGNOSTIC_QUESTIONS } from '../../data/diagnosticQuestions';
import { GeminiService } from '../../services/gemini';
import { DiagnosticAnswer } from '../../types';

export const DiagnosticView: React.FC = () => {
  const { profile, completeDiagnostic, navigateTo } = useLearner();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Quick fill helper for demo/speed testing
  const handleAutoFillDemo = () => {
    const demoAnswers: Record<string, number> = {};
    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      // Intentionally make ML Fundamentals (diag-ml-1 & diag-ml-2) wrong to trigger
      // the exact demo flow required by the prompt!
      if (q.id === 'diag-ml-1') {
        // select 0 (Underfitting instead of Overfitting) to trigger misconception
        demoAnswers[q.id] = 0;
      } else if (q.id === 'diag-ml-2') {
        // select 0 (Increase L2 regularization instead of Increase capacity)
        demoAnswers[q.id] = 0;
      } else {
        demoAnswers[q.id] = q.correctAnswer;
      }
    });
    setSelectedAnswers(demoAnswers);
    setCurrentIndex(totalQuestions - 1);
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      setSubmissionError(`Please answer all ${totalQuestions} questions before submitting (currently answered ${answeredCount}/${totalQuestions}).`);
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      // Prepare structured answer log
      const answerRecords: DiagnosticAnswer[] = DIAGNOSTIC_QUESTIONS.map((q) => {
        const chosen = selectedAnswers[q.id];
        return {
          questionId: q.id,
          question: q.question,
          selectedAnswer: chosen,
          correctAnswer: q.correctAnswer,
          isCorrect: chosen === q.correctAnswer,
          concept: q.concept,
          difficulty: q.difficulty,
        };
      });

      const { result } = await GeminiService.analyzeDiagnostic(
        answerRecords,
        profile.selectedGoals
      );

      // Save to learner state
      completeDiagnostic(result, answerRecords);

      // Navigate to Learning Twin Dashboard
      navigateTo('dashboard');
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err?.message || 'Failed to submit diagnostic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyColors = {
    Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Advanced: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Diagnostic Assessment
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Baseline Knowledge Evaluation</h2>
        </div>

        {/* Demo Fast Fill button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoFillDemo}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
            title="Auto-fill with sample answers demonstrating ML friction"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Fast-Fill Benchmark Answers</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Completion Progress</span>
          <span className="text-amber-400 font-semibold">{answeredCount}/{totalQuestions} Completed ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Question Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
              {currentQuestion.conceptLabel}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${difficultyColors[currentQuestion.difficulty]}`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            ID: {currentQuestion.id}
          </span>
        </div>

        {/* Question Text */}
        <div className="text-lg sm:text-xl font-medium text-white leading-relaxed">
          {currentQuestion.question}
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-4 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/70 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center flex-shrink-0 transition ${
                    isSelected
                      ? 'bg-amber-400 border-amber-400 text-slate-950'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {letter}
                </div>
                <div className="text-sm pt-0.5 leading-relaxed">{option}</div>
              </button>
            );
          })}
        </div>

        {/* Question Navigation shortcuts dots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 border-t border-slate-800/80">
          {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/50'
                    : isAnswered
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700'
                }`}
                title={`Go to Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {submissionError && (
        <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Cognitive Model with Gemini...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Submit & Build AI Learning Twin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
