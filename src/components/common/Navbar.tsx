import React, { useState } from 'react';
import {
  BrainCircuit,
  Key,
  RotateCcw,
  Sparkles,
  BarChart2,
  BookOpen,
  CheckSquare,
  Terminal,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { useLearner, AppView } from '../../context/LearnerContext';
import { GeminiService } from '../../services/gemini';
import { ApiKeyModal } from './ApiKeyModal';

export const Navbar: React.FC = () => {
  const { currentView, navigateTo, profile, resetProfile, loadDemoProfile } = useLearner();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasKey, setHasKey] = useState(GeminiService.hasApiKey());

  const navItems: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'landing', label: 'Home', icon: Sparkles },
    { view: 'diagnostic', label: 'Diagnostic', icon: BrainCircuit },
    { view: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { view: 'tutor', label: 'AI Tutor', icon: BookOpen },
    { view: 'quiz', label: 'Adaptive Quiz', icon: CheckSquare },
    { view: 'coding', label: 'Coding Practice', icon: Terminal },
    { view: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const handleNavClick = (view: AppView) => {
    navigateTo(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
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
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADAPTIVE
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* API Connection Indicator */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                hasKey
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Configure Gemini API Key"
            >
              <Radio className={`w-3 h-3 ${hasKey ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                {hasKey ? 'Gemini 2.5 Active' : 'Twin Simulation'}
              </span>
              <Key className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Quick Demo Mode loader */}
            <button
              onClick={loadDemoProfile}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              title="Quick-load sample learner state for demo"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Load Demo Twin</span>
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

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#090d16] px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
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
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  loadDemoProfile();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-amber-300 border border-slate-700"
              >
                Load Demo Twin
              </button>
              <button
                onClick={() => {
                  setIsKeyModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30"
              >
                API Key
              </button>
            </div>
          </div>
        )}
      </header>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={() => setHasKey(GeminiService.hasApiKey())}
      />
    </>
  );
};
