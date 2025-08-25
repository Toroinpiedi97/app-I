import React, { useState, useRef, useContext, useEffect } from 'react'
import { PromptContext } from '../context/PromptContext.tsx'

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<{ src: string | null; width: number; height: number }>({
    src: null,
    width: 0,
    height: 0
  })
  const [mask, setMask] = useState<{ src: string | null; width: number; height: number; mode: string; brushSize: number; opacity: number }>({
    src: null,
    width: 0,
    height: 0,
    mode: 'paint-white-to-edit',
    brushSize: 32,
    opacity: 0.6
  })
  const [promptInUse, setPromptInUse] = useState('')
  const { currentPrompt, clearPrompt } = useContext(PromptContext)

  useEffect(() => {
    if (currentPrompt && !promptInUse) {
      setPromptInUse(currentPrompt)
      // Do not clear immediately to allow history/other components to reference it if needed
    }
  }, [currentPrompt])

  const [loading, setLoading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage({
          src: e.target?.result as string,
          width: img.width,
          height: img.height
        })
        // Reset mask when new image is loaded
        setMask(prev => ({
          ...prev,
          src: null,
          width: img.width,
          height: img.height
        }))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleApplyInpaint = async () => {
    if (!image.src || !mask.src || !promptInUse.trim()) return
    
    setLoading(true)
    try {
      const result = await window.electronAPI.imageInpaint({
        imageBase64: image.src,
        maskBase64: mask.src,
        prompt: promptInUse,
        strength: 0.75,
        guidance_scale: 7.5,
        num_inference_steps: 30
      })
      
      // Update image with result
      setImage(prev => ({
        ...prev,
        src: result.imageBufferBase64
      }))
      
      console.log('Inpainting completed:', result.meta)
    } catch (error) {
      console.error('Error applying inpainting:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'png' | 'jpeg' | 'webp') => {
    if (!image.src) return
    
    try {
      const result = await window.electronAPI.imageDownload({
        imageBase64: image.src,
        format
      })
      console.log('Image saved to:', result.savedPath)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const handleReset = () => {
    setImage({ src: null, width: 0, height: 0 })
    setMask({ src: null, width: 0, height: 0, mode: 'paint-white-to-edit', brushSize: 32, opacity: 0.6 })
    setPromptInUse('')
    clearPrompt()
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary-400 mb-2">
          Image Editor
        </h2>
        <p className="text-sm text-slate-400">
          Upload, edit, and apply AI inpainting to your images
        </p>
      </div>

      {/* Upload Area */}
      {!image.src && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-sm">Drop image here</div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Choose Image
            </button>
          </div>
        </div>
      )}

      {/* Image Display and Editing */}
      {image.src && (
        <div className="flex-1 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prompt for Inpainting
            </label>
            <textarea
              value={promptInUse}
              onChange={(e) => setPromptInUse(e.target.value)}
              placeholder="Enter prompt for AI editing..."
              className="input-field w-full h-20 resize-none"
            />
          </div>

          {/* Canvas Placeholder */}
          <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm">Canvas with Konva integration</div>
              <div className="text-xs mt-1">Image: {image.width} x {image.height}</div>
            </div>
          </div>

          {/* Toolbox */}
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-3">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Tools</h3>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary text-xs">Select</button>
              <button className="btn-secondary text-xs">Brush</button>
              <button className="btn-secondary text-xs">Erase</button>
              <button className="btn-secondary text-xs">Rectangle</button>
              <button className="btn-secondary text-xs">Lasso</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApplyInpaint}
              disabled={!mask.src || !promptInUse.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Apply Inpainting'}
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Reset
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => handleDownload('png')}
                className="btn-secondary text-xs"
              >
                PNG
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="btn-secondary text-xs"
              >
                JPG
              </button>
              <button
                onClick={() => handleDownload('webp')}
                className="btn-secondary text-xs"
              >
                WebP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageEditor
