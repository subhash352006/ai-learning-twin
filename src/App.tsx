import React from 'react';
import { LearnerProvider, useLearner } from './context/LearnerContext';
import { Navbar } from './components/common/Navbar';
import { LandingView } from './components/views/LandingView';
import { GoalSelectionView } from './components/views/GoalSelectionView';
import { DiagnosticView } from './components/views/DiagnosticView';
import { DashboardView } from './components/views/DashboardView';
import { TutorView } from './components/views/TutorView';
import { AdaptiveQuizView } from './components/views/AdaptiveQuizView';
import { CodingPracticeView } from './components/views/CodingPracticeView';
import { ProgressView } from './components/views/ProgressView';
import { BrainCircuit, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView } = useLearner();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'goals':
        return <GoalSelectionView />;
      case 'diagnostic':
        return <DiagnosticView />;
      case 'dashboard':
        return <DashboardView />;
      case 'tutor':
        return <TutorView />;
      case 'quiz':
        return <AdaptiveQuizView />;
      case 'coding':
        return <CodingPracticeView />;
      case 'progress':
        return <ProgressView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <main className="flex-1">{renderView()}</main>

      {/* Global Hackathon Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">AI Learning Twin</span>
            <span className="text-slate-500">•</span>
            <span>Adaptive Cognitive Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Gemini Powered</span>
            </span>
            <span>•</span>
            <span>Vercel + GitHub Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <LearnerProvider>
      <AppContent />
    </LearnerProvider>
  );
}

export default App;
