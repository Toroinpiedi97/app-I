import React, { useState, useEffect, useContext } from 'react';
import { promptHistoryService } from '../services/promptHistory.ts';
import { formatTimestampShort } from '../utils/datetime.ts';
import { PromptContext } from '../context/PromptContext.tsx';

interface PromptHistoryItem {
  id: string;
  timestamp: Date;
  rawPrompt: string;
  optimizedPrompt: string;
  used?: boolean;
}

const PromptGenerator = () => {
  const [ideaText, setIdeaText] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { setCurrentPrompt } = useContext(PromptContext);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const loadHistory = () => {
    setHistory(promptHistoryService.getRecentHistory(10));
  };

  const handleGeneratePrompt = async () => {
    if (!ideaText.trim()) {
      setError('Please enter an idea first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await window.electronAPI.promptOptimize({
        prompt: ideaText.trim()
      });
      
      setOptimizedPrompt(result.optimizedPrompt);
      setSuccess(true);
      promptHistoryService.addPrompt(ideaText.trim(), result.optimizedPrompt);
      loadHistory();
    } catch (error) {
      console.error('Error generating prompt:', error);
      setError(error instanceof Error ? error.message : 'Could not generate prompt');
      setOptimizedPrompt('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(true);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleHistoryItemClick = (item: PromptHistoryItem) => {
    setOptimizedPrompt(item.optimizedPrompt);
    setIdeaText(item.rawPrompt);
    promptHistoryService.markAsUsed(item.id);
    loadHistory();
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-secondary-200 mb-2">Prompt Generator</h2>
        <p className="text-sm text-secondary-400">
          Describe your idea and let AI optimize it for image generation
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-200 mb-2">
            Describe Your Idea
          </label>
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="e.g., A futuristic cityscape with flying cars and neon lights..."
            className="w-full h-32 resize-none bg-secondary-900/50 border border-secondary-700/50 rounded-lg p-3 text-secondary-200 placeholder-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            disabled={loading}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-secondary-500 mt-1">
            <span>{ideaText.length}/500 characters</span>
            {ideaText.length > 0 && ideaText.length < 3 && (
              <span className="text-yellow-500">Minimum 3 characters</span>
            )}
          </div>
        </div>

        <button
          onClick={handleGeneratePrompt}
          disabled={!ideaText.trim() || ideaText.length < 3 || loading}
          className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </div>
          ) : (
            'Generate Prompt'
          )}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center text-sm text-red-200">{error}</div>
          </div>
        )}

        {optimizedPrompt && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-200 mb-2">
                Optimized Prompt
              </label>
              <textarea
                value={optimizedPrompt}
                readOnly
                className="w-full h-48 resize-none bg-secondary-900/50 border border-secondary-700/50 rounded-lg p-3 text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => copyToClipboard(optimizedPrompt)}
                className="flex-1 py-2 px-4 rounded-lg font-medium bg-secondary-800 border border-secondary-700 hover:bg-secondary-700 transition-all duration-200"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => handleHistoryItemClick({ id: '', timestamp: new Date(), rawPrompt: ideaText, optimizedPrompt })}
                className="flex-1 py-2 px-4 rounded-lg font-medium bg-secondary-800 border border-secondary-700 hover:bg-secondary-700 transition-all duration-200"
              >
                Save to History
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-secondary-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary-200">History</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-secondary-400 hover:text-secondary-200"
            >
              {showHistory ? 'Hide' : 'Show History'}
            </button>
          </div>

          {showHistory && history.length > 0 && (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className="bg-secondary-800/50 rounded-lg p-3 cursor-pointer hover:bg-secondary-800 transition-colors"
                >
                  <div className="text-xs text-secondary-400 mb-1">
                    {formatTimestampShort(item.timestamp)}
                  </div>
                  <div className="text-sm text-secondary-200">{item.rawPrompt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
