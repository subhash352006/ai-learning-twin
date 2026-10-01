import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LearnerProfile,
  KnowledgeAreaId,
  DiagnosticAnalysisResult,
  QuizEvaluationResult,
  TeachBackEvaluation,
  DiagnosticAnswer,
} from '../types';

export type AppView =
  | 'landing'
  | 'goals'
  | 'diagnostic'
  | 'dashboard'
  | 'workspace'
  | 'teach_back'
  | 'quiz'
  | 'progress';

interface LearnerContextType {
  profile: LearnerProfile;
  currentView: AppView;
  selectedAreaForWorkspace: KnowledgeAreaId;
  navigateTo: (view: AppView) => void;
  setSelectedAreaForWorkspace: (area: KnowledgeAreaId) => void;
  setGoals: (goals: KnowledgeAreaId[]) => void;
  completeDiagnostic: (analysis: DiagnosticAnalysisResult, answers: DiagnosticAnswer[]) => void;
  recordTeachBack: (evaluation: TeachBackEvaluation) => void;
  recordWorkspaceActivity: (area: KnowledgeAreaId, title: string, score: number, summary: string) => void;
  updateQuizMastery: (evaluation: QuizEvaluationResult) => void;
  resetProfile: () => void;
  loadDemoProfile: () => void;
}

const STORAGE_KEY = 'ai_learning_twin_profile_v2';

const DEFAULT_PROFILE: LearnerProfile = {
  name: 'Learner',
  selectedGoals: ['ml_fundamentals', 'python'],
  isDiagnosticComplete: false,
  initialMastery: {
    python: 0,
    data_handling: 0,
    ml_fundamentals: 0,
    model_evaluation: 0,
  },
  currentMastery: {
    python: 0,
    data_handling: 0,
    ml_fundamentals: 0,
    model_evaluation: 0,
  },
  initialOverallMastery: 0,
  currentOverallMastery: 0,
  strengths: [],
  weaknesses: [],
  misconceptions: [],
  confidenceAnalysis: {
    mismatch: 'well_calibrated',
    avgConfidence: 3.0,
    accuracyPercent: 0,
    insight: 'Take the diagnostic assessment to measure knowledge against confidence.',
  },
  level: 'Beginner',
  strongestArea: 'Python',
  weakestArea: 'Machine Learning Fundamentals',
  recommendations: {
    nextTopic: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
    nextActivity: 'teach_back',
    difficulty: 'Beginner',
    reason: 'Initial diagnostic required to formulate personalized learning trajectory.',
  },
  completedActivities: [],
  progressHistory: [],
  lastUpdated: Date.now(),
};

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored learner profile:', e);
    }
    return DEFAULT_PROFILE;
  });

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedAreaForWorkspace, setSelectedAreaForWorkspace] = useState<KnowledgeAreaId>('ml_fundamentals');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving learner profile to localStorage:', e);
    }
  }, [profile]);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setGoals = (goals: KnowledgeAreaId[]) => {
    setProfile((prev) => ({
      ...prev,
      selectedGoals: goals,
      lastUpdated: Date.now(),
    }));
  };

  const completeDiagnostic = (analysis: DiagnosticAnalysisResult, answers: DiagnosticAnswer[]) => {
    const overall = Math.round(
      (analysis.mastery.python +
        analysis.mastery.data_handling +
        analysis.mastery.ml_fundamentals +
        analysis.mastery.model_evaluation) /
        4
    );

    const newProfile: LearnerProfile = {
      ...profile,
      isDiagnosticComplete: true,
      initialMastery: { ...analysis.mastery },
      currentMastery: { ...analysis.mastery },
      initialOverallMastery: overall,
      currentOverallMastery: overall,
      strengths: analysis.strengths,
      weaknesses: analysis.weakConcepts,
      misconceptions: analysis.misconceptions,
      confidenceAnalysis: analysis.confidenceAnalysis,
      level: analysis.estimatedLevel,
      strongestArea: analysis.strongestArea,
      weakestArea: analysis.weakestArea,
      recommendations: {
        nextTopic: analysis.recommendedNextTopic,
        nextActivity: analysis.recommendedNextActivity,
        difficulty: analysis.recommendedDifficulty,
        reason: analysis.reason,
      },
      completedActivities: [
        {
          id: `act-diag-${Date.now()}`,
          type: 'adaptive_quiz',
          title: 'Initial Multi-Domain Diagnostic Assessment',
          score: overall,
          timestamp: Date.now(),
          summary: `Diagnosed ${answers.filter((a) => a.isCorrect).length}/${answers.length} correct across 4 domains. Detected friction in ${analysis.weakestArea}.`,
        },
      ],
      progressHistory: [
        {
          timestamp: Date.now(),
          overallMastery: overall,
          activityTitle: 'Diagnostic Calibration',
          masteryDelta: 0,
        },
      ],
      lastUpdated: Date.now(),
    };

    setProfile(newProfile);
  };

  const recordTeachBack = (evaluation: TeachBackEvaluation) => {
    setProfile((prev) => {
      const beforeML = prev.currentMastery.ml_fundamentals;
      const afterML = Math.min(100, beforeML + evaluation.masteryDelta);

      const updatedMastery = {
        ...prev.currentMastery,
        ml_fundamentals: afterML,
      };

      const newOverall = Math.round(
        (updatedMastery.python +
          updatedMastery.data_handling +
          updatedMastery.ml_fundamentals +
          updatedMastery.model_evaluation) /
          4
      );

      // Check if misconception was cleared
      const updatedMisconceptions = prev.misconceptions.map((m) => {
        if (m.id.includes('overfit') && evaluation.conceptualCorrectness === 'accurate') {
          return { ...m, resolved: true };
        }
        return m;
      });

      return {
        ...prev,
        currentMastery: updatedMastery,
        currentOverallMastery: newOverall,
        misconceptions: updatedMisconceptions,
        recommendations: {
          nextTopic: 'Overfitting & Generalization Verification',
          nextActivity: 'adaptive_quiz',
          difficulty: evaluation.conceptualCorrectness === 'accurate' ? 'Intermediate' : 'Beginner',
          reason:
            'Teach-Back articulated conceptual gaps. Now verify mastery retention with an adaptive 5-question targeted quiz.',
        },
        completedActivities: [
          {
            id: `act-tb-${Date.now()}`,
            type: 'teach_back',
            title: 'Teach-Back: Overfitting & Generalization',
            score: evaluation.clarityScore,
            timestamp: Date.now(),
            summary: evaluation.misconceptionDetected
              ? `Misconception identified and targeted: ${evaluation.misconceptionTitle}.`
              : 'Accurate articulation of bias-variance dynamics.',
          },
          ...prev.completedActivities,
        ],
        progressHistory: [
          ...prev.progressHistory,
          {
            timestamp: Date.now(),
            overallMastery: newOverall,
            activityTitle: 'Teach-Back Remediation',
            masteryDelta: evaluation.masteryDelta,
          },
        ],
        lastUpdated: Date.now(),
      };
    });
  };

  const recordWorkspaceActivity = (
    area: KnowledgeAreaId,
    title: string,
    score: number,
    summary: string
  ) => {
    setProfile((prev) => {
      const delta = Math.round(score * 0.12);
      const updatedAreaMastery = Math.min(100, prev.currentMastery[area] + delta);
      const updatedMastery = {
        ...prev.currentMastery,
        [area]: updatedAreaMastery,
      };

      const newOverall = Math.round(
        (updatedMastery.python +
          updatedMastery.data_handling +
          updatedMastery.ml_fundamentals +
          updatedMastery.model_evaluation) /
          4
      );

      return {
        ...prev,
        currentMastery: updatedMastery,
        currentOverallMastery: newOverall,
        completedActivities: [
          {
            id: `act-ws-${Date.now()}`,
            type:
              area === 'python'
                ? 'debug_mode'
                : area === 'data_handling'
                ? 'data_cleaning'
                : area === 'ml_fundamentals'
                ? 'experiment'
                : 'reasoning',
            title,
            score,
            timestamp: Date.now(),
            summary,
          },
          ...prev.completedActivities,
        ],
        progressHistory: [
          ...prev.progressHistory,
          {
            timestamp: Date.now(),
            overallMastery: newOverall,
            activityTitle: title,
            masteryDelta: delta,
          },
        ],
        lastUpdated: Date.now(),
      };
    });
  };

  const updateQuizMastery = (evaluation: QuizEvaluationResult) => {
    setProfile((prev) => {
      const delta = evaluation.updatedMastery - prev.currentMastery.ml_fundamentals;
      const updatedMastery = {
        ...prev.currentMastery,
        ml_fundamentals: evaluation.updatedMastery,
      };

      const newOverall = Math.round(
        (updatedMastery.python +
          updatedMastery.data_handling +
          updatedMastery.ml_fundamentals +
          updatedMastery.model_evaluation) /
          4
      );

      const updatedMisconceptions = prev.misconceptions.map((m) =>
        m.id.includes('overfit') ? { ...m, resolved: evaluation.misconceptionResolved } : m
      );

      return {
        ...prev,
        currentMastery: updatedMastery,
        currentOverallMastery: newOverall,
        level: evaluation.nextDifficulty,
        misconceptions: updatedMisconceptions,
        recommendations: {
          nextTopic: evaluation.nextRecommendedTopic,
          nextActivity: evaluation.nextActivity,
          difficulty: evaluation.nextDifficulty,
          reason: `Post-quiz calibration: scored ${evaluation.score}/${evaluation.total}. Progressing to ${evaluation.nextDifficulty} level.`,
        },
        completedActivities: [
          {
            id: `act-quiz-${Date.now()}`,
            type: 'adaptive_quiz',
            title: 'Adaptive Remediation Quiz',
            score: Math.round((evaluation.score / evaluation.total) * 100),
            timestamp: Date.now(),
            summary: `Scored ${evaluation.score}/${evaluation.total}. Mastery in ML Fundamentals elevated from ${evaluation.previousMastery}% to ${evaluation.updatedMastery}%.`,
          },
          ...prev.completedActivities,
        ],
        progressHistory: [
          ...prev.progressHistory,
          {
            timestamp: Date.now(),
            overallMastery: newOverall,
            activityTitle: 'Adaptive Quiz Completion',
            masteryDelta: delta,
          },
        ],
        lastUpdated: Date.now(),
      };
    });
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
    navigateTo('landing');
  };

  const loadDemoProfile = () => {
    const demoProfile: LearnerProfile = {
      name: 'Hackathon Explorer',
      selectedGoals: ['ml_fundamentals', 'python'],
      isDiagnosticComplete: true,
      initialMastery: {
        python: 80,
        data_handling: 60,
        ml_fundamentals: 40,
        model_evaluation: 50,
      },
      currentMastery: {
        python: 80,
        data_handling: 60,
        ml_fundamentals: 40,
        model_evaluation: 50,
      },
      initialOverallMastery: 58,
      currentOverallMastery: 58,
      strengths: [
        'Python list comprehension structures and vectorized data expressions',
        'Pandas DataFrame imputation and null handling',
      ],
      weaknesses: [
        'Overfitting & Underfitting Dynamics',
        'Accuracy paradox in severe class imbalance',
      ],
      misconceptions: [
        {
          id: 'misc-overfit-underfit',
          concept: 'Machine Learning Fundamentals',
          description: 'Confusing overfitting with underfitting (treating 100% training accuracy as optimal generalization)',
          detectedIn: 'Decision tree generalization assessment',
          resolved: false,
          correction: '100% training accuracy with low validation accuracy indicates the model memorized noise (high variance), not true pattern discovery.',
          followUp: 'How would you differentiate a high-variance failure from a high-bias failure?',
        },
      ],
      confidenceAnalysis: {
        mismatch: 'overconfident',
        avgConfidence: 4.2,
        accuracyPercent: 55,
        insight:
          'High certainty recorded on training-score questions despite incorrect real-world generalization answers. Conflating high training accuracy with deployment capability.',
      },
      level: 'Beginner',
      strongestArea: 'Python',
      weakestArea: 'Machine Learning Fundamentals',
      recommendations: {
        nextTopic: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
        nextActivity: 'teach_back',
        difficulty: 'Beginner',
        reason:
          'Learner understands basic model training but repeatedly confuses generalization with memorization. Teach-Back mode recommended to actively re-articulate the concept.',
      },
      completedActivities: [
        {
          id: 'demo-diag-1',
          type: 'adaptive_quiz',
          title: 'Initial Diagnostic Assessment',
          score: 58,
          timestamp: Date.now() - 3600000,
          summary: 'Baseline knowledge assessment completed across 10 multi-tier questions.',
        },
      ],
      progressHistory: [
        {
          timestamp: Date.now() - 3600000,
          overallMastery: 58,
          activityTitle: 'Initial Baseline Diagnostic',
          masteryDelta: 0,
        },
      ],
      lastUpdated: Date.now(),
    };

    setProfile(demoProfile);
    navigateTo('dashboard');
  };

  return (
    <LearnerContext.Provider
      value={{
        profile,
        currentView,
        selectedAreaForWorkspace,
        navigateTo,
        setSelectedAreaForWorkspace,
        setGoals,
        completeDiagnostic,
        recordTeachBack,
        recordWorkspaceActivity,
        updateQuizMastery,
        resetProfile,
        loadDemoProfile,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
