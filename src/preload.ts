import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Prompt optimization
  promptOptimize: (data: { ideaText: string; temperature?: number }) =>
    ipcRenderer.invoke('prompt/optimize', data),
  
  // Image inpainting
  imageInpaint: (data: {
    imageBase64: string;
    maskBase64: string;
    prompt: string;
    strength?: number;
    guidance_scale?: number;
    num_inference_steps?: number;
  }) => ipcRenderer.invoke('image/inpaint', data),
  
  // Comment generation
  commentGenerate: (data: { prompt: string; context?: { imageTags?: string[]; style?: string } }) =>
    ipcRenderer.invoke('comment/generate', data),
  
  // Image download
  imageDownload: (data: { imageBase64: string; format: 'png' | 'jpeg' | 'webp'; targetPath?: string }) =>
    ipcRenderer.invoke('image/download', data),
  
  // Storage upload
  storageUploadImage: (data: { imageBufferBase64: string; ext: 'png' | 'jpg' | 'webp' }) =>
    ipcRenderer.invoke('storage/uploadImage', data),
  
  // Database operations
  dbInsertRecords: (data: {
    image: { format: string; file_path: string };
    prompt: { raw: string; optimized: string };
    comment?: { text: string };
  }) => ipcRenderer.invoke('db/insertRecords', data),
  
  dbListGallery: (data: { limit?: number; offset?: number }) =>
    ipcRenderer.invoke('db/listGallery', data),
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      promptOptimize: (data: { ideaText: string; temperature?: number }) => Promise<{ optimizedPrompt: string }>;
      imageInpaint: (data: {
        imageBase64: string;
        maskBase64: string;
        prompt: string;
        strength?: number;
        guidance_scale?: number;
        num_inference_steps?: number;
      }) => Promise<{ imageBufferBase64: string; meta: { model: string; duration_ms: number } }>;
      commentGenerate: (data: { prompt: string; context?: { imageTags?: string[]; style?: string } }) => Promise<{ text: string }>;
      imageDownload: (data: { imageBase64: string; format: 'png' | 'jpeg' | 'webp'; targetPath?: string }) => Promise<{ savedPath: string }>;
      storageUploadImage: (data: { imageBufferBase64: string; ext: 'png' | 'jpg' | 'webp' }) => Promise<{ file_path: string; public_url: string | null }>;
      dbInsertRecords: (data: {
        image: { format: string; file_path: string };
        prompt: { raw: string; optimized: string };
        comment?: { text: string };
      }) => Promise<{ image_id: string; prompt_id: string; comment_id: string | null }>;
      dbListGallery: (data: { limit?: number; offset?: number }) => Promise<{ items: Array<{
        image_id: string;
        file_path: string;
        format: string;
        created_at: string;
        last_prompt: string | null;
        last_comment: string | null;
      }> }>;
    };
  }
}
