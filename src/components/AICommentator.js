"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require('react');
const { useState } = React;
const AICommentator = () => {
    const [commentPrompt, setCommentPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleGenerateComment = async () => {
        if (!commentPrompt.trim())
            return;
        setLoading(true);
        try {
            const result = await window.electronAPI.commentGenerate({
                prompt: commentPrompt.trim(),
                context: {
                    imageTags: [],
                    style: undefined
                }
            });
            // Add AI response to messages
            const aiMessage = {
                id: Date.now().toString(),
                text: result.text,
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setCommentPrompt('');
        }
        catch (error) {
            console.error('Error generating comment:', error);
            // Add error message with more details
            const errorText = error instanceof Error ? error.message : 'Could not generate comment';
            const errorMessage = {
                id: Date.now().toString(),
                text: `Error: ${errorText}`,
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSendChatMessage = async () => {
        if (!commentPrompt.trim())
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            text: commentPrompt.trim(),
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setCommentPrompt('');
        // Generate AI response
        await handleGenerateComment();
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-primary-400 mb-2", children: "AI Commentator" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400", children: "Generate descriptions and comments for your images" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-slate-700 border border-slate-600 rounded-lg p-3 h-64 overflow-y-auto", children: messages.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-slate-400 py-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl mb-2", children: "\uD83D\uDCAC" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm", children: "Start a conversation about your image" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: messages.map((message) => ((0, jsx_runtime_1.jsx)("div", { className: `flex ${message.isUser ? 'justify-end' : 'justify-start'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: `max-w-[80%] rounded-lg px-3 py-2 text-sm ${message.isUser
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-600 text-slate-200'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-1", children: message.text }), (0, jsx_runtime_1.jsx)("div", { className: `text-xs ${message.isUser ? 'text-primary-200' : 'text-slate-400'}`, children: formatTime(message.timestamp) })] }) }, message.id))) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("textarea", { value: commentPrompt, onChange: (e) => setCommentPrompt(e.target.value), placeholder: "Ask about the image or describe what you want to know...", className: "input-field w-full h-20 resize-none", disabled: loading, onKeyPress: (e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendChatMessage();
                                    }
                                } }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSendChatMessage, disabled: !commentPrompt.trim() || loading, className: "btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Generating...' : 'Send' }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGenerateComment, disabled: !commentPrompt.trim() || loading, className: "btn-secondary disabled:opacity-50 disabled:cursor-not-allowed", title: "Generate comment without sending to chat", children: "Generate" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 pt-4 border-t border-slate-700", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-slate-300 mb-2", children: "Quick Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setCommentPrompt('Describe this image in detail'), className: "btn-secondary text-xs", children: "Describe" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCommentPrompt('What style is this image?'), className: "btn-secondary text-xs", children: "Style" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCommentPrompt('Suggest improvements'), className: "btn-secondary text-xs", children: "Improve" })] })] })] }));
};
module.exports = { default: AICommentator };
