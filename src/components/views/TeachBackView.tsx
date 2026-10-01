import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Brain,
  Send,
  RotateCcw,
  Gauge,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearner } from '../../context/LearnerContext';
import { CognitiveEngine } from '../../services/ai/engine';
import { TeachBackEvaluation, ConfidenceRating } from '../../types';

export const TeachBackView: React.FC = () => {
  const { profile, recordTeachBack, navigateTo } = useLearner();
  const [explanation, setExplanation] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceRating>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<TeachBackEvaluation | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState<number | null>(null);

  const targetTopic = profile.recommendations.nextTopic || 'Overfitting & Underfitting';

  const handleInsertReversedSample = () => {
    setExplanation('Overfitting means the model performs badly on training data because it failed to learn the weights.');
    setConfidence(5);
  };

  const handleInsertAccurateSample = () => {
    setExplanation(
      'Overfitting occurs when a high-capacity model memorizes noise and idiosyncratic details in the training set. It gets near 100% training accuracy, but fails on unseen validation data because it cannot generalize.'
    );
    setConfidence(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    setIsSubmitting(true);
    try {
      const evalResult = await CognitiveEngine.evaluateTeachBack(
        targetTopic,
        explanation,
        confidence,
        profile
      );
      setEvaluation(evalResult);
      recordTeachBack(evalResult);

      if (evalResult.conceptualCorrectness === 'accurate') {
        try {
          confetti({
            particleCount: 75,
            spread: 65,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error('Teach-back evaluation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setExplanation('');
    setEvaluation(null);
    setSelectedFollowUp(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Teach-Back Mode
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Active Recall & Articulation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explain It In Your Own Words
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Most tutors adapt the answer. The Learning Twin analyzes your explanation to uncover your exact mental model.
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        {!evaluation && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleInsertReversedSample}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1"
              title="Demonstrates detection of reversed training data behavior"
            >
              <Zap className="w-3 h-3 text-rose-400" />
              <span>Test Misconception Flaw</span>
            </button>
            <button
              onClick={handleInsertAccurateSample}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Test Accurate Explanation</span>
            </button>
          </div>
        )}
      </div>

      {/* Conceptual Challenge Prompt */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Cognitive Challenge: {targetTopic}</span>
        </div>

        <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
          &ldquo;Explain what <strong className="text-amber-400">overfitting</strong> is in machine learning. Why can a model with 100% training accuracy be dangerous, and what causes it to happen?&rdquo;
        </p>

        <p className="text-xs text-slate-400">
          Be as honest and intuitive as possible. Write in your natural voice.
        </p>
      </div>

      {/* Submission Form */}
      {!evaluation ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-semibold text-slate-300">Your Conceptual Explanation:</label>
              <span>{explanation.length} characters</span>
            </div>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={6}
              placeholder="In my own words, overfitting happens when..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 leading-relaxed resize-none"
            />
          </div>

          {/* Confidence Rating Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>How confident are you that this explanation is accurate?</span>
              </span>
              <span className="text-amber-400 font-mono font-bold">Rating: {confidence}/5</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ConfidenceRating[]).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConfidence(val)}
                  className={`py-2 text-center rounded-lg border text-xs font-semibold transition ${
                    confidence === val
                      ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {val === 1 ? '1: Guess' : val === 3 ? '3: Moderate' : val === 5 ? '5: Certain' : `${val}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !explanation.trim()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Mental Model...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Explanation & Update Twin</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Results Card */
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Misconception Banner */}
            {evaluation.misconceptionDetected ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>MISCONCEPTION DETECTED: {evaluation.misconceptionTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
                  {evaluation.misconceptionFeedback}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>CONCEPTUALLY SOUND ARTICULATION</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                  {evaluation.misconceptionFeedback}
                </p>
              </div>
            )}

            {/* Targeted Correction */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Targeted Cognitive Correction
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {evaluation.targetedCorrection}
              </p>
            </div>

            {/* Missing ideas */}
            {evaluation.missingIdeas.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Key Dimensions to Incorporate in Your Mental Model:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {evaluation.missingIdeas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up question to test the correction */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Verification Follow-Up Question:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                {evaluation.followUpQuestion.question}
              </p>

              <div className="space-y-2 pt-1">
                {evaluation.followUpQuestion.options.map((opt, idx) => {
                  const isChosen = selectedFollowUp === idx;
                  const isCorrect = idx === evaluation.followUpQuestion.correctAnswer;
                  const letter = String.fromCharCode(65 + idx);

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (selectedFollowUp !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={selectedFollowUp !== null}
                      onClick={() => setSelectedFollowUp(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-400">
                        {letter}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selectedFollowUp !== null && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 animate-fade-in">
                  <strong>Verification Insight:</strong> {evaluation.followUpQuestion.explanation}
                </div>
              )}
            </div>

            {/* Bottom Actions & Mastery Gain Signal */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{evaluation.masteryDelta}% Mastery Gained in ML Fundamentals</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Explain Again
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('quiz')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition hover:scale-105"
                >
                  <span>Proceed to Adaptive Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
