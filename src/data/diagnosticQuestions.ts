import { DiagnosticQuestion, KnowledgeArea } from '../types';

export const KNOWLEDGE_AREAS: KnowledgeArea[] = [
  {
    id: 'python',
    name: 'Python',
    description: 'List comprehensions, vectorized idioms, functions & data structures for AI',
    iconName: 'Code2',
  },
  {
    id: 'data_handling',
    name: 'Data Handling',
    description: 'Pandas DataFrames, NumPy arrays, imputation, preprocessing & transformations',
    iconName: 'Database',
  },
  {
    id: 'ml_fundamentals',
    name: 'ML Fundamentals',
    description: 'Supervised vs unsupervised, bias-variance tradeoff, overfitting, gradient descent',
    iconName: 'BrainCircuit',
  },
  {
    id: 'model_evaluation',
    name: 'Model Evaluation',
    description: 'Precision vs recall, ROC-AUC, cross-validation, data leakage & confusion matrices',
    iconName: 'Gauge',
  },
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 1. Python (Beginner)
  {
    id: 'diag-py-1',
    concept: 'python',
    conceptLabel: 'Python',
    difficulty: 'Beginner',
    question: 'In Python, what is the output of `[x * 2 for x in [1, 2, 3] if x > 1]`?',
    options: [
      '[2, 4, 6]',
      '[4, 6]',
      '[2, 4]',
      '[1, 4, 9]',
    ],
    correctAnswer: 1, // [4, 6]
    explanation: 'The list comprehension filters items where x > 1 (i.e. 2 and 3), then multiplies each by 2, yielding [4, 6].',
    misconceptionKey: 'list_comprehension_filtering',
  },
  // 2. Python (Intermediate)
  {
    id: 'diag-py-2',
    concept: 'python',
    conceptLabel: 'Python',
    difficulty: 'Intermediate',
    question: 'When manipulating NumPy arrays vs Python lists for vector math, why is vectorized `a + b` preferred over `[x + y for x, y in zip(a, b)]`?',
    options: [
      'NumPy arrays use automatic type coercion to Python strings for safety',
      'NumPy performs operations in compiled C with contiguous memory buffers and SIMD instructions',
      'Python lists cannot hold numbers greater than 64-bit integers',
      'List comprehensions are deprecated in Python 3.12+',
    ],
    correctAnswer: 1,
    explanation: 'NumPy executes contiguous memory vectorized operations via optimized C/Fortran routines, avoiding Python interpreter overhead.',
    misconceptionKey: 'vectorization_vs_iteration',
  },
  // 3. Data Handling (Beginner)
  {
    id: 'diag-data-1',
    concept: 'data_handling',
    conceptLabel: 'Data Handling',
    difficulty: 'Beginner',
    question: 'In pandas, what is the difference between `df.dropna()` and `df.fillna(0)`?',
    options: [
      '`df.dropna()` replaces nulls with zeros, while `df.fillna(0)` removes rows with nulls',
      '`df.dropna()` removes rows/columns with null values, while `df.fillna(0)` replaces missing entries with 0',
      'Both functions delete all numerical columns that contain negative numbers',
      '`df.fillna(0)` permanently drops all string columns',
    ],
    correctAnswer: 1,
    explanation: 'dropna removes records containing missing data; fillna imputes/replaces NaN cells with the specified value (like 0 or column mean).',
    misconceptionKey: 'missing_value_handling',
  },
  // 4. Data Handling (Intermediate)
  {
    id: 'diag-data-2',
    concept: 'data_handling',
    conceptLabel: 'Data Handling',
    difficulty: 'Intermediate',
    question: 'When standardizing features with `StandardScaler`, why MUST you call `scaler.fit_transform(X_train)` and then only `scaler.transform(X_test)`?',
    options: [
      'Because `X_test` does not have columns matching `X_train`',
      'To prevent data leakage by keeping test set mean and standard deviation unseen during fitting',
      'Because `fit_transform` deletes the test data from memory',
      'To speed up CPU processing by reusing the cache',
    ],
    correctAnswer: 1,
    explanation: 'Fitting the scaler on the test set causes data leakage: the model inadvertently learns statistics (mean, variance) of the test distribution.',
    misconceptionKey: 'data_leakage_scaling',
  },
  // 5. ML Fundamentals (Beginner)
  {
    id: 'diag-ml-1',
    concept: 'ml_fundamentals',
    conceptLabel: 'ML Fundamentals',
    difficulty: 'Beginner',
    question: 'A decision tree model achieves 100% accuracy on the training set, but only 52% accuracy on the test set. What is this phenomenon called?',
    options: [
      'Underfitting (high bias)',
      'Overfitting (high variance)',
      'Optimal generalization',
      'Gradient clipping',
    ],
    correctAnswer: 1,
    explanation: 'Perfect training accuracy coupled with poor test accuracy indicates the model memorized noise in the training set rather than learning true underlying patterns (overfitting).',
    misconceptionKey: 'overfitting_vs_underfitting',
  },
  // 6. ML Fundamentals (Intermediate)
  {
    id: 'diag-ml-2',
    concept: 'ml_fundamentals',
    conceptLabel: 'ML Fundamentals',
    difficulty: 'Intermediate',
    question: 'If a neural network model exhibits high bias (underfitting), which of the following is the most appropriate remedy?',
    options: [
      'Increase L2 regularization weight penalty',
      'Reduce training dataset size and drop features',
      'Increase model capacity (e.g. deeper architecture or more parameters) or add relevant features',
      'Add aggressive dropout layers to randomly deactivate neurons',
    ],
    correctAnswer: 2,
    explanation: 'Underfitting occurs when the model is too simple to capture the relationship. Increasing capacity or feature representations helps decrease bias.',
    misconceptionKey: 'bias_variance_remedies',
  },
  // 7. ML Fundamentals (Advanced)
  {
    id: 'diag-ml-3',
    concept: 'ml_fundamentals',
    conceptLabel: 'ML Fundamentals',
    difficulty: 'Advanced',
    question: 'In gradient descent, what happens if the learning rate $\\alpha$ is set excessively large?',
    options: [
      'The loss function converges instantaneously to the global minimum',
      'The parameter updates can oscillate wildly and diverge away from the minimum',
      'Weights get strictly regularized to exact zero',
      'The learning algorithm automatically switches to analytical OLS regression',
    ],
    correctAnswer: 1,
    explanation: 'Too large of a learning rate causes the step to overshoot the valley, oscillating and diverging to infinity (loss increases).',
    misconceptionKey: 'learning_rate_dynamics',
  },
  // 8. Model Evaluation (Beginner)
  {
    id: 'diag-eval-1',
    concept: 'model_evaluation',
    conceptLabel: 'Model Evaluation',
    difficulty: 'Beginner',
    question: 'You are training a model to detect rare fraudulent transactions (0.1% of transactions). An algorithm that blindly predicts "not fraud" for every single transaction achieves 99.9% accuracy. Why is accuracy a misleading metric here?',
    options: [
      'Accuracy cannot be calculated on decimal percentages',
      'The extreme class imbalance masks that the model has 0% recall on actual fraudulent cases',
      'Accuracy only applies to unsupervised clustering algorithms',
      'The test set must always have an equal number of positive and negative classes by mathematical law',
    ],
    correctAnswer: 1,
    explanation: 'In highly imbalanced datasets, majority-class baseline classifiers achieve high accuracy while providing zero utility in catching the minority class (fraud). Precision, recall, or PR-AUC must be used.',
    misconceptionKey: 'accuracy_paradox_imbalance',
  },
  // 9. Model Evaluation (Intermediate)
  {
    id: 'diag-eval-2',
    concept: 'model_evaluation',
    conceptLabel: 'Model Evaluation',
    difficulty: 'Intermediate',
    question: 'In a cancer detection model where missing a sick patient (False Negative) has catastrophic consequences, which metric should be prioritized?',
    options: [
      'Precision (minimizing False Positives)',
      'Recall / Sensitivity (minimizing False Negatives)',
      'Specificity only',
      'P-value of the training loss curve',
    ],
    correctAnswer: 1,
    explanation: 'High recall ensures that nearly all true cancer patients are flagged (minimizing fatal False Negatives), even at the cost of some additional false alarm checkups.',
    misconceptionKey: 'precision_vs_recall_tradeoff',
  },
  // 10. Model Evaluation (Advanced)
  {
    id: 'diag-eval-3',
    concept: 'model_evaluation',
    conceptLabel: 'Model Evaluation',
    difficulty: 'Advanced',
    question: 'What is the primary benefit of K-Fold Cross-Validation over a single Train/Test split?',
    options: [
      'It guarantees that the neural network will never overfit in production',
      'It provides a lower-variance, more reliable estimate of generalization performance across multiple data partitions',
      'It completely removes the need for any hyperparameter tuning',
      'It allows training models on unlabelled text data without loss functions',
    ],
    correctAnswer: 1,
    explanation: 'K-Fold cross-validation uses all data for both training and validation over k iterations, minimizing split randomness and providing robust performance confidence intervals.',
    misconceptionKey: 'cross_validation_purpose',
  },
];
