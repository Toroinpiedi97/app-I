import React, { useState, useEffect, useContext } from 'react'
import { promptHistoryService, type PromptHistoryItem } from '../services/promptHistory.ts'
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
    if (!ideaText.trim()) return
    
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
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary-400 mb-2">
          Prompt Generator
        </h2>
        <p className="text-sm text-slate-400">
          Describe your idea and get an optimized prompt for AI image editing
        </p>
      </div>

      {/* Input Area */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Describe Your Idea
          </label>
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="e.g., A futuristic cityscape with flying cars and neon lights..."
            className="input-field w-full h-32 resize-none"
            disabled={loading}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{ideaText.length}/500 characters</span>
            {ideaText.length < 3 && ideaText.length > 0 && (
              <span className="text-yellow-400">Minimum 3 characters</span>
            )}
          </div>
        </div>

        <button
          onClick={handleGeneratePrompt}
          disabled={!ideaText.trim() || ideaText.trim().length < 3 || loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Prompt'
          )}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-red-400 mr-2">⚠️</div>
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-green-400 mr-2">✅</div>
              <div className="text-sm text-green-200">Prompt generated successfully!</div>
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
