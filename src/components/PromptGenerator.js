"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require('react');
const { useState, useEffect } = React;
const { promptHistoryService } = require('../services/promptHistory');
const PromptGenerator = () => {
    const [ideaText, setIdeaText] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    // Load prompt history on component mount
    useEffect(() => {
        loadHistory();
    }, []);
    // Clear success/error messages after delay
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
        if (!ideaText.trim())
            return;
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const result = await window.electronAPI.promptOptimize({
                ideaText: ideaText.trim(),
                temperature: 0.3
            });
            setOptimizedPrompt(result.optimizedPrompt);
            setSuccess(true);
            // Add to history
            promptHistoryService.addPrompt(ideaText.trim(), result.optimizedPrompt);
            loadHistory();
        }
        catch (error) {
            console.error('Error generating prompt:', error);
            const errorMessage = error instanceof Error ? error.message : 'Could not generate prompt';
            setError(errorMessage);
            setOptimizedPrompt('');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUsePrompt = () => {
        // TODO: Send prompt to Image Editor column
        console.log('Using prompt:', optimizedPrompt);
        setSuccess(true);
    };
    const handleUseHistoryPrompt = (item) => {
        setOptimizedPrompt(item.optimizedPrompt);
        setIdeaText(item.rawPrompt);
        promptHistoryService.markAsUsed(item.id);
        loadHistory();
        setShowHistory(false);
    };
    const handleClearHistory = () => {
        promptHistoryService.clearHistory();
        loadHistory();
    };
    const formatTimestamp = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-primary-400 mb-2", children: "Prompt Generator" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400", children: "Describe your idea and get an optimized prompt for AI image editing" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Describe Your Idea" }), (0, jsx_runtime_1.jsx)("textarea", { value: ideaText, onChange: (e) => setIdeaText(e.target.value), placeholder: "e.g., A futuristic cityscape with flying cars and neon lights...", className: "input-field w-full h-32 resize-none", disabled: loading, maxLength: 500 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xs text-slate-400 mt-1", children: [(0, jsx_runtime_1.jsxs)("span", { children: [ideaText.length, "/500 characters"] }), ideaText.length < 3 && ideaText.length > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "text-yellow-400", children: "Minimum 3 characters" }))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGeneratePrompt, disabled: !ideaText.trim() || ideaText.trim().length < 3 || loading, className: "btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Generating..."] })) : ('Generate Prompt') }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-900/50 border border-red-700 rounded-lg p-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-red-400 mr-2", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-red-200", children: error })] }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "bg-green-900/50 border border-green-700 rounded-lg p-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-green-400 mr-2", children: "\u2705" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-green-200", children: "Prompt generated successfully!" })] }) })), optimizedPrompt && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-slate-300", children: "Optimized Prompt" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-slate-700 border border-slate-600 rounded-lg p-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-200", children: optimizedPrompt }) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleUsePrompt, className: "btn-secondary w-full", children: "Use This Prompt" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 pt-4 border-t border-slate-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-slate-300", children: "Recent Prompts" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowHistory(!showHistory), className: "text-xs text-slate-400 hover:text-slate-300", children: showHistory ? 'Hide' : 'Show' }), history.length > 0 && ((0, jsx_runtime_1.jsx)("button", { onClick: handleClearHistory, className: "text-xs text-red-400 hover:text-red-300", children: "Clear" }))] })] }), showHistory && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: history.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-slate-500 text-center py-2", children: "No recent prompts yet" })) : (history.map((item) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-slate-700 border border-slate-600 rounded p-2 hover:bg-slate-600 cursor-pointer transition-colors", onClick: () => handleUseHistoryPrompt(item), children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-400 mb-1 flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: formatTimestamp(item.timestamp) }), item.used && (0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "\u2713" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-slate-300 truncate", children: item.rawPrompt }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-400 truncate mt-1", children: ["\u2192 ", item.optimizedPrompt] })] }, item.id)))) })), !showHistory && history.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-500", children: [history.length, " recent prompt", history.length !== 1 ? 's' : '', " available"] }))] })] }));
};
module.exports = { default: PromptGenerator };
