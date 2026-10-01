import {
  DiagnosticAnalysisResult,
  QuizQuestion,
  QuizEvaluationResult,
  CodingTask,
  CodingEvaluationResult,
  TutorResponse,
  DiagnosticAnswer,
} from '../types';

export function generateLocalDiagnosticAnalysis(answers: DiagnosticAnswer[]): DiagnosticAnalysisResult {
  const scores: Record<string, { correct: number; total: number }> = {
    python: { correct: 0, total: 0 },
    data_handling: { correct: 0, total: 0 },
    ml_fundamentals: { correct: 0, total: 0 },
    model_evaluation: { correct: 0, total: 0 },
  };

  answers.forEach((ans) => {
    if (scores[ans.concept]) {
      scores[ans.concept].total += 1;
      if (ans.isCorrect) {
        scores[ans.concept].correct += 1;
      }
    }
  });

  const mastery = {
    python: scores.python.total > 0 ? Math.round((scores.python.correct / scores.python.total) * 100) : 50,
    data_handling: scores.data_handling.total > 0 ? Math.round((scores.data_handling.correct / scores.data_handling.total) * 100) : 50,
    ml_fundamentals: scores.ml_fundamentals.total > 0 ? Math.round((scores.ml_fundamentals.correct / scores.ml_fundamentals.total) * 100) : 40,
    model_evaluation: scores.model_evaluation.total > 0 ? Math.round((scores.model_evaluation.correct / scores.model_evaluation.total) * 100) : 50,
  };

  // Find strongest and weakest
  const entries = Object.entries(mastery);
  entries.sort((a, b) => a[1] - b[1]);
  const weakestKey = entries[0][0];
  const strongestKey = entries[entries.length - 1][0];

  const areaNames: Record<string, string> = {
    python: 'Python',
    data_handling: 'Data Handling',
    ml_fundamentals: 'ML Fundamentals',
    model_evaluation: 'Model Evaluation',
  };

  const misconceptionsFound: string[] = [];
  const wrongAnswers = answers.filter((a) => !a.isCorrect);

  if (wrongAnswers.some((a) => a.questionId.includes('ml-1') || a.questionId.includes('ml-2'))) {
    misconceptionsFound.push('Confusing 100% training accuracy with optimal generalization (Overfitting vs Underfitting)');
  }
  if (wrongAnswers.some((a) => a.questionId.includes('eval-1'))) {
    misconceptionsFound.push('Relying on raw classification accuracy when evaluated on severely imbalanced datasets');
  }
  if (wrongAnswers.some((a) => a.questionId.includes('data-2'))) {
    misconceptionsFound.push('Overlooking data leakage by fitting preprocessing scalers on the holdout test set');
  }
  if (misconceptionsFound.length === 0) {
    misconceptionsFound.push('Nuanced bias-variance tradeoffs when tuning hyperparameter regularization');
  }

  const strengthsFound: string[] = [];
  const correctAnswers = answers.filter((a) => a.isCorrect);
  if (correctAnswers.some((a) => a.concept === 'python')) {
    strengthsFound.push('Solid grasp of Python syntax & vectorized thinking');
  }
  if (correctAnswers.some((a) => a.concept === 'data_handling')) {
    strengthsFound.push('Effective understanding of DataFrame transformations & missing value handling');
  }
  if (correctAnswers.some((a) => a.concept === 'model_evaluation')) {
    strengthsFound.push('Good intuition on recall requirements for critical classification decisions');
  }
  if (strengthsFound.length === 0) {
    strengthsFound.push('Foundation in programming structure and basic logic');
  }

  const avgMastery = Math.round(Object.values(mastery).reduce((a, b) => a + b, 0) / 4);
  const estimatedLevel = avgMastery >= 75 ? 'Advanced' : avgMastery >= 50 ? 'Intermediate' : 'Beginner';

  const nextTopics: Record<string, string> = {
    ml_fundamentals: 'Overfitting & Underfitting: Bias-Variance Tradeoff',
    model_evaluation: 'Precision vs. Recall & Confusion Matrices',
    data_handling: 'Preventing Data Leakage with Pipeline Scalers',
    python: 'NumPy Vectorization & Performance Idioms',
  };

  return {
    strengths: strengthsFound,
    weakConcepts: [
      weakestKey === 'ml_fundamentals'
        ? 'Overfitting & Underfitting Dynamics'
        : weakestKey === 'model_evaluation'
        ? 'Imbalanced Class Metrics & PR Curves'
        : weakestKey === 'data_handling'
        ? 'Data Preprocessing Pipelines'
        : 'Vectorized Memory Alignment',
    ],
    misconceptions: misconceptionsFound,
    estimatedLevel,
    mastery,
    strongestArea: areaNames[strongestKey] || 'Python',
    weakestArea: areaNames[weakestKey] || 'ML Fundamentals',
    recommendedNextTopic: nextTopics[weakestKey] || 'Overfitting & Underfitting: Bias-Variance Tradeoff',
    recommendedDifficulty: avgMastery < 50 ? 'Beginner' : 'Intermediate',
    shortReason: `Your diagnostic revealed strong performance in ${areaNames[strongestKey]}, but points of friction in ${areaNames[weakestKey]}. Specifically, recognizing the signs of high variance where high training accuracy leads to poor real-world generalization.`,
  };
}

export const FALLBACK_ADAPTIVE_QUIZ: QuizQuestion[] = [
  {
    id: 'quiz-1',
    concept: 'ML Fundamentals',
    question: 'When a model has high training accuracy (99%) but poor test accuracy (54%), what is primarily happening?',
    options: [
      'The model has high bias and underfit the problem space',
      'The model memorized noise and overfit the training data',
      'The learning rate was set too low',
      'The test set was accidentally duplicated in the training set',
    ],
    correctAnswer: 1,
    explanation: 'High training accuracy combined with low test performance is the textbook definition of overfitting (high variance).',
  },
  {
    id: 'quiz-2',
    concept: 'ML Fundamentals',
    question: 'Which of the following techniques directly helps mitigate overfitting in complex decision trees?',
    options: [
      'Allowing trees to grow to infinite depth with 1 sample per leaf',
      'Pruning branches or setting `max_depth` constraints',
      'Removing all test validation splits',
      'Doubling the number of redundant polynomial features',
    ],
    correctAnswer: 1,
    explanation: 'Restricting tree depth or pruning leaves limits capacity and prevents the tree from creating hyper-specific branches for noise.',
  },
  {
    id: 'quiz-3',
    concept: 'ML Fundamentals',
    question: 'If you observe that both training loss and validation loss remain high and plateau together early, the model is likely:',
    options: [
      'Overfitting',
      'Underfitting',
      'Perfectly generalized',
      'Suffering from exploding gradients only',
    ],
    correctAnswer: 1,
    explanation: 'When both training and test errors are high, the model lacks sufficient capacity or features to learn the pattern (underfitting / high bias).',
  },
  {
    id: 'quiz-4',
    concept: 'ML Fundamentals',
    question: 'How does L2 Regularization (Ridge) counteract overfitting in linear models and neural networks?',
    options: [
      'By forcing exactly half the weights to zero',
      'By penalizing large weight values in the loss function to encourage smoother decision boundaries',
      'By multiplying the inputs by random negative scalars',
      'By removing labels from 50% of the training examples',
    ],
    correctAnswer: 1,
    explanation: 'L2 regularization adds the sum of squared weights to the loss, penalizing extreme coefficients and discouraging over-reliance on individual noise features.',
  },
  {
    id: 'quiz-5',
    concept: 'ML Fundamentals',
    question: 'True or False: A model with 100% training accuracy is always superior to a model with 88% training accuracy.',
    options: [
      'True, higher training score always means better predictive intelligence',
      'False, 100% training accuracy is often a symptom of severe overfitting that fails on unseen data',
      'True, but only if the dataset has fewer than 10 rows',
      'False, because training accuracy must always equal exactly 50%',
    ],
    correctAnswer: 1,
    explanation: 'Never judge a model by training accuracy alone; generalization on unseen validation/test data is the true benchmark.',
  },
];

export const FALLBACK_CODING_TASK: CodingTask = {
  id: 'task-ml-1',
  title: 'Detecting Overfitting & Implementing Train-Test Split',
  topic: 'Overfitting & Underfitting',
  concept: 'ml_fundamentals',
  difficulty: 'Beginner',
  description: `Write a Python function \`evaluate_overfitting(train_acc, test_acc, threshold=0.15)\` that checks if a model is severely overfitting.
If \`(train_acc - test_acc) > threshold\`, return \`"OVERFITTING"\`.
If \`train_acc < 0.60\` and \`test_acc < 0.60\`, return \`"UNDERFITTING"\`.
Otherwise, return \`"GOOD_FIT"\`.`,
  starterCode: `def evaluate_overfitting(train_acc: float, test_acc: float, threshold: float = 0.15) -> str:
    # Your code here
    # 1. Check if the gap between train and test exceeds threshold
    # 2. Check if both accuracies are low (< 0.60)
    # 3. Otherwise return "GOOD_FIT"
    pass
`,
  solutionHint: `Use simple if/elif/else statements comparing (train_acc - test_acc) with threshold, then check if both values are below 0.60.`,
  testCases: [
    { input: 'evaluate_overfitting(0.99, 0.52)', expected: '"OVERFITTING"' },
    { input: 'evaluate_overfitting(0.55, 0.52)', expected: '"UNDERFITTING"' },
    { input: 'evaluate_overfitting(0.88, 0.84)', expected: '"GOOD_FIT"' },
  ],
};

export const FALLBACK_TUTOR_RESPONSES: Record<string, TutorResponse> = {
  explain: {
    mode: 'explain',
    topic: 'Overfitting vs Underfitting',
    content: `Think of learning for an exam:

**Underfitting (High Bias)** is like a student who only studied the chapter titles. They don't understand the material well enough to answer questions on the homework *or* the exam. Both training and test scores are low.

**Overfitting (High Variance)** is like a student who memorized the exact practice exam questions word-for-word, including punctuation and typos. On the practice test (training data), they get a perfect 100%. But when given the real exam with slightly rephrased questions (test data), they fail with 52%!

**Good Fit (Generalization)** is when the student learned the underlying concepts. They can comfortably solve new questions they have never seen before.`,
    keyTakeaways: [
      'High train accuracy + Low test accuracy = Overfitting (High Variance)',
      'Low train accuracy + Low test accuracy = Underfitting (High Bias)',
      'The goal is generalization, not memorization.',
    ],
    suggestedFollowUp: 'Would you like to see how cross-validation or regularization fixes overfitting in real code?',
  },
  example: {
    mode: 'example',
    topic: 'Overfitting in Code',
    content: `Here is a real example showing how a Decision Tree overfits when left unconstrained, compared to a regularized tree:`,
    codeSnippet: `from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# 1. Unconstrained Tree (Severe Overfitting)
overfit_tree = DecisionTreeClassifier(max_depth=None)
overfit_tree.fit(X_train, y_train)

print("Overfit Train Acc:", accuracy_score(y_train, overfit_tree.predict(X_train)))  # 1.0 (100%!)
print("Overfit Test Acc:", accuracy_score(y_test, overfit_tree.predict(X_test)))    # 0.61 (Poor)

# 2. Regularized Tree (Better Generalization)
healthy_tree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=5)
healthy_tree.fit(X_train, y_train)

print("Healthy Train Acc:", accuracy_score(y_train, healthy_tree.predict(X_train)))  # 0.86
print("Healthy Test Acc:", accuracy_score(y_test, healthy_tree.predict(X_test)))    # 0.84 (Strong generalization!)`,
    keyTakeaways: [
      'Setting max_depth prevents infinite branching on noise',
      'min_samples_leaf requires each rule to have statistical support',
    ],
    suggestedFollowUp: 'Ready to test your intuition with a quick 5-question Adaptive Quiz?',
  },
};
