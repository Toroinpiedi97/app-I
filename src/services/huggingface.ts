// Use native fetch for Node.js 18+
const fetch = globalThis.fetch
import { config } from '../config/env'

export interface HFTextToTextRequest {
  inputs: string
  parameters?: {
    temperature?: number
    max_new_tokens?: number
    top_p?: number
    repetition_penalty?: number
  }
}

export interface HFTextToTextResponse {
  generated_text: string
}

export interface HFError {
  error: string
  estimated_time?: number
}

export class HuggingFaceService {
  private baseUrl = config.HF_BASE_URL
  private apiKey = config.HF_API_KEY

  /**
   * Retry configuration for API calls
   */
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt)
    return Math.min(delay, this.retryConfig.maxDelay)
  }

  /**
   * Make HTTP request to Hugging Face API with retry logic
   */
  private async makeRequest<T>(
    model: string,
    data: unknown,
    attempt = 0
  ): Promise<T> {
    try {
      console.log(`[HF API] Calling ${model} (attempt ${attempt + 1})`)
      
      const response = await fetch(`${this.baseUrl}${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AIDesktop-Image-Suite/0.1.0'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json() as HFError
        
        // Handle rate limiting (429) or model loading (503)
        if ((response.status === 429 || response.status === 503) && attempt < this.retryConfig.maxRetries) {
          const delay = errorData.estimated_time 
            ? errorData.estimated_time * 1000 
            : this.calculateDelay(attempt)
          
          console.log(`[HF API] Rate limited/Model loading. Retrying in ${delay}ms...`)
          await this.sleep(delay)
          return this.makeRequest<T>(model, data, attempt + 1)
        }

        throw new Error(`HF API Error (${response.status}): ${errorData.error}`)
      }

      const result = await response.json() as T[]
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('Invalid response format from Hugging Face API')
      }

      return result[0]
    } catch (error) {
      if (attempt < this.retryConfig.maxRetries && error instanceof Error) {
        // Retry on network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          const delay = this.calculateDelay(attempt)
          console.log(`[HF API] Network error. Retrying in ${delay}ms...`)
          await this.sleep(delay)
          return this.makeRequest<T>(model, data, attempt + 1)
        }
      }
      
      throw error
    }
  }

  /**
   * Optimize a prompt using text-to-text model
   */
  async optimizePrompt(
    ideaText: string,
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<string> {
    const { temperature = 0.3, maxTokens = 128 } = options

    // Create a more specific prompt for optimization
    const optimizationPrompt = `Transform this idea into a detailed, professional prompt for AI image generation:

Idea: "${ideaText}"

Optimized prompt:`

    const request: HFTextToTextRequest = {
      inputs: optimizationPrompt,
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    }

    try {
      const response = await this.makeRequest<HFTextToTextResponse>(
        config.HF_PROMPT_MODEL,
        request
      )

      // Clean up the response text
      let optimizedText = response.generated_text
        .replace(optimizationPrompt, '')
        .trim()

      // Remove common artifacts
      optimizedText = optimizedText
        .replace(/^(optimized prompt:|prompt:)/i, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Ensure minimum quality
      if (optimizedText.length < 10) {
        throw new Error('Generated prompt too short')
      }

      return optimizedText
    } catch (error) {
      console.error('[HF API] Error optimizing prompt:', error)
      throw new Error(`Failed to optimize prompt: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate image comment/description
   */
  async generateComment(
    prompt: string,
    context: {
      imageTags?: string[]
      style?: string
    } = {}
  ): Promise<string> {
    const { imageTags = [], style } = context

    // Create context-aware prompt
    let contextPrompt = `Generate a detailed description or comment about this image request: "${prompt}"`
    
    if (imageTags.length > 0) {
      contextPrompt += `\nImage tags: ${imageTags.join(', ')}`
    }
    
    if (style) {
      contextPrompt += `\nStyle context: ${style}`
    }

    contextPrompt += '\n\nComment:'

    const request: HFTextToTextRequest = {
      inputs: contextPrompt,
      parameters: {
        temperature: 0.4,
        max_new_tokens: 128,
        top_p: 0.9
      }
    }

    try {
      const response = await this.makeRequest<HFTextToTextResponse>(
        config.HF_COMMENT_MODEL,
        request
      )

      let comment = response.generated_text
        .replace(contextPrompt, '')
        .trim()

      // Clean up response
      comment = comment
        .replace(/^(comment:|description:)/i, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (comment.length < 5) {
        throw new Error('Generated comment too short')
      }

      return comment
    } catch (error) {
      console.error('[HF API] Error generating comment:', error)
      throw new Error(`Failed to generate comment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== 'your_huggingface_api_key_here' && this.apiKey.length > 0
  }
}

// Singleton instance
export const huggingFaceService = new HuggingFaceService()
