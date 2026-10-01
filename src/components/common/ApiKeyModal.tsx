import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, Shield, RefreshCw } from 'lucide-react';
import { GeminiService, DEFAULT_GEMINI_MODEL } from '../../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_GEMINI_MODEL);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(GeminiService.getApiKey() || '');
      setModel(GeminiService.getModel());
      setTestStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      GeminiService.setApiKey(apiKey.trim());
    } else {
      GeminiService.clearApiKey();
    }
    GeminiService.setModel(model);
    onKeyUpdated();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setErrorMessage('Please enter an API key to test.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Temporarily set and test with a lightweight prompt
      const originalKey = GeminiService.getApiKey();
      GeminiService.setApiKey(apiKey.trim());
      GeminiService.setModel(model);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with exactly: "OK"' }] }],
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${res.status}`);
      }

      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setErrorMessage(err?.message || 'Connection failed. Please check key.');
    }
  };

  const handleClear = () => {
    setApiKey('');
    GeminiService.clearApiKey();
    onKeyUpdated();
    setTestStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Google Gemini API Setup</h3>
              <p className="text-xs text-slate-400">Configure your model and API credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
              <span>
                Stored strictly in your local browser storage or configured via{' '}
                <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">.env</code>. Never exposed or logged.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {/* Test Status feedback */}
          {testStatus === 'testing' && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying connection to Google Generative Language API...</span>
            </div>
          )}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Connection Verified! Gemini is active and responding.</span>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-amber-400">💡 Hackathon Ready Note:</span>
            <p>
              If no key is entered, the app seamlessly activates an intelligent local digital twin engine so judges can explore the complete adaptive experience without needing an API key.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              Test Ping
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
