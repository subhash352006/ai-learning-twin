import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LearnerProfile,
  KnowledgeAreaId,
  DiagnosticAnalysisResult,
  QuizEvaluationResult,
  CodingEvaluationResult,
  CodingTask,
  ActivityLog,
  DiagnosticAnswer,
} from '../types';

export type AppView =
  | 'landing'
  | 'goals'
  | 'diagnostic'
  | 'dashboard'
  | 'tutor'
  | 'quiz'
  | 'coding'
  | 'progress';

interface LearnerContextType {
  profile: LearnerProfile;
  currentView: AppView;
  selectedTopicForTutor: string;
  navigateTo: (view: AppView) => void;
  setGoals: (goals: KnowledgeAreaId[]) => void;
  completeDiagnostic: (analysis: DiagnosticAnalysisResult, answers: DiagnosticAnswer[]) => void;
  updateQuizMastery: (evaluation: QuizEvaluationResult, topic: string) => void;
  updateCodingMastery: (evaluation: CodingEvaluationResult, task: CodingTask) => void;
  setSelectedTopicForTutor: (topic: string) => void;
  resetProfile: () => void;
  loadDemoProfile: () => void;
}

const STORAGE_KEY = 'ai_learning_twin_profile_v1';

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
  weakConcepts: [],
  misconceptions: [],
  estimatedLevel: 'Beginner',
  strongestArea: 'Python',
  weakestArea: 'ML Fundamentals',
  recommendedNextTopic: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
  recommendedDifficulty: 'Beginner',
  shortReason: '',
  completedQuizzesCount: 0,
  completedCodingTasksCount: 0,
  activityHistory: [],
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
  const [selectedTopicForTutor, setSelectedTopicForTutor] = useState<string>(
    'Overfitting & Underfitting: Bias-Variance Tradeoff'
  );

  // Sync profile to localStorage on change
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

    const diagnosticLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'diagnostic',
      title: 'Initial Adaptive Diagnostic Assessment',
      timestamp: Date.now(),
      score: overall,
      details: `Diagnosed ${answers.filter((a) => a.isCorrect).length}/${answers.length} correct. Identified friction in ${analysis.weakestArea}.`,
    };

    const newProfile: LearnerProfile = {
      ...profile,
      isDiagnosticComplete: true,
      initialMastery: { ...analysis.mastery },
      currentMastery: { ...analysis.mastery },
      initialOverallMastery: overall,
      currentOverallMastery: overall,
      strengths: analysis.strengths,
      weakConcepts: analysis.weakConcepts,
      misconceptions: analysis.misconceptions,
      estimatedLevel: analysis.estimatedLevel,
      strongestArea: analysis.strongestArea,
      weakestArea: analysis.weakestArea,
      recommendedNextTopic: analysis.recommendedNextTopic,
      recommendedDifficulty: analysis.recommendedDifficulty,
      shortReason: analysis.shortReason,
      activityHistory: [diagnosticLog, ...profile.activityHistory],
      lastUpdated: Date.now(),
    };

    setProfile(newProfile);
    setSelectedTopicForTutor(analysis.recommendedNextTopic);
  };

  const updateQuizMastery = (evaluation: QuizEvaluationResult, topic: string) => {
    setProfile((prev) => {
      // Find concept key for weakest area (typically ml_fundamentals for demo)
      const targetConcept: KnowledgeAreaId =
        prev.weakestArea.toLowerCase().includes('data')
          ? 'data_handling'
          : prev.weakestArea.toLowerCase().includes('eval')
          ? 'model_evaluation'
          : prev.weakestArea.toLowerCase().includes('py')
          ? 'python'
          : 'ml_fundamentals';

      const beforeMastery = prev.currentMastery[targetConcept] || 40;
      const newConceptMastery = evaluation.updatedMastery;

      const updatedCurrentMastery = {
        ...prev.currentMastery,
        [targetConcept]: newConceptMastery,
      };

      const newOverall = Math.round(
        (updatedCurrentMastery.python +
          updatedCurrentMastery.data_handling +
          updatedCurrentMastery.ml_fundamentals +
          updatedCurrentMastery.model_evaluation) /
          4
      );

      // Re-evaluate weakest area based on updated scores
      const sorted = Object.entries(updatedCurrentMastery).sort((a, b) => a[1] - b[1]);
      const newWeakestKey = sorted[0][0];
      const areaDisplayNames: Record<string, string> = {
        python: 'Python',
        data_handling: 'Data Handling',
        ml_fundamentals: 'ML Fundamentals',
        model_evaluation: 'Model Evaluation',
      };

      const activityLog: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'quiz',
        title: `Adaptive Quiz: ${topic}`,
        timestamp: Date.now(),
        score: Math.round((evaluation.score / evaluation.total) * 100),
        details: `Scored ${evaluation.score}/${evaluation.total}. Mastery in ${areaDisplayNames[targetConcept]} updated from ${beforeMastery}% to ${newConceptMastery}%.`,
        masteryChange: {
          concept: targetConcept,
          before: beforeMastery,
          after: newConceptMastery,
        },
      };

      const remainingMisconceptions = evaluation.misconceptionResolved
        ? prev.misconceptions.filter(
            (m) => !m.toLowerCase().includes('overfitting') && !m.toLowerCase().includes('accuracy')
          )
        : prev.misconceptions;

      return {
        ...prev,
        currentMastery: updatedCurrentMastery,
        currentOverallMastery: newOverall,
        weakestArea: areaDisplayNames[newWeakestKey] || prev.weakestArea,
        misconceptions: remainingMisconceptions,
        recommendedNextTopic: evaluation.nextRecommendedTopic,
        recommendedDifficulty: evaluation.nextDifficulty,
        completedQuizzesCount: prev.completedQuizzesCount + 1,
        activityHistory: [activityLog, ...prev.activityHistory],
        lastUpdated: Date.now(),
      };
    });
  };

  const updateCodingMastery = (evaluation: CodingEvaluationResult, task: CodingTask) => {
    setProfile((prev) => {
      const targetConcept = task.concept;
      const before = prev.currentMastery[targetConcept];
      const after = Math.min(100, before + evaluation.masteryDelta);

      const updatedCurrentMastery = {
        ...prev.currentMastery,
        [targetConcept]: after,
      };

      const newOverall = Math.round(
        (updatedCurrentMastery.python +
          updatedCurrentMastery.data_handling +
          updatedCurrentMastery.ml_fundamentals +
          updatedCurrentMastery.model_evaluation) /
          4
      );

      const activityLog: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'coding',
        title: `Coding Challenge: ${task.title}`,
        timestamp: Date.now(),
        score: evaluation.score,
        details: evaluation.feedback,
        masteryChange: {
          concept: targetConcept,
          before,
          after,
        },
      };

      return {
        ...prev,
        currentMastery: updatedCurrentMastery,
        currentOverallMastery: newOverall,
        completedCodingTasksCount: prev.completedCodingTasksCount + 1,
        activityHistory: [activityLog, ...prev.activityHistory],
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
      selectedGoals: ['ml_fundamentals', 'model_evaluation'],
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
        'Python list comprehensions and vectorized idioms',
        'Pandas DataFrame imputation and null handling',
      ],
      weakConcepts: [
        'Overfitting & Underfitting detection and mitigation',
        'Accuracy paradox in severe class imbalance',
      ],
      misconceptions: [
        'Confusing 100% training accuracy with optimal generalization (Overfitting vs Underfitting)',
      ],
      estimatedLevel: 'Beginner',
      strongestArea: 'Python',
      weakestArea: 'ML Fundamentals',
      recommendedNextTopic: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
      recommendedDifficulty: 'Beginner',
      shortReason:
        'Your diagnostic revealed strong programming instincts in Python (80%), but a core misconception where high training accuracy was mistaken for true generalization in ML Fundamentals (40%).',
      completedQuizzesCount: 0,
      completedCodingTasksCount: 0,
      activityHistory: [
        {
          id: 'demo-diag-1',
          type: 'diagnostic',
          title: 'Initial Diagnostic Assessment',
          timestamp: Date.now() - 3600000,
          score: 58,
          details: 'Initial assessment completed across 10 core questions.',
        },
      ],
      lastUpdated: Date.now(),
    };

    setProfile(demoProfile);
    setSelectedTopicForTutor('Overfitting & Underfitting: Bias-Variance Tradeoff');
    navigateTo('dashboard');
  };

  return (
    <LearnerContext.Provider
      value={{
        profile,
        currentView,
        selectedTopicForTutor,
        navigateTo,
        setGoals,
        completeDiagnostic,
        updateQuizMastery,
        updateCodingMastery,
        setSelectedTopicForTutor,
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
