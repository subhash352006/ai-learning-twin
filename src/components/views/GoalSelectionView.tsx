import React, { useState } from 'react';
import {
  Code2,
  Database,
  BrainCircuit,
  Gauge,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { KnowledgeAreaId } from '../../types';

interface GoalOption {
  id: KnowledgeAreaId;
  name: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  tags: string[];
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'python',
    name: 'Python',
    subtitle: 'Idiomatic AI Programming',
    description: 'Master list comprehensions, lambda functions, and vectorized memory operations essential for AI models.',
    icon: Code2,
    tags: ['List Comprehensions', 'NumPy Vectorization', 'Memory Profiling'],
  },
  {
    id: 'data_handling',
    name: 'Data Handling',
    subtitle: 'Data Pipelines & Preprocessing',
    description: 'Data cleaning, feature scaling, handling missing values, and preventing silent test data leakage.',
    icon: Database,
    tags: ['Pandas', 'StandardScaler', 'Imputation', 'Leakage Guard'],
  },
  {
    id: 'ml_fundamentals',
    name: 'Machine Learning Fundamentals',
    subtitle: 'Core Algorithms & Bias-Variance',
    description: 'Supervised vs unsupervised models, overfitting vs underfitting, loss optimization and gradient descent.',
    icon: BrainCircuit,
    tags: ['Bias-Variance', 'Overfitting', 'Gradient Descent', 'Decision Trees'],
  },
  {
    id: 'model_evaluation',
    name: 'Model Evaluation',
    subtitle: 'Metrics, Validation & Confidence',
    description: 'Precision, recall, ROC-AUC, confusion matrices, and rigorous K-Fold cross-validation strategies.',
    icon: Gauge,
    tags: ['Precision & Recall', 'Cross-Validation', 'Imbalanced Data', 'ROC-AUC'],
  },
];

export const GoalSelectionView: React.FC = () => {
  const { profile, setGoals, navigateTo } = useLearner();
  const [selected, setSelected] = useState<KnowledgeAreaId[]>(
    profile.selectedGoals.length > 0 ? profile.selectedGoals : ['ml_fundamentals', 'python']
  );

  const toggleGoal = (id: KnowledgeAreaId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === GOAL_OPTIONS.length) {
      setSelected(['ml_fundamentals']);
    } else {
      setSelected(GOAL_OPTIONS.map((g) => g.id));
    }
  };

  const handleProceed = () => {
    if (selected.length === 0) return;
    setGoals(selected);
    navigateTo('diagnostic');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3 text-center">
        <button
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" /> Step 1: Learning Focus
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Choose Your AI Learning Goals
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Select one or more target domains. Your adaptive diagnostic will tailor question depth to assess your current conceptual baseline.
        </p>

        <div className="pt-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
          >
            {selected.length === GOAL_OPTIONS.length ? 'Deselect All (Keep 1)' : 'Select All 4 Areas'}
          </button>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          const Icon = goal.icon;

          return (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-xl border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 font-bold" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                  <p className="text-xs text-amber-400/90 font-medium">{goal.subtitle}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {goal.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-slate-800/60">
                {goal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          Selected: <strong className="text-amber-400 font-semibold">{selected.length}</strong> / 4 focus areas
        </span>

        <button
          onClick={handleProceed}
          disabled={selected.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Begin Adaptive Diagnostic</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
