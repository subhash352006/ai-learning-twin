import React from 'react';
import { Brain, Cpu, Sparkles, Activity } from 'lucide-react';
import { LearnerProfile } from '../../types';

interface DigitalTwinVisualizerProps {
  profile: LearnerProfile;
}

export const DigitalTwinVisualizer: React.FC<DigitalTwinVisualizerProps> = ({ profile }) => {
  const { currentMastery, level, currentOverallMastery, weakestArea, strongestArea } = profile;

  const getNodeColor = (score: number) => {
    if (score >= 75) return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
    if (score >= 50) return { border: 'border-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' };
    return { border: 'border-rose-500', bg: 'bg-rose-500/20', text: 'text-rose-400', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' };
  };

  const pyColor = getNodeColor(currentMastery.python);
  const dataColor = getNodeColor(currentMastery.data_handling);
  const mlColor = getNodeColor(currentMastery.ml_fundamentals);
  const evalColor = getNodeColor(currentMastery.model_evaluation);

  return (
    <div className="relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-6 overflow-hidden">
      {/* Background ambient grid and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b10_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Cognitive Twin</h3>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Activity className="w-3 h-3" /> LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400">Dynamic model of your AI/ML conceptual architecture</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-400">{currentOverallMastery}%</span>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Overall Mastery</p>
        </div>
      </div>

      {/* Visual Canvas: Neural Graph representation */}
      <div className="relative py-4 px-2 min-h-[220px] flex items-center justify-center">
        {/* Synaptic connection lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="75%" y1="25%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>

        {/* Center Twin Core */}
        <div className="z-10 text-center bg-slate-900/90 border-2 border-amber-400/60 rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)] transition hover:scale-105">
          <Cpu className="w-6 h-6 text-amber-400 mb-1" />
          <span className="text-xs font-bold text-white tracking-wide">TWIN CORE</span>
          <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 mt-0.5">
            {level}
          </span>
        </div>

        {/* 4 Orbiting Nodes */}
        {/* Node 1: Python (Top-Left) */}
        <div className={`absolute top-2 left-2 sm:left-6 p-2.5 rounded-xl bg-slate-950/90 border ${pyColor.border} ${pyColor.glow} text-left transition hover:-translate-y-1`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Python</div>
          <div className={`text-sm font-black ${pyColor.text}`}>{currentMastery.python}%</div>
        </div>

        {/* Node 2: Data Handling (Top-Right) */}
        <div className={`absolute top-2 right-2 sm:right-6 p-2.5 rounded-xl bg-slate-950/90 border ${dataColor.border} ${dataColor.glow} text-right transition hover:-translate-y-1`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Data Handling</div>
          <div className={`text-sm font-black ${dataColor.text}`}>{currentMastery.data_handling}%</div>
        </div>

        {/* Node 3: ML Fundamentals (Bottom-Left) */}
        <div className={`absolute bottom-2 left-2 sm:left-6 p-2.5 rounded-xl bg-slate-950/90 border ${mlColor.border} ${mlColor.glow} text-left transition hover:translate-y-1`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">ML Fundamentals</div>
          <div className={`text-sm font-black ${mlColor.text}`}>{currentMastery.ml_fundamentals}%</div>
        </div>

        {/* Node 4: Model Evaluation (Bottom-Right) */}
        <div className={`absolute bottom-2 right-2 sm:right-6 p-2.5 rounded-xl bg-slate-950/90 border ${evalColor.border} ${evalColor.glow} text-right transition hover:translate-y-1`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Model Eval</div>
          <div className={`text-sm font-black ${evalColor.text}`}>{currentMastery.model_evaluation}%</div>
        </div>
      </div>

      {/* Footer Quick Insight */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Strongest: <strong className="text-white">{strongestArea}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Friction Zone: <strong className="text-rose-400">{weakestArea}</strong></span>
        </div>
      </div>
    </div>
  );
};
