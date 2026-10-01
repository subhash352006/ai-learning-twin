import {
  DiagnosticAnswer,
  DiagnosticAnalysisResult,
  LearnerProfile,
  QuizQuestion,
  QuizEvaluationResult,
  CodingTask,
  CodingEvaluationResult,
  TutorResponse,
} from '../types';
import {
  generateLocalDiagnosticAnalysis,
  FALLBACK_ADAPTIVE_QUIZ,
  FALLBACK_CODING_TASK,
  FALLBACK_TUTOR_RESPONSES,
} from '../data/fallbackData';

// Model configuration
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const API_KEY_STORAGE_KEY = 'ai_learning_twin_gemini_key';
const MODEL_STORAGE_KEY = 'ai_learning_twin_gemini_model';

export class GeminiService {
  private static activeKey: string | null = null;
  private static activeModel: string = DEFAULT_GEMINI_MODEL;

  public static getApiKey(): string | null {
    if (this.activeKey) return this.activeKey;
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();

    // Check Vite environment variables
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return null;
  }

  public static setApiKey(key: string): void {
    this.activeKey = key.trim();
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  }

  public static clearApiKey(): void {
    this.activeKey = null;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  public static getModel(): string {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    return stored || this.activeModel;
  }

  public static setModel(model: string): void {
    this.activeModel = model;
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  }

  public static hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  // Base caller with clean error handling and JSON parsing
  private static async callGemini(prompt: string, systemInstruction?: string): Promise<{ text: string; isAiGenerated: boolean }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }

    const model = this.getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errDetail = `Status ${response.status}`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error?.message) errDetail = parsed.error.message;
      } catch {
        errDetail = errorText;
      }
      throw new Error(`Gemini API Error: ${errDetail}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return { text, isAiGenerated: true };
  }

  // Helper to extract JSON from markdown or raw text safely
  private static extractJson<T>(rawText: string): T {
    let cleaned = rawText.trim();
    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    return JSON.parse(cleaned) as T;
  }

  /**
   * 1. Diagnose Assessment Analysis
   */
  public static async analyzeDiagnostic(
    answers: DiagnosticAnswer[],
    selectedGoals: string[]
  ): Promise<{ result: DiagnosticAnalysisResult; source: 'gemini' | 'simulation'; error?: string }> {
    if (answers.length === 0) {
      throw new Error('Empty diagnostic submission. Please answer the assessment questions.');
    }

    const localFallback = generateLocalDiagnosticAnalysis(answers);

    if (!this.hasApiKey()) {
      return { result: localFallback, source: 'simulation' };
    }

    const prompt = `Analyze this learner's AI diagnostic assessment results.
Selected Goals: ${selectedGoals.join(', ')}

Assessment Data:
${JSON.stringify(
  answers.map((a) => ({
    id: a.questionId,
    concept: a.concept,
    difficulty: a.difficulty,
    question: a.question,
    selectedOptionIndex: a.selectedAnswer,
    correctOptionIndex: a.correctAnswer,
    wasCorrect: a.isCorrect,
  })),
  null,
  2
)}

Return a strict, valid JSON object with EXACTLY this structure:
{
  "strengths": ["string", "string"],
  "weakConcepts": ["string", "string"],
  "misconceptions": ["string describing specific confusion e.g. Confusing overfitting with underfitting"],
  "estimatedLevel": "Beginner" | "Intermediate" | "Advanced",
  "mastery": {
    "python": number (0-100),
    "data_handling": number (0-100),
    "ml_fundamentals": number (0-100),
    "model_evaluation": number (0-100)
  },
  "strongestArea": "Python" | "Data Handling" | "ML Fundamentals" | "Model Evaluation",
  "weakestArea": "Python" | "Data Handling" | "ML Fundamentals" | "Model Evaluation",
  "recommendedNextTopic": "string topic title",
  "recommendedDifficulty": "Beginner" | "Intermediate" | "Advanced",
  "shortReason": "string explaining what misconception was observed and why this topic is recommended"
}`;

    const systemInstruction =
      'You are the AI Learning Twin diagnostic engine. You build a live cognitive model of a learner. Output ONLY valid JSON.';

    try {
      const response = await this.callGemini(prompt, systemInstruction);
      const parsed = this.extractJson<DiagnosticAnalysisResult>(response.text);

      // Validate required keys
      if (
        !parsed.mastery ||
        typeof parsed.mastery.python !== 'number' ||
        !parsed.weakestArea ||
        !parsed.recommendedNextTopic
      ) {
        throw new Error('Invalid structure in Gemini response');
      }

      return { result: parsed, source: 'gemini' };
    } catch (err: any) {
      console.warn('Gemini analysis failed or unconfigured, using deterministic twin analysis:', err);
      return {
        result: localFallback,
        source: 'simulation',
        error: err?.message || 'Could not reach Gemini. Provided smart twin baseline.',
      };
    }
  }

  /**
   * 2. AI Tutor Page Response
   */
  public static async generateTutorResponse(
    topic: string,
    mode: 'explain' | 'example' | 'quiz' | 'coding',
    profile: LearnerProfile
  ): Promise<{ response: TutorResponse; source: 'gemini' | 'simulation' }> {
    const fallback = FALLBACK_TUTOR_RESPONSES[mode] || FALLBACK_TUTOR_RESPONSES.explain;

    if (!this.hasApiKey()) {
      return {
        response: {
          ...fallback,
          topic,
          mode,
        },
        source: 'simulation',
      };
    }

    const prompt = `You are the AI Learning Twin personal tutor.
Topic: ${topic}
Requested Mode: ${mode} (Options: explain, example, quiz, coding)
Learner Context:
- Current Level: ${profile.estimatedLevel}
- Known Misconceptions: ${profile.misconceptions.join('; ') || 'None identified yet'}
- Weakest Area: ${profile.weakestArea}
- Current Mastery in this area: ${profile.currentMastery.ml_fundamentals || 40}%

Adapt your teaching specifically to overcome the learner's detected misconceptions.
If mode is "explain": Provide a crystal-clear intuitive explanation with real-world analogies tailored to a ${profile.estimatedLevel}.
If mode is "example": Provide concise Python / scikit-learn code demonstrating the concept before-and-after.
If mode is "quiz": Provide a quick interactive mini-scenario with 1 deep question.
If mode is "coding": Provide a small 5-line challenge instructions.

Return a strict, valid JSON object with EXACTLY this structure:
{
  "mode": "${mode}",
  "topic": "${topic}",
  "content": "markdown formatted teaching response",
  "codeSnippet": "optional python code snippet or null",
  "keyTakeaways": ["key point 1", "key point 2", "key point 3"],
  "suggestedFollowUp": "string suggesting the next step (e.g. Take Adaptive Quiz or Try Coding Practice)"
}`;

    const systemInstruction =
      'You are an adaptive AI ML professor. Deliver empathetic, precise, misconception-targeted guidance. Output ONLY valid JSON.';

    try {
      const response = await this.callGemini(prompt, systemInstruction);
      const parsed = this.extractJson<TutorResponse>(response.text);
      return { response: parsed, source: 'gemini' };
    } catch (err) {
      console.warn('Gemini tutor call fallback:', err);
      return {
        response: {
          ...fallback,
          topic,
          mode,
        },
        source: 'simulation',
      };
    }
  }

  /**
   * 3. Generate 5-Question Adaptive Quiz based on weakest concept
   */
  public static async generateAdaptiveQuiz(
    topic: string,
    misconception: string,
    level: string
  ): Promise<{ questions: QuizQuestion[]; source: 'gemini' | 'simulation' }> {
    if (!this.hasApiKey()) {
      return { questions: FALLBACK_ADAPTIVE_QUIZ, source: 'simulation' };
    }

    const prompt = `Generate a 5-question multiple choice adaptive quiz on the topic: "${topic}".
Target Misconception to diagnose and correct: "${misconception}".
Difficulty: ${level}.

Each question must directly test whether the learner has overcome this misconception vs merely guessed.

Return a strict, valid JSON array of 5 objects:
[
  {
    "id": "quiz-1",
    "concept": "${topic}",
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0 (integer index 0 to 3),
    "explanation": "clear explanation of why this is correct and why the misconception is wrong"
  }
]`;

    const systemInstruction = 'You are an AI assessment expert. Output ONLY a valid JSON array of 5 questions.';

    try {
      const response = await this.callGemini(prompt, systemInstruction);
      const parsed = this.extractJson<QuizQuestion[]>(response.text);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return { questions: parsed, source: 'gemini' };
      }
      return { questions: FALLBACK_ADAPTIVE_QUIZ, source: 'simulation' };
    } catch (err) {
      console.warn('Gemini quiz generation fallback:', err);
      return { questions: FALLBACK_ADAPTIVE_QUIZ, source: 'simulation' };
    }
  }

  /**
   * 4. Evaluate Adaptive Quiz Performance & Update Profile
   */
  public static async evaluateQuizPerformance(
    topic: string,
    score: number,
    total: number,
    previousMastery: number,
    profile: LearnerProfile
  ): Promise<{ result: QuizEvaluationResult; source: 'gemini' | 'simulation' }> {
    const percentage = Math.round((score / total) * 100);
    const masteryGain = Math.round((percentage - previousMastery) * 0.4);
    const updatedMastery = Math.min(100, Math.max(10, previousMastery + Math.max(5, masteryGain)));
    const misconceptionResolved = percentage >= 80;

    const fallbackResult: QuizEvaluationResult = {
      score,
      total,
      previousMastery,
      updatedMastery,
      misconceptionResolved,
      detectedMisconception: profile.misconceptions[0] || 'Overfitting vs Underfitting confusion',
      nextRecommendedTopic: misconceptionResolved
        ? 'Regularization (L1 Lasso & L2 Ridge) and Early Stopping'
        : 'Overfitting & Underfitting: Bias-Variance Diagnostics',
      nextDifficulty: misconceptionResolved ? 'Intermediate' : 'Beginner',
      feedback: misconceptionResolved
        ? `Superb! You demonstrated clear mastery (${percentage}%) and eliminated the confusion regarding training accuracy vs true generalization.`
        : `Good effort! You scored ${percentage}%. Reviewing validation curves will solidify your understanding before advancing.`,
    };

    if (!this.hasApiKey()) {
      return { result: fallbackResult, source: 'simulation' };
    }

    const prompt = `A learner completed an adaptive quiz on "${topic}".
Previous Mastery: ${previousMastery}%
Quiz Score: ${score}/${total} (${percentage}%)
Prior Misconceptions: ${profile.misconceptions.join(', ')}

Evaluate their performance and adapt their Learning Twin profile.
Return a strict JSON object with EXACTLY:
{
  "score": ${score},
  "total": ${total},
  "previousMastery": ${previousMastery},
  "updatedMastery": number between ${previousMastery} and 100,
  "misconceptionResolved": boolean,
  "detectedMisconception": "string describing whether the misconception remains or new one surfaced",
  "nextRecommendedTopic": "string for next topic",
  "nextDifficulty": "Beginner" | "Intermediate" | "Advanced",
  "feedback": "encouraging 2-3 sentence personalized feedback explaining their progress"
}`;

    try {
      const response = await this.callGemini(prompt, 'Output ONLY valid JSON.');
      const parsed = this.extractJson<QuizEvaluationResult>(response.text);
      return { result: parsed, source: 'gemini' };
    } catch (err) {
      console.warn('Gemini quiz evaluation fallback:', err);
      return { result: fallbackResult, source: 'simulation' };
    }
  }

  /**
   * 5. Generate Coding Task
   */
  public static async generateCodingTask(
    topic: string,
    profile: LearnerProfile
  ): Promise<{ task: CodingTask; source: 'gemini' | 'simulation' }> {
    if (!this.hasApiKey()) {
      return { task: FALLBACK_CODING_TASK, source: 'simulation' };
    }

    const prompt = `Create a short Python coding practice task for an adaptive AI learner.
Topic: ${topic}
Level: ${profile.estimatedLevel}
Weak Concept: ${profile.weakConcepts[0] || 'Overfitting detection'}

Make the task concise (solvable in 5-15 lines of Python). No complex setup or heavy datasets needed.
Return a strict, valid JSON object:
{
  "id": "code-task-1",
  "title": "short title",
  "topic": "${topic}",
  "concept": "ml_fundamentals",
  "difficulty": "${profile.recommendedDifficulty || 'Beginner'}",
  "description": "clear instructions and signature requirement",
  "starterCode": "python starter code with comments and pass",
  "solutionHint": "helpful hint without giving full code",
  "testCases": [
    {"input": "function_call(x, y)", "expected": "expected_result"},
    {"input": "function_call(a, b)", "expected": "expected_result"}
  ]
}`;

    try {
      const response = await this.callGemini(prompt, 'Output ONLY valid JSON.');
      const parsed = this.extractJson<CodingTask>(response.text);
      return { task: parsed, source: 'gemini' };
    } catch (err) {
      console.warn('Gemini coding task fallback:', err);
      return { task: FALLBACK_CODING_TASK, source: 'simulation' };
    }
  }

  /**
   * 6. Evaluate Code Submission
   */
  public static async evaluateCodeSubmission(
    task: CodingTask,
    userCode: string,
    profile: LearnerProfile
  ): Promise<{ evaluation: CodingEvaluationResult; source: 'gemini' | 'simulation' }> {
    const trimmed = userCode.trim();
    if (!trimmed || trimmed === task.starterCode.trim()) {
      return {
        evaluation: {
          correctness: false,
          score: 10,
          feedback: 'Please write your solution implementation before submitting.',
          mistake: 'Function body contains only pass / empty logic.',
          improvementSuggestion: 'Implement the logic comparing train_acc and test_acc against the threshold.',
          masterySignal: '+0% Mastery unchanged',
          masteryDelta: 0,
        },
        source: 'simulation',
      };
    }

    // Heuristic fallback for offline/simulation mode
    const hasOverfittingCheck = trimmed.includes('train_acc - test_acc') || trimmed.includes('train_acc-test_acc') || (trimmed.includes('train_acc') && trimmed.includes('test_acc'));
    const returnsOverfitting = trimmed.includes('"OVERFITTING"') || trimmed.includes("'OVERFITTING'");
    const returnsUnderfitting = trimmed.includes('"UNDERFITTING"') || trimmed.includes("'UNDERFITTING'");
    const returnsGoodFit = trimmed.includes('"GOOD_FIT"') || trimmed.includes("'GOOD_FIT'");

    const isHeuristicallyCorrect = hasOverfittingCheck && returnsOverfitting && returnsUnderfitting && returnsGoodFit;

    const fallbackEvaluation: CodingEvaluationResult = {
      correctness: isHeuristicallyCorrect,
      score: isHeuristicallyCorrect ? 95 : 60,
      feedback: isHeuristicallyCorrect
        ? 'Excellent solution! Your conditional logic accurately captures both variance (overfitting gap) and bias (underfitting baseline) thresholds.'
        : 'Good attempt. Check your logic for checking both the overfitting gap (train - test > threshold) and the underfitting condition (both < 0.60).',
      mistake: isHeuristicallyCorrect ? null : 'Condition boundaries or return strings may not match all test cases.',
      improvementSuggestion: isHeuristicallyCorrect
        ? 'Consider adding docstrings and type annotations for production-grade clean code.'
        : 'Double check: did you return "GOOD_FIT" as the default fallback when neither condition triggers?',
      masterySignal: isHeuristicallyCorrect ? '+12% Mastery gained in ML Fundamentals' : '+5% Partial progress recorded',
      masteryDelta: isHeuristicallyCorrect ? 12 : 5,
    };

    if (!this.hasApiKey()) {
      return { evaluation: fallbackEvaluation, source: 'simulation' };
    }

    const prompt = `Evaluate this student's Python code submission for the task: "${task.title}".
Task description: ${task.description}
Expected test cases: ${JSON.stringify(task.testCases)}

Student's code:
\`\`\`python
${userCode}
\`\`\`

Return a strict, valid JSON object with EXACTLY:
{
  "correctness": boolean (true if meets requirements, false otherwise),
  "score": integer between 0 and 100,
  "feedback": "friendly constructive evaluation of their solution",
  "mistake": "specific line or logic bug if incorrect, or null if correct",
  "improvementSuggestion": "actionable code quality or ML practice tip",
  "masterySignal": "+X% Mastery gained in ML Fundamentals",
  "masteryDelta": integer between 0 and 15
}`;

    try {
      const response = await this.callGemini(prompt, 'Output ONLY valid JSON.');
      const parsed = this.extractJson<CodingEvaluationResult>(response.text);
      return { evaluation: parsed, source: 'gemini' };
    } catch (err) {
      console.warn('Gemini code evaluation fallback:', err);
      return { evaluation: fallbackEvaluation, source: 'simulation' };
    }
  }
}
