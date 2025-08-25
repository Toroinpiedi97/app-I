export interface PromptHistoryItem {
  id: string
  rawPrompt: string
  optimizedPrompt: string
  timestamp: Date
  used: boolean
}

class PromptHistoryService {
  private history: PromptHistoryItem[] = []
  private maxItems = 50

  /**
   * Add a new prompt to history
   */
  addPrompt(rawPrompt: string, optimizedPrompt: string): PromptHistoryItem {
    const item: PromptHistoryItem = {
      id: Date.now().toString(),
      rawPrompt: rawPrompt.trim(),
      optimizedPrompt: optimizedPrompt.trim(),
      timestamp: new Date(),
      used: false
    }

    this.history.unshift(item)

    // Keep only the most recent items
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems)
    }

    return item
  }

  /**
   * Mark a prompt as used
   */
  markAsUsed(id: string): boolean {
    const item = this.history.find(h => h.id === id)
    if (item) {
      item.used = true
      return true
    }
    return false
  }

  /**
   * Get all history items
   */
  getHistory(): PromptHistoryItem[] {
    return [...this.history]
  }

  /**
   * Get recent history (last N items)
   */
  getRecentHistory(limit = 10): PromptHistoryItem[] {
    return this.history.slice(0, limit)
  }

  /**
   * Search history by text
   */
  searchHistory(query: string): PromptHistoryItem[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return this.getHistory()

    return this.history.filter(item => 
      item.rawPrompt.toLowerCase().includes(searchTerm) ||
      item.optimizedPrompt.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * Remove a specific item
   */
  removeItem(id: string): boolean {
    const index = this.history.findIndex(h => h.id === id)
    if (index >= 0) {
      this.history.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number
    used: number
    unused: number
    recent: number
  } {
    const total = this.history.length
    const used = this.history.filter(h => h.used).length
    const unused = total - used
    const recent = this.history.filter(h => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return h.timestamp > hourAgo
    }).length

    return { total, used, unused, recent }
  }
}

// Singleton instance
export const promptHistoryService = new PromptHistoryService()
