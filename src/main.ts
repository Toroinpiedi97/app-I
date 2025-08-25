import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import isDev from 'electron-is-dev'
import { huggingFaceService } from './services/huggingface'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
          webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      },
    titleBarStyle: 'default',
    show: false,
    icon: join(__dirname, 'assets/icon.png')
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, 'index.html'))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers - Hugging Face Integration
ipcMain.handle('prompt/optimize', async (_, data: { ideaText: string; temperature?: number }) => {
  try {
    console.log('[IPC] Prompt optimize request:', data)
    
    // Check if HF service is configured
    if (!huggingFaceService.isConfigured()) {
      throw new Error('Hugging Face API key not configured. Please set HF_API_KEY environment variable.')
    }

    // Validate input
    if (!data.ideaText || data.ideaText.trim().length === 0) {
      throw new Error('Idea text is required')
    }

    if (data.ideaText.trim().length < 3) {
      throw new Error('Idea text too short (minimum 3 characters)')
    }

    if (data.ideaText.trim().length > 500) {
      throw new Error('Idea text too long (maximum 500 characters)')
    }

    // Call Hugging Face service
    const optimizedPrompt = await huggingFaceService.optimizePrompt(
      data.ideaText.trim(),
      {
        temperature: data.temperature || 0.3,
        maxTokens: 128
      }
    )

    console.log('[IPC] Prompt optimization successful')
    return { optimizedPrompt }
  } catch (error) {
    console.error('[IPC] Prompt optimization error:', error)
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Prompt optimization failed: ${errorMessage}`)
  }
})

ipcMain.handle('image/inpaint', async (_, data) => {
  // TODO: Implement HF inpainting API call
  console.log('Image inpaint request:', data)
  return { imageBufferBase64: 'placeholder', meta: { model: 'placeholder', duration_ms: 0 } }
})

ipcMain.handle('comment/generate', async (_, data: { prompt: string; context?: { imageTags?: string[]; style?: string } }) => {
  try {
    console.log('[IPC] Comment generate request:', data)
    
    // Check if HF service is configured
    if (!huggingFaceService.isConfigured()) {
      throw new Error('Hugging Face API key not configured')
    }

    // Validate input
    if (!data.prompt || data.prompt.trim().length === 0) {
      throw new Error('Prompt is required')
    }

    if (data.prompt.trim().length > 500) {
      throw new Error('Prompt too long (maximum 500 characters)')
    }

    // Call Hugging Face service
    const text = await huggingFaceService.generateComment(
      data.prompt.trim(),
      data.context || {}
    )

    console.log('[IPC] Comment generation successful')
    return { text }
  } catch (error) {
    console.error('[IPC] Comment generation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Comment generation failed: ${errorMessage}`)
  }
})

ipcMain.handle('image/download', async (_, data) => {
  // TODO: Implement image download/export
  console.log('Image download request:', data)
  return { savedPath: '/placeholder/path' }
})

ipcMain.handle('storage/uploadImage', async (_, data) => {
  // TODO: Implement Supabase storage upload
  console.log('Storage upload request:', data)
  return { file_path: '/placeholder/path', public_url: null }
})

ipcMain.handle('db/insertRecords', async (_, data) => {
  // TODO: Implement Supabase DB operations
  console.log('DB insert request:', data)
  return { image_id: 'placeholder-uuid', prompt_id: 'placeholder-uuid', comment_id: null }
})

ipcMain.handle('db/listGallery', async (_, data) => {
  // TODO: Implement Supabase DB query
  console.log('DB list gallery request:', data)
  return { items: [] }
})
