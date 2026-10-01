export type KnowledgeAreaId = 'python' | 'data_handling' | 'ml_fundamentals' | 'model_evaluation';

export type LearnerLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ConfidenceRating = 1 | 2 | 3 | 4 | 5;

export type ConfidenceMismatch = 'overconfident' | 'underconfident' | 'well_calibrated';

export type LearningActivityType =
  | 'teach_back'
  | 'debug_mode'
  | 'data_cleaning'
  | 'experiment'
  | 'reasoning'
  | 'adaptive_quiz';

export interface KnowledgeArea {
  id: KnowledgeAreaId;
  name: string;
  description: string;
  modeName: string;
  modeDescription: string;
}

export interface DiagnosticQuestion {
  id: string;
  concept: KnowledgeAreaId;
  conceptLabel: string;
  difficulty: LearnerLevel;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  misconceptionKey?: string;
  misconceptionExplanation?: string;
}

export interface DiagnosticAnswer {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  concept: KnowledgeAreaId;
  difficulty: LearnerLevel;
  confidence: ConfidenceRating;
}

export interface MisconceptionRecord {
  id: string;
  concept: string;
  description: string;
  detectedIn: string;
  resolved: boolean;
  correction: string;
  followUp: string;
}

export interface DiagnosticAnalysisResult {
  strengths: string[];
  weakConcepts: string[];
  misconceptions: MisconceptionRecord[];
  estimatedLevel: LearnerLevel;
  mastery: Record<KnowledgeAreaId, number>;
  strongestArea: string;
  weakestArea: string;
  confidenceAnalysis: {
    mismatch: ConfidenceMismatch;
    avgConfidence: number;
    accuracyPercent: number;
    insight: string;
  };
  recommendedNextActivity: LearningActivityType;
  recommendedNextTopic: string;
  recommendedDifficulty: LearnerLevel;
  reason: string;
}

export interface TeachBackEvaluation {
  conceptualCorrectness: 'accurate' | 'partial' | 'flawed';
  misconceptionDetected: boolean;
  misconceptionTitle?: string;
  misconceptionFeedback?: string;
  missingIdeas: string[];
  clarityScore: number; // 1-100
  targetedCorrection: string;
  followUpQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  masteryDelta: number;
}

export interface DebugChallenge {
  id: string;
  title: string;
  topic: string;
  difficulty: LearnerLevel;
  codeSnippet: string;
  bugLine: number;
  expectedBehavior: string;
  actualBehavior: string;
  options: {
    id: string;
    description: string;
    codeFix: string;
    isCorrect: boolean;
    reasoningFlaw?: string;
  }[];
  explanation: string;
}

export interface DataCleaningChallenge {
  id: string;
  title: string;
  datasetName: string;
  difficulty: LearnerLevel;
  datasetPreview: {
    columns: string[];
    rows: (string | number | null)[][];
  };
  issuesIdentified: {
    id: string;
    column: string;
    problem: string;
    recommendedAction: string;
  }[];
  decisions: {
    id: string;
    question: string;
    options: {
      text: string;
      isOptimal: boolean;
      consequence: string;
    }[];
  }[];
}

export interface MLExperimentState {
  datasetSize: number; // 20 to 1000
  regularizationL2: number; // 0.0001 to 10.0
  modelComplexity: number; // 1 (simple linear) to 10 (over-parameterized polynomial)
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  generalizationGap: number;
  state: 'Underfitting (High Bias)' | 'Optimal Generalization (Good Fit)' | 'Overfitting (High Variance)';
  explanation: string;
}

export interface ReasoningScenario {
  id: string;
  title: string;
  context: string;
  criticalRisk: string;
  metrics: {
    name: 'Accuracy' | 'Precision' | 'Recall' | 'F1-Score';
    isBestChoice: boolean;
    reasonIfSelected: string;
    commonMisconception?: string;
  }[];
  recommendedMetric: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
}

export interface QuizEvaluationResult {
  score: number;
  total: number;
  previousMastery: number;
  updatedMastery: number;
  misconceptionResolved: boolean;
  nextRecommendedTopic: string;
  nextActivity: LearningActivityType;
  nextDifficulty: LearnerLevel;
  feedback: string;
}

export interface CompletedActivity {
  id: string;
  type: LearningActivityType;
  title: string;
  score: number;
  timestamp: number;
  summary: string;
}

export interface LearnerProfile {
  name: string;
  selectedGoals: KnowledgeAreaId[];
  isDiagnosticComplete: boolean;
  initialMastery: Record<KnowledgeAreaId, number>;
  currentMastery: Record<KnowledgeAreaId, number>;
  initialOverallMastery: number;
  currentOverallMastery: number;
  strengths: string[];
  weaknesses: string[];
  misconceptions: MisconceptionRecord[];
  confidenceAnalysis: {
    mismatch: ConfidenceMismatch;
    avgConfidence: number;
    accuracyPercent: number;
    insight: string;
  };
  level: LearnerLevel;
  strongestArea: string;
  weakestArea: string;
  recommendations: {
    nextTopic: string;
    nextActivity: LearningActivityType;
    difficulty: LearnerLevel;
    reason: string;
  };
  completedActivities: CompletedActivity[];
  progressHistory: {
    timestamp: number;
    overallMastery: number;
    activityTitle: string;
    masteryDelta: number;
  }[];
  lastUpdated: number;
}
