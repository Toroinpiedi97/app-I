// src/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import isDev from "electron-is-dev";

// src/config/env.ts
var config = {
  // Hugging Face API Configuration
  HF_API_KEY: process.env.HF_API_KEY || "",
  HF_PROMPT_MODEL: process.env.HF_PROMPT_MODEL || "google/flan-t5-base",
  HF_INPAINT_MODEL: process.env.HF_INPAINT_MODEL || "stabilityai/stable-diffusion-2-inpainting",
  HF_COMMENT_MODEL: process.env.HF_COMMENT_MODEL || "tiiuae/falcon-7b-instruct",
  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || "your_supabase_project_url_here",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "your_supabase_anon_key_here",
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || "images",
  // App Configuration
  APP_NAME: "AIDesktop Image Suite",
  APP_VERSION: "0.1.0",
  // Development
  IS_DEV: process.env.NODE_ENV === "development",
  // API Endpoints
  HF_BASE_URL: "https://api-inference.huggingface.co/models/"
};

// src/services/huggingface.ts
var fetch = globalThis.fetch;
var HuggingFaceService = class {
  baseUrl = config.HF_BASE_URL;
  apiKey = config.HF_API_KEY;
  /**
   * Retry configuration for API calls
   */
  retryConfig = {
    maxRetries: 3,
    baseDelay: 1e3,
    // 1 second
    maxDelay: 3e4,
    // 30 seconds
    backoffFactor: 2
  };
  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Calculate exponential backoff delay
   */
  calculateDelay(attempt) {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }
  /**
   * Make HTTP request to Hugging Face API with retry logic
   */
  async makeRequest(model, data, attempt = 0) {
    try {
      console.log(`[HF API] Calling ${model} (attempt ${attempt + 1})`);
      const response = await fetch(`${this.baseUrl}${model}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "AIDesktop-Image-Suite/0.1.0"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        if ((response.status === 429 || response.status === 503) && attempt < this.retryConfig.maxRetries) {
          const delay = errorData.estimated_time ? errorData.estimated_time * 1e3 : this.calculateDelay(attempt);
          console.log(`[HF API] Rate limited/Model loading. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.makeRequest(model, data, attempt + 1);
        }
        throw new Error(`HF API Error (${response.status}): ${errorData.error}`);
      }
      const result = await response.json();
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Invalid response format from Hugging Face API");
      }
      return result[0];
    } catch (error) {
      if (attempt < this.retryConfig.maxRetries && error instanceof Error) {
        if (error.message.includes("fetch") || error.message.includes("network")) {
          const delay = this.calculateDelay(attempt);
          console.log(`[HF API] Network error. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.makeRequest(model, data, attempt + 1);
        }
      }
      throw error;
    }
  }
  /**
   * Optimize a prompt using text-to-text model
   */
  async optimizePrompt(ideaText, options = {}) {
    const { temperature = 0.3, maxTokens = 128 } = options;
    const optimizationPrompt = `Transform this idea into a detailed, professional prompt for AI image generation:

Idea: "${ideaText}"

Optimized prompt:`;
    const request = {
      inputs: optimizationPrompt,
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    };
    try {
      const response = await this.makeRequest(
        config.HF_PROMPT_MODEL,
        request
      );
      let optimizedText = response.generated_text.replace(optimizationPrompt, "").trim();
      optimizedText = optimizedText.replace(/^(optimized prompt:|prompt:)/i, "").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
      if (optimizedText.length < 10) {
        throw new Error("Generated prompt too short");
      }
      return optimizedText;
    } catch (error) {
      console.error("[HF API] Error optimizing prompt:", error);
      throw new Error(`Failed to optimize prompt: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Generate image comment/description
   */
  async generateComment(prompt, context = {}) {
    const { imageTags = [], style } = context;
    let contextPrompt = `Generate a detailed description or comment about this image request: "${prompt}"`;
    if (imageTags.length > 0) {
      contextPrompt += `
Image tags: ${imageTags.join(", ")}`;
    }
    if (style) {
      contextPrompt += `
Style context: ${style}`;
    }
    contextPrompt += "\n\nComment:";
    const request = {
      inputs: contextPrompt,
      parameters: {
        temperature: 0.4,
        max_new_tokens: 128,
        top_p: 0.9
      }
    };
    try {
      const response = await this.makeRequest(
        config.HF_COMMENT_MODEL,
        request
      );
      let comment = response.generated_text.replace(contextPrompt, "").trim();
      comment = comment.replace(/^(comment:|description:)/i, "").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
      if (comment.length < 5) {
        throw new Error("Generated comment too short");
      }
      return comment;
    } catch (error) {
      console.error("[HF API] Error generating comment:", error);
      throw new Error(`Failed to generate comment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Check if API key is configured
   */
  isConfigured() {
    return this.apiKey !== "your_huggingface_api_key_here" && this.apiKey.length > 0;
  }
};
var huggingFaceService = new HuggingFaceService();

// src/main.ts
var mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js")
    },
    titleBarStyle: "default",
    show: false,
    icon: join(__dirname, "assets/icon.png")
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5174");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("prompt/optimize", async (_, data) => {
  try {
    console.log("[IPC] Prompt optimize request:", data);
    if (!huggingFaceService.isConfigured()) {
      throw new Error("Hugging Face API key not configured. Please set HF_API_KEY environment variable.");
    }
    if (!data.ideaText || data.ideaText.trim().length === 0) {
      throw new Error("Idea text is required");
    }
    if (data.ideaText.trim().length < 3) {
      throw new Error("Idea text too short (minimum 3 characters)");
    }
    if (data.ideaText.trim().length > 500) {
      throw new Error("Idea text too long (maximum 500 characters)");
    }
    const optimizedPrompt = await huggingFaceService.optimizePrompt(
      data.ideaText.trim(),
      {
        temperature: data.temperature || 0.3,
        maxTokens: 128
      }
    );
    console.log("[IPC] Prompt optimization successful");
    return { optimizedPrompt };
  } catch (error) {
    console.error("[IPC] Prompt optimization error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Prompt optimization failed: ${errorMessage}`);
  }
});
ipcMain.handle("image/inpaint", async (_, data) => {
  console.log("Image inpaint request:", data);
  return { imageBufferBase64: "placeholder", meta: { model: "placeholder", duration_ms: 0 } };
});
ipcMain.handle("comment/generate", async (_, data) => {
  try {
    console.log("[IPC] Comment generate request:", data);
    if (!huggingFaceService.isConfigured()) {
      throw new Error("Hugging Face API key not configured");
    }
    if (!data.prompt || data.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (data.prompt.trim().length > 500) {
      throw new Error("Prompt too long (maximum 500 characters)");
    }
    const text = await huggingFaceService.generateComment(
      data.prompt.trim(),
      data.context || {}
    );
    console.log("[IPC] Comment generation successful");
    return { text };
  } catch (error) {
    console.error("[IPC] Comment generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Comment generation failed: ${errorMessage}`);
  }
});
ipcMain.handle("image/download", async (_, data) => {
  console.log("Image download request:", data);
  return { savedPath: "/placeholder/path" };
});
ipcMain.handle("storage/uploadImage", async (_, data) => {
  console.log("Storage upload request:", data);
  return { file_path: "/placeholder/path", public_url: null };
});
ipcMain.handle("db/insertRecords", async (_, data) => {
  console.log("DB insert request:", data);
  return { image_id: "placeholder-uuid", prompt_id: "placeholder-uuid", comment_id: null };
});
ipcMain.handle("db/listGallery", async (_, data) => {
  console.log("DB list gallery request:", data);
  return { items: [] };
});
//# sourceMappingURL=main.js.map
