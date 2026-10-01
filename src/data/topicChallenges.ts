import {
  DebugChallenge,
  DataCleaningChallenge,
  ReasoningScenario,
} from '../types';

export const PYTHON_DEBUG_CHALLENGE: DebugChallenge = {
  id: 'py-debug-1',
  title: 'Silent Accumulation in Model Cache',
  topic: 'Python Mutable Default Arguments',
  difficulty: 'Beginner',
  codeSnippet: `def record_feature_batch(features: list, batch_cache: list = []) -> list:
    batch_cache.append(features)
    return batch_cache

# Processing Batch 1
b1 = record_feature_batch([0.25, 0.81])
print("Batch 1:", b1)  # Expected: [[0.25, 0.81]]

# Processing Batch 2
b2 = record_feature_batch([0.14, 0.99])
print("Batch 2:", b2)  # Expected: [[0.14, 0.99]], but got [[0.25, 0.81], [0.14, 0.99]]!`,
  bugLine: 1,
  expectedBehavior: 'Each batch call should start with an independent empty cache list unless an existing cache is passed.',
  actualBehavior: 'The default list is instantiated only once when the function is defined. Successive calls mutate and accumulate the exact same list in memory.',
  options: [
    {
      id: 'fix-1',
      description: 'Replace default argument with `None` and initialize `batch_cache = []` inside the function body.',
      codeFix: `def record_feature_batch(features: list, batch_cache: list | None = None) -> list:
    if batch_cache is None:
        batch_cache = []
    batch_cache.append(features)
    return batch_cache`,
      isCorrect: true,
    },
    {
      id: 'fix-2',
      description: 'Change the type hint from `list` to `tuple`.',
      codeFix: `def record_feature_batch(features: tuple, batch_cache: tuple = ()) -> tuple:`,
      isCorrect: false,
      reasoningFlaw: 'Tuples are immutable; calling .append() will raise an AttributeError at runtime.',
    },
    {
      id: 'fix-3',
      description: 'Add `global batch_cache` inside the function.',
      codeFix: `global batch_cache\nbatch_cache = []`,
      isCorrect: false,
      reasoningFlaw: 'Using global leaks scope outside the function and wipes clean any legitimate cache passed from external callers.',
    },
  ],
  explanation:
    'In Python, default parameter expressions are evaluated once when the function is defined, not every time it is called. Using mutable defaults (`list`, `dict`) causes persistent state leakage across function calls.',
};

export const DATA_CLEANING_CHALLENGE: DataCleaningChallenge = {
  id: 'data-clean-1',
  title: 'E-Commerce Churn Feature Pipeline',
  datasetName: 'customer_churn_raw.csv (Sample Preview)',
  difficulty: 'Intermediate',
  datasetPreview: {
    columns: ['Customer_ID', 'Age', 'Monthly_Spend', 'Subscription_Tier', 'Churned'],
    rows: [
      ['CUST_101', 34, 120.50, 'Premium', 'No'],
      ['CUST_102', null, 85.00, 'Basic', 'Yes'],
      ['CUST_103', 29, 210.00, 'premium', 'No'], // Inconsistent casing
      ['CUST_104', 380, 45.00, 'Basic', 'No'],  // Impossible outlier Age: 380
      ['CUST_105', 41, -15.00, 'Standard', 'Yes'], // Negative spend
      ['CUST_101', 34, 120.50, 'Premium', 'No'], // Exact duplicate row
    ],
  },
  issuesIdentified: [
    {
      id: 'issue-1',
      column: 'Age (Row 2: null)',
      problem: 'Missing value in numerical predictor',
      recommendedAction: 'Impute with median age or model-based KNN imputation, preserving sample size.',
    },
    {
      id: 'issue-2',
      column: 'Subscription_Tier (Row 3: "premium" vs "Premium")',
      problem: 'Case inconsistency creating duplicate artificial categories',
      recommendedAction: 'Normalize string with .str.strip().str.title().',
    },
    {
      id: 'issue-3',
      column: 'Age (Row 4: 380)',
      problem: 'Physically impossible outlier entry (likely typo for 38)',
      recommendedAction: 'Cap with domain bounds (e.g. 18-100) or mark as NaN for imputation.',
    },
    {
      id: 'issue-4',
      column: 'Customer_ID (Row 1 & 6)',
      problem: 'Duplicate customer record inflating sample size',
      recommendedAction: 'Apply df.drop_duplicates(subset=["Customer_ID"]).',
    },
  ],
  decisions: [
    {
      id: 'decision-age',
      question: 'How should you handle the missing Age (null) and the outlier (Age = 380)?',
      options: [
        {
          text: 'Delete all rows with any missing value or value over 100.',
          isOptimal: false,
          consequence: 'Throws away valuable churn signal from other valid columns and introduces attrition bias.',
        },
        {
          text: 'Replace 380 with NaN, then impute missing ages using the median age of the training split only.',
          isOptimal: true,
          consequence: 'Optimal! Robust to extreme outliers and strictly prevents test-set data leakage.',
        },
        {
          text: 'Replace missing ages with 0 and leave 380 as-is.',
          isOptimal: false,
          consequence: 'Distorts gradient descent weights because Age 0 and Age 380 heavily skew mean and standard deviation.',
        },
      ],
    },
    {
      id: 'decision-casing',
      question: 'How should you clean the categorical "Subscription_Tier" before one-hot encoding?',
      options: [
        {
          text: 'Standardize text casing via `.str.lower()` so "premium" and "Premium" merge into a single level.',
          isOptimal: true,
          consequence: 'Prevents one-hot encoding from creating redundant, fragmented sparse columns.',
        },
        {
          text: 'Leave it unchanged because Scikit-Learn automatically parses synonym words.',
          isOptimal: false,
          consequence: 'Scikit-Learn OneHotEncoder treats strings literally, creating separate columns for "premium" and "Premium".',
        },
      ],
    },
  ],
};

export const REASONING_SCENARIO: ReasoningScenario = {
  id: 'eval-reasoning-1',
  title: 'Oncology Malignancy AI Screening',
  context:
    'You are deploying an automated computer-vision classifier in an emergency triage unit to detect early-stage aggressive melanoma from skin lesions. Prevalence is 1.5% (15 malignant cases per 1,000 patients).',
  criticalRisk:
    'A False Negative (missed cancer diagnosis) means the patient receives no treatment and may suffer fatal tumor progression. A False Positive (healthy patient flagged for follow-up biopsy) causes mild anxiety and a secondary painless microscopic test.',
  metrics: [
    {
      name: 'Accuracy',
      isBestChoice: false,
      reasonIfSelected:
        'Dangerous! A naive model predicting "No Malignancy" for every patient achieves 98.5% accuracy while allowing 100% of cancer patients to die untreated.',
      commonMisconception: 'The Accuracy Paradox: Believing high accuracy represents a safe model in severe class imbalance.',
    },
    {
      name: 'Precision',
      isBestChoice: false,
      reasonIfSelected:
        'Suboptimal as the sole target. High precision minimizes false alarms (biopsies) by only flagging lesion cases it is extremely sure of, which directly increases fatal False Negatives.',
      commonMisconception: 'Prioritizing low false alarms over patient survival.',
    },
    {
      name: 'Recall',
      isBestChoice: true,
      reasonIfSelected:
        'Correct! High Recall / Sensitivity ensures the model flags virtually every true malignancy (minimizing False Negatives), even if it generates extra benign biopsy checkups (False Positives).',
    },
    {
      name: 'F1-Score',
      isBestChoice: false,
      reasonIfSelected:
        'Balanced harmonic mean, but in life-threatening screening, Recall must be prioritized far above Precision (e.g. F2-score or PR-curve threshold tuning).',
    },
  ],
  recommendedMetric: 'Recall',
};
