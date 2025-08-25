export {}

declare global {
  interface Window {
    electronAPI: {
      promptOptimize: (data: { ideaText: string; temperature?: number }) => Promise<{ optimizedPrompt: string }>
      imageInpaint: (data: {
        imageBase64: string
        maskBase64: string
        prompt: string
        strength?: number
        guidance_scale?: number
        num_inference_steps?: number
      }) => Promise<{ imageBufferBase64: string; meta: { model: string; duration_ms: number } }>
      commentGenerate: (data: { prompt: string; context?: { imageTags?: string[]; style?: string } }) => Promise<{ text: string }>
      imageDownload: (data: { imageBase64: string; format: 'png' | 'jpeg' | 'webp'; targetPath?: string }) => Promise<{ savedPath: string }>
      storageUploadImage: (data: { imageBufferBase64: string; ext: 'png' | 'jpg' | 'webp' }) => Promise<{ file_path: string; public_url: string | null }>
      dbInsertRecords: (data: {
        image: { format: string; file_path: string }
        prompt: { raw: string; optimized: string }
        comment?: { text: string }
      }) => Promise<{ image_id: string; prompt_id: string; comment_id: string | null }>
      dbListGallery: (data: { limit?: number; offset?: number }) => Promise<{
        items: Array<{
          image_id: string
          file_path: string
          format: string
          created_at: string
          last_prompt: string | null
          last_comment: string | null
        }>
      }>
    }
  }
}

