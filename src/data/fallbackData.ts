import { QuizQuestion } from '../types';

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
