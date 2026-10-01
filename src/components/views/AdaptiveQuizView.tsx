import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearner } from '../../context/LearnerContext';
import { GeminiService } from '../../services/gemini';
import { QuizQuestion, QuizEvaluationResult } from '../../types';
import { FALLBACK_ADAPTIVE_QUIZ } from '../../data/fallbackData';

export const AdaptiveQuizView: React.FC = () => {
  const { profile, updateQuizMastery, navigateTo } = useLearner();
  const [questions, setQuestions] = useState<QuizQuestion[]>(FALLBACK_ADAPTIVE_QUIZ);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<QuizEvaluationResult | null>(null);

  const targetTopic = profile.recommendedNextTopic || 'Overfitting & Underfitting: Bias-Variance Tradeoff';
  const targetMisconception = profile.misconceptions[0] || 'Confusing overfitting with underfitting';
  const previousMastery = profile.currentMastery.ml_fundamentals || 40;

  // Generate quiz questions
  useEffect(() => {
    let isMounted = true;
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const { questions: fetchedQuestions } = await GeminiService.generateAdaptiveQuiz(
          targetTopic,
          targetMisconception,
          profile.estimatedLevel
        );
        if (isMounted && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        }
      } catch (e) {
        console.warn('Using fallback quiz:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadQuiz();
    return () => {
      isMounted = false;
    };
  }, [targetTopic]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const total = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionIndex: number) => {
    if (evaluationResult) return; // Locked once evaluated
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  // Demo shortcut to auto-score 4 out of 5 (80%) to match the prompt example!
  const handleAutoScoreDemo = () => {
    const demoAnswers: Record<string, number> = {};
    questions.forEach((q, idx) => {
      // make 4 correct, 1 wrong (80% score)
      if (idx === 1) {
        demoAnswers[q.id] = (q.correctAnswer + 1) % q.options.length;
      } else {
        demoAnswers[q.id] = q.correctAnswer;
      }
    });
    setSelectedAnswers(demoAnswers);
    setCurrentIndex(questions.length - 1);
  };

  const handleSubmit = async () => {
    if (answeredCount < total) {
      alert(`Please answer all ${total} questions before submitting.`);
      return;
    }

    setIsSubmitting(true);
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });

    try {
      const { result } = await GeminiService.evaluateQuizPerformance(
        targetTopic,
        calculatedScore,
        total,
        previousMastery,
        profile
      );

      setEvaluationResult(result);
      updateQuizMastery(result, targetTopic);

      // Trigger celebratory confetti if score is solid!
      if (calculatedScore >= 4) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error('Quiz evaluation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setEvaluationResult(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Adaptive Knowledge Quiz
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              5 Questions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Remediating: {targetTopic}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Targeting detected friction: <span className="text-rose-400 font-medium">{targetMisconception}</span>
          </p>
        </div>

        {!evaluationResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoScoreDemo}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
              title="Fast-answer quiz with 80% score (demo requirement)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo 80% Score</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Synthesizing targeted adaptive questions with Gemini...</p>
        </div>
      ) : evaluationResult ? (
        /* Evaluation Results Card (exact required fields from prompt) */
        <div className="space-y-8 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Title & Status */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quiz Evaluated by Gemini</span>
              </div>
              <h2 className="text-3xl font-black text-white">Adaptive Learning Twin Synchronized!</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {evaluationResult.feedback}
              </p>
            </div>

            {/* Exactly Required Metrics Comparison Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Previous Mastery */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Previous Mastery
                </span>
                <span className="text-3xl font-black text-slate-400">
                  {evaluationResult.previousMastery}%
                </span>
                <span className="text-[10px] text-slate-500 block">Baseline score</span>
              </div>

              {/* 2. Quiz Score */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Quiz Score
                </span>
                <span className="text-3xl font-black text-amber-400">
                  {Math.round((evaluationResult.score / evaluationResult.total) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({evaluationResult.score} / {evaluationResult.total} Correct)
                </span>
              </div>

              {/* 3. Updated Mastery */}
              <div className="bg-amber-950/30 border border-amber-500/60 rounded-2xl p-5 text-center space-y-1 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Updated Mastery
                </span>
                <span className="text-3xl font-black text-white flex items-center justify-center gap-1">
                  <span>{evaluationResult.updatedMastery}%</span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  +{evaluationResult.updatedMastery - evaluationResult.previousMastery}% Growth
                </span>
              </div>

              {/* 4. Misconception Status */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Misconception
                </span>
                <span className={`text-sm font-bold block pt-2 ${
                  evaluationResult.misconceptionResolved ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {evaluationResult.misconceptionResolved ? '✓ Resolved' : '⚠ In Progress'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Cognitive check
                </span>
              </div>
            </div>

            {/* Next Recommendation Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Next Recommendation
                </span>
                <h4 className="text-lg font-extrabold text-white">
                  {evaluationResult.nextRecommendedTopic}
                </h4>
                <p className="text-xs text-slate-400">
                  Targeted Difficulty: <strong className="text-white">{evaluationResult.nextDifficulty}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigateTo('coding')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105"
                >
                  <span>Practice in Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateTo('progress')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <span>View Progress</span>
                </button>
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white">Question Review</h4>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const userChoice = selectedAnswers[q.id];
                  const isCorrect = userChoice === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-950/15 border-emerald-900/40'
                          : 'bg-rose-950/15 border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1 flex-shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        <strong>Correct Answer:</strong> {q.options[q.correctAnswer]}
                      </div>
                      <div className="text-slate-400 leading-relaxed italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Question Player */
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question <strong className="text-amber-400">{currentIndex + 1}</strong> of {total}
            </span>
            <span>{answeredCount} / {total} Answered</span>
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              {currentQuestion.question}
            </div>

            <div className="space-y-3">
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
          </div>

          {/* Navigation & Submit footer */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
            >
              Previous
            </button>

            {currentIndex < total - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount < total}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Performance with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Quiz & Update Twin</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
