"use strict";
class PromptHistoryService {
    constructor() {
        Object.defineProperty(this, "history", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxItems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        });
    }
    /**
     * Add a new prompt to history
     */
    addPrompt(rawPrompt, optimizedPrompt) {
        const item = {
            id: Date.now().toString(),
            rawPrompt: rawPrompt.trim(),
            optimizedPrompt: optimizedPrompt.trim(),
            timestamp: new Date(),
            used: false
        };
        this.history.unshift(item);
        // Keep only the most recent items
        if (this.history.length > this.maxItems) {
            this.history = this.history.slice(0, this.maxItems);
        }
        return item;
    }
    /**
     * Mark a prompt as used
     */
    markAsUsed(id) {
        const item = this.history.find(h => h.id === id);
        if (item) {
            item.used = true;
            return true;
        }
        return false;
    }
    /**
     * Get all history items
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Get recent history (last N items)
     */
    getRecentHistory(limit = 10) {
        return this.history.slice(0, limit);
    }
    /**
     * Search history by text
     */
    searchHistory(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm)
            return this.getHistory();
        return this.history.filter(item => item.rawPrompt.toLowerCase().includes(searchTerm) ||
            item.optimizedPrompt.toLowerCase().includes(searchTerm));
    }
    /**
     * Clear all history
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * Remove a specific item
     */
    removeItem(id) {
        const index = this.history.findIndex(h => h.id === id);
        if (index >= 0) {
            this.history.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get statistics
     */
    getStats() {
        const total = this.history.length;
        const used = this.history.filter(h => h.used).length;
        const unused = total - used;
        const recent = this.history.filter(h => {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return h.timestamp > hourAgo;
        }).length;
        return { total, used, unused, recent };
    }
}
// Singleton instance
const promptHistoryService = new PromptHistoryService();
module.exports = { promptHistoryService, PromptHistoryItem };
