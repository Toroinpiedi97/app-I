import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import PromptGenerator from './components/PromptGenerator.tsx'
import ImageEditor from './components/ImageEditor.tsx'
import AICommentator from './components/AICommentator.tsx'

function App() {
  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-400">
            AIDesktop Image Suite
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">v0.1.0</span>
            <button className="btn-secondary text-sm">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Column 1: Prompt Generator */}
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full panel">
              <PromptGenerator />
            </div>
          </Panel>

          {/* Resizable Handle */}
          <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-primary-500 transition-colors" />

          {/* Column 2: Image Editor */}
          <Panel defaultSize={50} minSize={30} maxSize={60}>
            <div className="h-full panel">
              <ImageEditor />
            </div>
          </Panel>

          {/* Resizable Handle */}
          <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-primary-500 transition-colors" />

          {/* Column 3: AI Commentator */}
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full panel">
              <AICommentator />
            </div>
          </Panel>
        </PanelGroup>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/80 border-t border-slate-700 backdrop-blur px-6 py-2">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Ready for AI-powered image editing</span>
          <div className="flex items-center space-x-4">
            <span>HF API: <span className="text-green-400">✓ Configured</span></span>
            <span>Supabase: <span className="text-yellow-400">Configure .env</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
