import React, { useState, useEffect, useContext } from 'react'
import { promptHistoryService, PromptHistoryItem } from '../services/promptHistory.ts'
import { formatTimestampShort } from '../utils/datetime.ts'
import { PromptContext } from '../context/PromptContext.tsx'



const PromptGenerator: React.FC = () => {
  const [ideaText, setIdeaText] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [history, setHistory] = useState<PromptHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { setCurrentPrompt } = useContext(PromptContext)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }

  // Load prompt history on component mount
  useEffect(() => {
    loadHistory()
  }, [])

  // Clear success/error messages after delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const loadHistory = () => {
    setHistory(promptHistoryService.getRecentHistory(10))
  }

  const handleGeneratePrompt = async () => {
    if (!ideaText.trim()) {
      setError('Please enter an idea first')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const result = await window.electronAPI.promptOptimize({
        ideaText: ideaText.trim(),
        temperature: 0.3
      })
      
      setOptimizedPrompt(result.optimizedPrompt)
      setSuccess(true)
      
      // Add to history
      promptHistoryService.addPrompt(ideaText.trim(), result.optimizedPrompt)
      loadHistory()
      
    } catch (error) {
      console.error('Error generating prompt:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not generate prompt'
      setError(errorMessage)
      setOptimizedPrompt('')
    } finally {
      setLoading(false)
    }
  }

  const handleUsePrompt = () => {
    if (!optimizedPrompt) return
    setCurrentPrompt(optimizedPrompt)
    setSuccess(true)
  }

  const handleUseHistoryPrompt = (item: PromptHistoryItem) => {
    setOptimizedPrompt(item.optimizedPrompt)
    setIdeaText(item.rawPrompt)
    promptHistoryService.markAsUsed(item.id)
    loadHistory()
    setShowHistory(false)
  }

  const handleClearHistory = () => {
    promptHistoryService.clearHistory()
    loadHistory()
  }

  const formatTimestamp = (date: Date) => formatTimestampShort(date)

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
          Prompt Generator
        </h2>
        <p className="text-sm text-secondary-400">
          Describe your idea and let AI optimize it for image generation
        </p>
      </div>

      {/* Input Area */}
      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-200 mb-2 flex items-center">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 rounded w-1 h-4 mr-2"></span>
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
          <div className="flex justify-between text-xs text-secondary-500 mt-2">
            <span>{ideaText.length}/500 characters</span>
            {ideaText.length < 3 && ideaText.length > 0 && (
              <span className="text-yellow-500">Minimum 3 characters</span>
            )}
          </div>
        </div>

        <button
          onClick={handleGeneratePrompt}
          disabled={!ideaText.trim() || ideaText.trim().length < 3 || loading}
          className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-accent-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimizing prompt...
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              <span>Generate Optimized Prompt</span>
            </div>
          )}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500">
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3 text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center">
              <div className="text-green-500">
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="ml-3 text-sm text-green-200">Prompt generated successfully!</div>
            </div>
          </div>
        )}

        {/* Generated Prompt Display */}
        {optimizedPrompt && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-200 mb-2 flex items-center">
                <span className="bg-gradient-to-r from-accent-400 to-primary-400 rounded w-1 h-4 mr-2"></span>
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
                className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-secondary-800 border border-secondary-700 hover:bg-secondary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                  </svg>
                  <span>Copy to Clipboard</span>
                </div>
              </button>
              <button
                onClick={handleSavePrompt}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-secondary-800 border border-secondary-700 hover:bg-secondary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8"></path>
                  </svg>
                  <span>Save Prompt</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      <div className="w-80 bg-secondary-900 border-l border-secondary-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-secondary-200 flex items-center">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 rounded w-1 h-5 mr-3"></span>
            History
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-secondary-400 hover:text-secondary-200 transition-colors duration-200"
          >
            <svg className={`w-6 h-6 transform transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        {showHistory && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-secondary-500 text-sm flex items-center justify-center p-6 border border-dashed border-secondary-800 rounded-lg">
                <svg className="w-5 h-5 mr-2 opacity-75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Start generating prompts to see history
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-secondary-800/50 rounded-lg p-4 cursor-pointer hover:bg-secondary-800 border border-secondary-700/50 transition-all duration-200"
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <div className="text-sm text-secondary-200 mb-2 line-clamp-2 font-medium">
                    {item.rawPrompt}
                  </div>
                  <div className="text-xs text-secondary-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 opacity-75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {formatTimestampShort(item.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
          </div>
        )}

        {/* Optimized Prompt Display */}
        {optimizedPrompt && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Optimized Prompt
            </label>
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-3">
              <p className="text-sm text-slate-200">{optimizedPrompt}</p>
            </div>
            <button
              onClick={handleUsePrompt}
              className="btn-secondary w-full"
            >
              Use This Prompt
            </button>
          </div>
        )}
      </div>

      {/* Prompt History */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-300">
            Recent Prompts
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-slate-400 hover:text-slate-300"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-2">
                No recent prompts yet
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700 border border-slate-600 rounded p-2 hover:bg-slate-600 cursor-pointer transition-colors"
                  onClick={() => handleUseHistoryPrompt(item)}
                >
                  <div className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>{formatTimestamp(item.timestamp)}</span>
                    {item.used && <span className="text-green-400">✓</span>}
                  </div>
                  <div className="text-xs text-slate-300 truncate">
                    {item.rawPrompt}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">
                    → {item.optimizedPrompt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!showHistory && history.length > 0 && (
          <div className="text-xs text-slate-500">
            {history.length} recent prompt{history.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptGenerator
