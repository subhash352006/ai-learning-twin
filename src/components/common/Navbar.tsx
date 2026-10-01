import React, { useState } from 'react';
import {
  BrainCircuit,
  RotateCcw,
  Sparkles,
  BarChart2,
  Cpu,
  Layers,
  MessageSquare,
  CheckSquare,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { useLearner, AppView } from '../../context/LearnerContext';

export const Navbar: React.FC = () => {
  const { currentView, navigateTo, profile, resetProfile, loadDemoProfile } = useLearner();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'landing', label: 'Home', icon: Sparkles },
    { view: 'diagnostic', label: 'Diagnostic', icon: BrainCircuit },
    { view: 'dashboard', label: 'Learner Twin', icon: Cpu },
    { view: 'teach_back', label: 'Teach-Back', icon: MessageSquare },
    { view: 'workspace', label: 'Topic Workspace', icon: Layers },
    { view: 'quiz', label: 'Adaptive Quiz', icon: CheckSquare },
    { view: 'progress', label: 'Trajectory', icon: BarChart2 },
  ];

  const handleNavClick = (view: AppView) => {
    navigateTo(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <BrainCircuit className="w-5 h-5 font-bold" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition">
              AI Learning Twin
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              LEARNER MODEL
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Live Twin Model Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              {profile.isDiagnosticComplete ? (
                <>
                  <strong className="text-white">{profile.currentOverallMastery}%</strong> Mastery{' '}
                  <span className="text-slate-500">•</span>{' '}
                  <span className="text-amber-400 font-medium">{profile.level}</span>
                </>
              ) : (
                <span className="text-slate-400">Twin Uncalibrated</span>
              )}
            </span>
          </div>

          {/* Instant Demo Twin loader */}
          <button
            onClick={loadDemoProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition shadow-sm"
            title="Load demo state (ML Fundamentals weak area + overconfidence)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo Twin</span>
          </button>

          {/* Reset button */}
          {profile.isDiagnosticComplete && (
            <button
              onClick={resetProfile}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Reset session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#090d16] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
