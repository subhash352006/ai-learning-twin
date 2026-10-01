export type KnowledgeAreaId = 'python' | 'data_handling' | 'ml_fundamentals' | 'model_evaluation';

export type LearnerLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface KnowledgeArea {
  id: KnowledgeAreaId;
  name: string;
  description: string;
  iconName: string;
}

export interface DiagnosticQuestion {
  id: string;
  concept: KnowledgeAreaId;
  conceptLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  misconceptionKey?: string;
}

export interface DiagnosticAnswer {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  concept: KnowledgeAreaId;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface DiagnosticAnalysisResult {
  strengths: string[];
  weakConcepts: string[];
  misconceptions: string[];
  estimatedLevel: LearnerLevel;
  mastery: Record<KnowledgeAreaId, number>;
  strongestArea: string;
  weakestArea: string;
  recommendedNextTopic: string;
  recommendedDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  shortReason: string;
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
  detectedMisconception: string;
  nextRecommendedTopic: string;
  nextDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  feedback: string;
}

export interface CodingTask {
  id: string;
  title: string;
  topic: string;
  concept: KnowledgeAreaId;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  starterCode: string;
  solutionHint: string;
  testCases: { input: string; expected: string }[];
}

export interface CodingEvaluationResult {
  correctness: boolean;
  score: number; // 0-100
  feedback: string;
  mistake: string | null;
  improvementSuggestion: string;
  masterySignal: string;
  masteryDelta: number;
}

export interface TutorResponse {
  mode: 'explain' | 'example' | 'quiz' | 'coding';
  topic: string;
  content: string;
  codeSnippet?: string;
  keyTakeaways?: string[];
  suggestedFollowUp?: string;
}

export interface ActivityLog {
  id: string;
  type: 'diagnostic' | 'quiz' | 'coding' | 'tutor';
  title: string;
  timestamp: number;
  score?: number;
  details: string;
  masteryChange?: {
    concept: KnowledgeAreaId;
    before: number;
    after: number;
  };
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
  weakConcepts: string[];
  misconceptions: string[];
  estimatedLevel: LearnerLevel;
  strongestArea: string;
  weakestArea: string;
  recommendedNextTopic: string;
  recommendedDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  shortReason: string;
  completedQuizzesCount: number;
  completedCodingTasksCount: number;
  activityHistory: ActivityLog[];
  lastUpdated: number;
}
