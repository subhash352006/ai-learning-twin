import {
  DiagnosticAnswer,
  DiagnosticAnalysisResult,
  LearnerProfile,
  TeachBackEvaluation,
  ConfidenceMismatch,
  QuizEvaluationResult,
  MLExperimentState,
  MisconceptionRecord,
} from '../../types';
import { GeminiApiClient } from './gemini';

export class CognitiveEngine {
  /**
   * 1. Multi-Dimensional Diagnostic Analyzer
   */
  public static async analyzeDiagnostic(
    answers: DiagnosticAnswer[],
    selectedGoals: string[]
  ): Promise<DiagnosticAnalysisResult> {
    const scores: Record<string, { correct: number; total: number; confidenceSum: number }> = {
      python: { correct: 0, total: 0, confidenceSum: 0 },
      data_handling: { correct: 0, total: 0, confidenceSum: 0 },
      ml_fundamentals: { correct: 0, total: 0, confidenceSum: 0 },
      model_evaluation: { correct: 0, total: 0, confidenceSum: 0 },
    };

    let totalCorrect = 0;
    let totalConfidence = 0;

    answers.forEach((ans) => {
      if (scores[ans.concept]) {
        scores[ans.concept].total += 1;
        scores[ans.concept].confidenceSum += ans.confidence;
        totalConfidence += ans.confidence;
        if (ans.isCorrect) {
          scores[ans.concept].correct += 1;
          totalCorrect += 1;
        }
      }
    });

    const mastery = {
      python: scores.python.total > 0 ? Math.round((scores.python.correct / scores.python.total) * 100) : 75,
      data_handling: scores.data_handling.total > 0 ? Math.round((scores.data_handling.correct / scores.data_handling.total) * 100) : 60,
      ml_fundamentals: scores.ml_fundamentals.total > 0 ? Math.round((scores.ml_fundamentals.correct / scores.ml_fundamentals.total) * 100) : 40,
      model_evaluation: scores.model_evaluation.total > 0 ? Math.round((scores.model_evaluation.correct / scores.model_evaluation.total) * 100) : 50,
    };

    // Calculate Confidence vs Knowledge Calibration
    const avgConfidence = totalConfidence / answers.length;
    const accuracyPercent = Math.round((totalCorrect / answers.length) * 100);

    let mismatch: ConfidenceMismatch = 'well_calibrated';
    let mismatchInsight = 'Your confidence ratings closely mirror your observed conceptual grasp.';

    if (avgConfidence >= 3.8 && accuracyPercent <= 65) {
      mismatch = 'overconfident';
      mismatchInsight =
        'High subjective certainty detected on memorized definitions despite errors in generalization & evaluation logic. Prone to assuming higher training score implies deployment readiness.';
    } else if (avgConfidence <= 2.4 && accuracyPercent >= 70) {
      mismatch = 'underconfident';
      mismatchInsight =
        'Hesitation detected despite strong underlying algorithmic accuracy. You second-guess solid intuitions.';
    }

    // Detect Misconceptions
    const misconceptions: MisconceptionRecord[] = [];
    const wrongAnswers = answers.filter((a) => !a.isCorrect);

    const hasML1Wrong = wrongAnswers.some((a) => a.questionId.includes('ml-1'));
    const hasML2Wrong = wrongAnswers.some((a) => a.questionId.includes('ml-2'));
    const hasEval1Wrong = wrongAnswers.some((a) => a.questionId.includes('eval-1'));
    const hasData2Wrong = wrongAnswers.some((a) => a.questionId.includes('data-2'));

    if (hasML1Wrong || hasML2Wrong) {
      misconceptions.push({
        id: 'misc-overfit-underfit',
        concept: 'Machine Learning Fundamentals',
        description: 'Confusing overfitting with underfitting (treating 100% training accuracy as optimal generalization)',
        detectedIn: 'Decision tree generalization assessment',
        resolved: false,
        correction: '100% training accuracy with low validation accuracy indicates the model memorized noise (high variance), not true pattern discovery.',
        followUp: 'How would you differentiate a high-variance failure from a high-bias failure?',
      });
    }

    if (hasEval1Wrong) {
      misconceptions.push({
        id: 'misc-accuracy-paradox',
        concept: 'Model Evaluation',
        description: 'Accuracy Paradox: Relying on raw percentage accuracy on heavily imbalanced datasets',
        detectedIn: 'Fraud detection classification scenario',
        resolved: false,
        correction: 'When the positive class is rare (0.1%), predicting "No Fraud" gives 99.9% accuracy but catches zero frauds. Precision and Recall are mandatory.',
        followUp: 'Which metric minimizes fatal missed positives?',
      });
    }

    if (hasData2Wrong) {
      misconceptions.push({
        id: 'misc-data-leakage',
        concept: 'Data Handling',
        description: 'Data Leakage: Calling fit_transform on holdout test data',
        detectedIn: 'StandardScaler pipeline question',
        resolved: false,
        correction: 'Fitting transformations on the test split exposes unseen distribution parameters (mean/variance) to the model before evaluation.',
        followUp: 'Why should only .transform() be called on test sets?',
      });
    }

    if (misconceptions.length === 0) {
      misconceptions.push({
        id: 'misc-regularization-subtleties',
        concept: 'Machine Learning Fundamentals',
        description: 'Nuanced bias-variance tradeoffs when tuning regularization parameters',
        detectedIn: 'Advanced parameter tuning',
        resolved: false,
        correction: 'Excessive regularization increases bias, turning a flexible model into an underfit one.',
        followUp: 'How does L2 penalty shift the validation curve?',
      });
    }

    // Determine Weakest & Strongest Area
    const entries = Object.entries(mastery).sort((a, b) => a[1] - b[1]);
    const areaLabels: Record<string, string> = {
      python: 'Python',
      data_handling: 'Data Handling',
      ml_fundamentals: 'Machine Learning Fundamentals',
      model_evaluation: 'Model Evaluation',
    };

    const weakestKey = entries[0][0];
    const strongestKey = entries[entries.length - 1][0];

    const estimatedLevel = accuracyPercent >= 75 ? 'Advanced' : accuracyPercent >= 50 ? 'Intermediate' : 'Beginner';

    return {
      strengths: [
        'Python list comprehension structures and vectorized data expressions',
        'Intuition on DataFrame manipulation & data imputation',
      ],
      weakConcepts: [
        'Overfitting & Underfitting Dynamics',
        'Validation Curve Interpretation',
      ],
      misconceptions,
      estimatedLevel,
      mastery,
      strongestArea: areaLabels[strongestKey],
      weakestArea: areaLabels[weakestKey],
      confidenceAnalysis: {
        mismatch,
        avgConfidence: Number(avgConfidence.toFixed(1)),
        accuracyPercent,
        insight: mismatchInsight,
      },
      recommendedNextActivity: 'teach_back',
      recommendedNextTopic: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
      recommendedDifficulty: 'Beginner',
      reason:
        'Diagnostic revealed strong programming baseline, but an explicit misconception where training score memorization was conflated with true model generalization. Teach-Back mode is selected to articulate the distinction.',
    };
  }

  /**
   * 2. Teach-Back Mode Evaluator
   * Evaluates the learner's own verbal explanation of a concept
   */
  public static async evaluateTeachBack(
    concept: string,
    explanation: string,
    confidence: number,
    profile: LearnerProfile
  ): Promise<TeachBackEvaluation> {
    const text = explanation.toLowerCase().trim();

    // Check if Gemini is configured via environment variable
    if (GeminiApiClient.isConfigured()) {
      const prompt = `Evaluate this student's Teach-Back explanation for the AI concept: "${concept}".
Learner's Explanation:
"${explanation}"
Confidence rating: ${confidence}/5 (1=Guess, 5=Absolute Certainty).

Check for common misconceptions (e.g. claiming overfitting means performing poorly on training data, or confusing bias with variance).

Return a strict JSON object with this EXACT structure:
{
  "conceptualCorrectness": "accurate" | "partial" | "flawed",
  "misconceptionDetected": boolean,
  "misconceptionTitle": "string title of misconception or null",
  "misconceptionFeedback": "specific analysis of what they stated incorrectly",
  "missingIdeas": ["idea 1", "idea 2"],
  "clarityScore": number (1-100),
  "targetedCorrection": "clear correction of their mental model",
  "followUpQuestion": {
    "question": "short single-choice follow-up question",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "explanation"
  },
  "masteryDelta": number (5 to 15)
}`;

      const aiResponse = await GeminiApiClient.generateStructuredContent<TeachBackEvaluation>(prompt);
      if (aiResponse) {
        return aiResponse;
      }
    }

    // Cognitive deterministic evaluation engine
    const mentionsBadOnTraining =
      text.includes('bad on training') ||
      text.includes('badly on training') ||
      text.includes('fails on train') ||
      text.includes('poor on training') ||
      text.includes('low accuracy on training');

    const mentionsMemorization =
      text.includes('memoriz') ||
      text.includes('noise') ||
      text.includes('complex') ||
      text.includes('generaliz') ||
      text.includes('unseen');

    const mentionsHighTrainLowTest =
      (text.includes('high') && text.includes('train')) ||
      (text.includes('good') && text.includes('train') && text.includes('test'));

    if (mentionsBadOnTraining) {
      return {
        conceptualCorrectness: 'flawed',
        misconceptionDetected: true,
        misconceptionTitle: 'REVERSED TRAINING BEHAVIOR',
        misconceptionFeedback:
          'You stated that overfitting means the model performs badly on training data. In reality, an overfit model performs exceptionally well (often 100% accuracy) on training data because it memorizes the training samples, including irrelevant noise.',
        missingIdeas: [
          'High performance on training data',
          'Poor generalization on unseen/test data',
          'Excessive model complexity capturing statistical noise',
        ],
        clarityScore: 62,
        targetedCorrection:
          'Overfitting = Excellent on Training Data, Failure on Unseen Test Data. The model became too tailored to its study guide and cannot solve new problems.',
        followUpQuestion: {
          question: 'If a model achieves 99% train accuracy and 52% test accuracy, what is happening?',
          options: [
            'Underfitting (High Bias)',
            'Overfitting (High Variance memorization)',
            'Perfect generalization',
            'Optimal learning rate',
          ],
          correctAnswer: 1,
          explanation: 'The giant gap between near-perfect train accuracy and dismal test accuracy confirms overfitting.',
        },
        masteryDelta: 8,
      };
    }

    if (mentionsMemorization || mentionsHighTrainLowTest) {
      return {
        conceptualCorrectness: 'accurate',
        misconceptionDetected: false,
        misconceptionFeedback:
          'Excellent explanation! You clearly identified that the model memorizes specifics rather than learning underlying generalizable patterns.',
        missingIdeas: [
          'Validation curve divergence',
          'Regularization techniques (L2 / Tree pruning)',
        ],
        clarityScore: 92,
        targetedCorrection:
          'Your mental model is sound: overfitting happens when capacity outstrips data signal, leading to high test error despite high training score.',
        followUpQuestion: {
          question: 'Which action directly prevents a decision tree from overfitting noisy data?',
          options: [
            'Increasing maximum depth to infinity',
            'Restricting maximum tree depth and setting min_samples_leaf',
            'Removing validation split',
            'Multiplying labels by 2',
          ],
          correctAnswer: 1,
          explanation: 'Restricting depth (pruning) caps model capacity and forces the tree to generalize broader rules.',
        },
        masteryDelta: 15,
      };
    }

    // Default partial explanation
    return {
      conceptualCorrectness: 'partial',
      misconceptionDetected: true,
      misconceptionTitle: 'INCOMPLETE GENERALIZATION DISTINCTION',
      misconceptionFeedback:
        'You touched on the model being wrong, but did not clearly distinguish how it behaves on training data vs. unseen validation data.',
      missingIdeas: [
        'Performance difference between training and test sets',
        'Memorizing noise vs learning true underlying patterns',
      ],
      clarityScore: 70,
      targetedCorrection:
        'Remember the key contrast: Overfitting means low training error, but high validation error.',
      followUpQuestion: {
        question: 'When should we suspect a model is overfit?',
        options: [
          'When both training and test errors are identical and low',
          'When training error is near 0, but test error is high',
          'When training error is 90% and test error is 90%',
          'When the dataset contains no columns',
        ],
        correctAnswer: 1,
        explanation: 'A severe discrepancy between training error and test error is the cardinal signal of overfitting.',
      },
      masteryDelta: 10,
    };
  }

  /**
   * 3. ML Interactive Experiment Simulator
   * Generates realistic simulated bias-variance dynamics for educational exploration
   */
  public static simulateMLExperiment(
    datasetSize: number, // 20 - 1000
    regularizationL2: number, // 0.001 - 10.0
    modelComplexity: number // 1 - 10
  ): MLExperimentState {
    // Model behavior formula:
    // As complexity increases, train accuracy increases towards 100%.
    // Validation accuracy peaks at a sweet spot, then degrades due to overfitting.
    // L2 regularization counteracts excessive complexity.
    // Larger dataset size reduces overfitting.

    const effectiveComplexity = modelComplexity / (1 + Math.log10(regularizationL2 * 100 + 1));
    const dataSizeFactor = Math.log10(datasetSize) / 3; // 0.43 to 1.0

    // Train Accuracy (0.50 to 1.0)
    let trainAccuracy = 0.55 + 0.045 * modelComplexity;
    trainAccuracy = Math.min(0.99, Math.max(0.55, trainAccuracy));

    // Val Accuracy: peaks when effectiveComplexity is around 3-4
    let valAccuracy =
      0.50 +
      0.35 * Math.exp(-Math.pow(effectiveComplexity - 3.5, 2) / 6) * dataSizeFactor;
    valAccuracy = Math.min(trainAccuracy - 0.02, Math.max(0.48, valAccuracy));

    const trainLoss = Number(((1 - trainAccuracy) * 1.5).toFixed(3));
    const valLoss = Number(((1 - valAccuracy) * 2.0).toFixed(3));
    const generalizationGap = Number(((trainAccuracy - valAccuracy) * 100).toFixed(1));

    const trainAccPct = Math.round(trainAccuracy * 100);
    const valAccPct = Math.round(valAccuracy * 100);

    let state: MLExperimentState['state'] = 'Optimal Generalization (Good Fit)';
    let explanation = 'Model capacity is balanced with dataset size and regularization.';

    if (effectiveComplexity < 2.5) {
      state = 'Underfitting (High Bias)';
      explanation =
        'Model is too simple (or regularization is too heavy) to capture the true underlying data patterns. Both training and validation performances are mediocre.';
    } else if (generalizationGap > 18 || (trainAccPct > 92 && valAccPct < 72)) {
      state = 'Overfitting (High Variance)';
      explanation = `The model has high capacity (complexity ${modelComplexity}) relative to data size (${datasetSize}). It is fitting idiosyncratic sample noise. Increasing regularization or data size helps close this gap.`;
    }

    return {
      datasetSize,
      regularizationL2,
      modelComplexity,
      trainLoss,
      valLoss,
      trainAccuracy: trainAccPct,
      valAccuracy: valAccPct,
      generalizationGap,
      state,
      explanation,
    };
  }

  /**
   * 4. Adaptive Quiz Performance Evaluator
   */
  public static evaluateAdaptiveQuiz(
    score: number,
    total: number,
    previousMastery: number,
    profile: LearnerProfile
  ): QuizEvaluationResult {
    const pct = Math.round((score / total) * 100);
    const gain = Math.round((pct - previousMastery) * 0.45);
    const updatedMastery = Math.min(95, Math.max(25, previousMastery + Math.max(8, gain)));
    const misconceptionResolved = pct >= 80;

    return {
      score,
      total,
      previousMastery,
      updatedMastery,
      misconceptionResolved,
      nextRecommendedTopic: misconceptionResolved
        ? 'Regularization (L1 & L2) & Validation Curves'
        : 'Overfitting vs. Underfitting: Diagnostic Practice',
      nextActivity: misconceptionResolved ? 'experiment' : 'teach_back',
      nextDifficulty: misconceptionResolved ? 'Intermediate' : 'Beginner',
      feedback: misconceptionResolved
        ? `Brilliant progress! You scored ${pct}%, proving you resolved the confusion regarding training accuracy vs. true generalization.`
        : `You scored ${pct}%. Reviewing validation curves will solidify your understanding before advancing.`,
    };
  }
}
