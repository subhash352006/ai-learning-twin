import React, { useState } from 'react';
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
  Gauge,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { DIAGNOSTIC_QUESTIONS } from '../../data/diagnosticQuestions';
import { CognitiveEngine } from '../../services/ai/engine';
import { DiagnosticAnswer, ConfidenceRating } from '../../types';

export const DiagnosticView: React.FC = () => {
  const { profile, completeDiagnostic, navigateTo } = useLearner();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceRating>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const currentConfidence = confidenceRatings[currentQuestion.id] || 3;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
    if (!confidenceRatings[currentQuestion.id]) {
      setConfidenceRatings((prev) => ({
        ...prev,
        [currentQuestion.id]: 3,
      }));
    }
  };

  const handleConfidenceSelect = (rating: ConfidenceRating) => {
    setConfidenceRatings((prev) => ({
      ...prev,
      [currentQuestion.id]: rating,
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

  // Demo auto-fill: accurately replicates the prompt requirement:
  // - High confidence (5/5) on wrong ML question to trigger Overconfidence Mismatch!
  const handleAutoFillDemo = () => {
    const demoAnswers: Record<string, number> = {};
    const demoConfidence: Record<string, ConfidenceRating> = {};

    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      if (q.id === 'diag-ml-1') {
        // selects 0 (underfitting instead of overfitting) with high confidence (5/5)
        demoAnswers[q.id] = 0;
        demoConfidence[q.id] = 5;
      } else if (q.id === 'diag-ml-2') {
        demoAnswers[q.id] = 0;
        demoConfidence[q.id] = 4;
      } else {
        demoAnswers[q.id] = q.correctAnswer;
        demoConfidence[q.id] = 4;
      }
    });

    setSelectedAnswers(demoAnswers);
    setConfidenceRatings(demoConfidence);
    setCurrentIndex(totalQuestions - 1);
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      setSubmissionError(
        `Please complete all ${totalQuestions} questions before submitting (currently answered ${answeredCount}/${totalQuestions}).`
      );
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
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
          confidence: confidenceRatings[q.id] || 3,
        };
      });

      const analysis = await CognitiveEngine.analyzeDiagnostic(
        answerRecords,
        profile.selectedGoals
      );

      completeDiagnostic(analysis, answerRecords);
      navigateTo('dashboard');
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err?.message || 'Failed to analyze diagnostic. Please try again.');
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
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Adaptive Baseline Diagnostic
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Diagnostic & Confidence Calibration</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoFillDemo}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
            title="Auto-fill benchmark answers for demo"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast-Fill Benchmark</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Assessment Progress</span>
          <span className="text-amber-400 font-semibold">
            {answeredCount}/{totalQuestions} Answered ({progressPercent}%)
          </span>
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
        {/* Metadata */}
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
            {currentQuestion.id}
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
            const letter = String.fromCharCode(65 + idx);

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

        {/* Confidence Rating Section (Requirement 8: Confidence vs Knowledge) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>How confident are you in this answer?</span>
            </span>
            <span className="text-amber-400 font-mono">Level {currentConfidence} of 5</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as ConfidenceRating[]).map((rating) => {
              const labels: Record<number, string> = {
                1: '1: Pure Guess',
                2: '2: Low',
                3: '3: Moderate',
                4: '4: High',
                5: '5: Absolute Certainty',
              };
              const isSelected = currentConfidence === rating;

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleConfidenceSelect(rating)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {labels[rating]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Quick Jump Dots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-800/80">
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
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {submissionError && (
        <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition disabled:opacity-40"
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
              <span>Next</span>
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
                  <span>Synthesizing Learning Twin...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Submit & Formulate Learning Twin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
