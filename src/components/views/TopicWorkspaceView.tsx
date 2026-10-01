import React, { useState } from 'react';
import {
  Code2,
  Database,
  BrainCircuit,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearner } from '../../context/LearnerContext';
import {
  PYTHON_DEBUG_CHALLENGE,
  DATA_CLEANING_CHALLENGE,
  REASONING_SCENARIO,
} from '../../data/topicChallenges';
import { CognitiveEngine } from '../../services/ai/engine';
import { KnowledgeAreaId } from '../../types';

export const TopicWorkspaceView: React.FC = () => {
  const {
    selectedAreaForWorkspace,
    setSelectedAreaForWorkspace,
    recordWorkspaceActivity,
    navigateTo,
  } = useLearner();

  const [activeArea, setActiveArea] = useState<KnowledgeAreaId>(selectedAreaForWorkspace);

  // Python Debug State
  const [selectedDebugOption, setSelectedDebugOption] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  // Data Cleaning State
  const [cleaningDecisions, setCleaningDecisions] = useState<Record<string, number>>({});
  const [cleaningEvaluated, setCleaningEvaluated] = useState(false);

  // ML Experiment State
  const [expDataSize, setExpDataSize] = useState<number>(100);
  const [expReg, setExpReg] = useState<number>(0.1);
  const [expComplexity, setExpComplexity] = useState<number>(8); // starts in overfitting zone to demonstrate!

  // Model Evaluation Reasoning State
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [reasoningText, setReasoningText] = useState<string>('');
  const [reasoningEvaluated, setReasoningEvaluated] = useState(false);

  const experimentState = CognitiveEngine.simulateMLExperiment(
    expDataSize,
    expReg,
    expComplexity
  );

  const handleTabChange = (area: KnowledgeAreaId) => {
    setActiveArea(area);
    setSelectedAreaForWorkspace(area);
  };

  // Python Debug Submit
  const handleDebugSubmit = () => {
    if (!selectedDebugOption) return;
    const option = PYTHON_DEBUG_CHALLENGE.options.find((o) => o.id === selectedDebugOption);
    if (!option) return;

    if (option.isCorrect) {
      setDebugResult({
        isCorrect: true,
        feedback: 'Correct! Initializing default parameters to `None` inside the function signature ensures a fresh list is created per function call, eliminating state leakage across batches.',
      });
      recordWorkspaceActivity('python', 'Python Debug: Model Cache Fix', 90, 'Resolved mutable default argument bug.');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      setDebugResult({
        isCorrect: false,
        feedback: `Incorrect: ${option.reasoningFlaw || 'This does not resolve the persistent default instance in memory.'}`,
      });
      recordWorkspaceActivity('python', 'Python Debug: Attempted Fix', 45, 'Identified reasoning flaw in Python parameter scoping.');
    }
  };

  // Data Cleaning Submit
  const handleCleaningSubmit = () => {
    setCleaningEvaluated(true);
    let correctCount = 0;
    DATA_CLEANING_CHALLENGE.decisions.forEach((d) => {
      const choiceIdx = cleaningDecisions[d.id];
      if (choiceIdx !== undefined && d.options[choiceIdx]?.isOptimal) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / DATA_CLEANING_CHALLENGE.decisions.length) * 100);
    recordWorkspaceActivity(
      'data_handling',
      'Data Cleaning: Churn Pipeline',
      score,
      `Handled outliers and categorical normalization with ${correctCount}/${DATA_CLEANING_CHALLENGE.decisions.length} optimal decisions.`
    );
  };

  // Reasoning Mode Submit
  const handleReasoningSubmit = () => {
    if (!selectedMetric) return;
    setReasoningEvaluated(true);
    const isRecall = selectedMetric === 'Recall';
    const hasSolidReasoning =
      reasoningText.toLowerCase().includes('false negative') ||
      reasoningText.toLowerCase().includes('miss') ||
      reasoningText.toLowerCase().includes('fatal') ||
      reasoningText.toLowerCase().includes('patient');

    const score = isRecall ? (hasSolidReasoning ? 95 : 80) : 40;
    recordWorkspaceActivity(
      'model_evaluation',
      'Reasoning: Oncology Metric Defense',
      score,
      isRecall
        ? 'Defended Recall prioritization to prevent fatal False Negatives.'
        : 'Fell into accuracy/precision tradeoff misconception.'
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Topic Workspace
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Interaction Mode Calibrated Per Subject
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Subject-Specific Interaction Modes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            No cookie-cutter chatbots. Python uses Debugging, Data uses Cleaning, ML uses Experiments, and Evaluation uses Reasoning.
          </p>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleTabChange('python')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition ${
            activeArea === 'python'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Python</span>
          <span className="text-[10px] text-amber-300/80 font-medium">Debug Mode</span>
        </button>

        <button
          onClick={() => handleTabChange('data_handling')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition ${
            activeArea === 'data_handling'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Data Handling</span>
          <span className="text-[10px] text-amber-300/80 font-medium">Data Cleaning Mode</span>
        </button>

        <button
          onClick={() => handleTabChange('ml_fundamentals')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition ${
            activeArea === 'ml_fundamentals'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BrainCircuit className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">ML Fundamentals</span>
          <span className="text-[10px] text-amber-300/80 font-medium">Experiment Mode</span>
        </button>

        <button
          onClick={() => handleTabChange('model_evaluation')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition ${
            activeArea === 'model_evaluation'
              ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Gauge className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Model Evaluation</span>
          <span className="text-[10px] text-amber-300/80 font-medium">Reasoning Mode</span>
        </button>
      </div>

      {/* MODE 1: PYTHON -> DEBUG MODE */}
      {activeArea === 'python' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Python &bull; Debug Mode
              </span>
              <h3 className="text-lg font-bold text-white">{PYTHON_DEBUG_CHALLENGE.title}</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {PYTHON_DEBUG_CHALLENGE.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Buggy Python Code:</span>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{PYTHON_DEBUG_CHALLENGE.codeSnippet}</code>
            </pre>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-slate-300 block">Expected Behavior:</strong>
              <p className="text-slate-400">{PYTHON_DEBUG_CHALLENGE.expectedBehavior}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
              <strong className="text-rose-400 block">Observed Bug Behavior:</strong>
              <p className="text-rose-200">{PYTHON_DEBUG_CHALLENGE.actualBehavior}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Identify the Correct Architectural Fix:
            </span>
            {PYTHON_DEBUG_CHALLENGE.options.map((opt) => {
              const isSelected = selectedDebugOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDebugOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border text-xs transition space-y-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="font-semibold text-white">{opt.description}</p>
                  <pre className="p-2 rounded bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto">
                    <code>{opt.codeFix}</code>
                  </pre>
                </button>
              );
            })}
          </div>

          {debugResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 animate-fade-in ${
                debugResult.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500 text-rose-200'
              }`}
            >
              <strong className="block text-sm">
                {debugResult.isCorrect ? 'Fix Verified!' : 'Reasoning Flaw Detected'}
              </strong>
              <p className="leading-relaxed">{debugResult.feedback}</p>
              <p className="text-slate-300 text-[11px] pt-1 italic">{PYTHON_DEBUG_CHALLENGE.explanation}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleDebugSubmit}
              disabled={!selectedDebugOption}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition disabled:opacity-40"
            >
              Verify Fix & Update Twin
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: DATA HANDLING -> DATA CLEANING MODE */}
      {activeArea === 'data_handling' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Data Handling &bull; Data Cleaning Decision Mode
              </span>
              <h3 className="text-lg font-bold text-white">{DATA_CLEANING_CHALLENGE.title}</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {DATA_CLEANING_CHALLENGE.difficulty}
            </span>
          </div>

          {/* Dataset Preview Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Raw Data Inspection: {DATA_CLEANING_CHALLENGE.datasetName}
            </span>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    {DATA_CLEANING_CHALLENGE.datasetPreview.columns.map((c) => (
                      <th key={c} className="px-3 py-2.5">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {DATA_CLEANING_CHALLENGE.datasetPreview.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      {row.map((val, cellIdx) => {
                        const isNull = val === null;
                        const isOutlier = val === 380 || val === -15.0;
                        const isCasingIssue = val === 'premium';
                        const isDupe = idx === 5;

                        let style = '';
                        if (isNull) style = 'text-rose-400 font-bold bg-rose-500/10 px-1 rounded';
                        if (isOutlier) style = 'text-amber-400 font-bold bg-amber-500/10 px-1 rounded';
                        if (isCasingIssue) style = 'text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded';
                        if (isDupe) style = 'text-purple-400 font-bold';

                        return (
                          <td key={cellIdx} className="px-3 py-2">
                            <span className={style}>{val === null ? 'null (NaN)' : String(val)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decision Prompts */}
          <div className="space-y-5 pt-2">
            {DATA_CLEANING_CHALLENGE.decisions.map((decision) => (
              <div key={decision.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-white">{decision.question}</p>
                <div className="space-y-2">
                  {decision.options.map((opt, optIdx) => {
                    const isSelected = cleaningDecisions[decision.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() =>
                          setCleaningDecisions((prev) => ({
                            ...prev,
                            [decision.id]: optIdx,
                          }))
                        }
                        className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 flex-shrink-0">
                          {optIdx + 1}
                        </span>
                        <div>
                          <span>{opt.text}</span>
                          {cleaningEvaluated && isSelected && (
                            <span
                              className={`block mt-1 font-semibold text-[11px] ${
                                opt.isOptimal ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              &rarr; {opt.consequence}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCleaningSubmit}
              disabled={Object.keys(cleaningDecisions).length < 2}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition disabled:opacity-40"
            >
              Evaluate Cleaning Decisions
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: MACHINE LEARNING -> EXPERIMENT MODE */}
      {activeArea === 'ml_fundamentals' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Machine Learning &bull; Interactive Experiment Mode
              </span>
              <h3 className="text-lg font-bold text-white">
                Live Bias-Variance Simulator (Logistic / Polynomial Classifier)
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Cause & Effect Learning
            </span>
          </div>

          {/* Interactive Sliders */}
          <div className="grid sm:grid-cols-3 gap-6 p-5 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Slider 1: Dataset Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Training Dataset Size:</span>
                <span className="text-amber-400 font-mono font-bold">{expDataSize} samples</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="20"
                value={expDataSize}
                onChange={(e) => setExpDataSize(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">More data mitigates high-variance overfitting.</span>
            </div>

            {/* Slider 2: Regularization L2 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Regularization (L2 Penalty &lambda;):</span>
                <span className="text-amber-400 font-mono font-bold">{expReg}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="5.0"
                step="0.05"
                value={expReg}
                onChange={(e) => setExpReg(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Higher &lambda; shrinks weights, reducing variance.</span>
            </div>

            {/* Slider 3: Model Complexity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Model Complexity (Degree):</span>
                <span className="text-amber-400 font-mono font-bold">Degree {expComplexity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={expComplexity}
                onChange={(e) => setExpComplexity(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Higher complexity creates intricate boundaries.</span>
            </div>
          </div>

          {/* Live Simulated Metrics & Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Training Accuracy</span>
              <span className="text-2xl font-black text-emerald-400 block">{experimentState.trainAccuracy}%</span>
              <span className="text-[10px] text-slate-500">Train Loss: {experimentState.trainLoss}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Validation Accuracy</span>
              <span className="text-2xl font-black text-amber-400 block">{experimentState.valAccuracy}%</span>
              <span className="text-[10px] text-slate-500">Val Loss: {experimentState.valLoss}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Generalization Gap</span>
              <span
                className={`text-2xl font-black block ${
                  experimentState.generalizationGap > 18 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {experimentState.generalizationGap}%
              </span>
              <span className="text-[10px] text-slate-500">Train vs. Validation delta</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Current Regime</span>
              <span
                className={`text-xs font-black block pt-1.5 ${
                  experimentState.state.includes('Overfitting')
                    ? 'text-rose-400'
                    : experimentState.state.includes('Underfitting')
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {experimentState.state}
              </span>
            </div>
          </div>

          {/* Cognitive Cause-and-Effect Insight */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Cause & Effect Insight
            </span>
            <p className="text-slate-300 leading-relaxed">{experimentState.explanation}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                recordWorkspaceActivity(
                  'ml_fundamentals',
                  'ML Experiment: Bias-Variance Calibration',
                  88,
                  `Explored complexity ${expComplexity} with reg ${expReg}. Generalization gap: ${experimentState.generalizationGap}%.`
                );
                navigateTo('teach_back');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition"
            >
              <span>Explain in Teach-Back Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: MODEL EVALUATION -> REASONING MODE */}
      {activeArea === 'model_evaluation' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Model Evaluation &bull; Reasoning Mode
              </span>
              <h3 className="text-lg font-bold text-white">{REASONING_SCENARIO.title}</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
              High-Stakes Clinical AI
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>{REASONING_SCENARIO.context}</p>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200">
              <strong>Asymmetry of Errors:</strong> {REASONING_SCENARIO.criticalRisk}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              1. Choose the Primary Metric to Optimize:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {REASONING_SCENARIO.metrics.map((m) => {
                const isSelected = selectedMetric === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMetric(m.name)}
                    className={`p-3.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold block text-white">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              2. Defend Your Decision (Why?):
            </span>
            <textarea
              rows={3}
              value={reasoningText}
              onChange={(e) => setReasoningText(e.target.value)}
              placeholder="I chose this metric because missing a positive case (False Negative) results in..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {reasoningEvaluated && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs text-slate-300 animate-fade-in">
              <strong className="text-amber-400 block text-sm">Cognitive Reasoning Evaluation:</strong>
              {selectedMetric === 'Recall' ? (
                <div className="text-emerald-300">
                  ✓ <strong>Correct!</strong> Recall / Sensitivity prioritizes minimizing False Negatives. In cancer screening, catching 100% of true cases is essential, even if some false alarms require secondary confirmation biopsies.
                </div>
              ) : (
                <div className="text-rose-300">
                  ⚠ <strong>Misconception:</strong> Selecting {selectedMetric} risks fatal False Negatives.
                  {REASONING_SCENARIO.metrics.find((m) => m.name === selectedMetric)?.reasonIfSelected}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleReasoningSubmit}
              disabled={!selectedMetric || !reasoningText.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition disabled:opacity-40"
            >
              Evaluate Reasoning & Update Twin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
