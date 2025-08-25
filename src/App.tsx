import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import PromptGenerator from './components/PromptGenerator.tsx'
import ImageEditor from './components/ImageEditor.tsx'
import AICommentator from './components/AICommentator.tsx'
import { appInfo } from './config/app.ts'

function App() {
  return (
    <div className="h-screen bg-secondary-900 text-secondary-100 flex flex-col">
      {/* Header */}
      <header className="bg-secondary-800/90 border-b border-secondary-700/50 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
              {appInfo.name}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-secondary-400">v{appInfo.version}</span>
            <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-secondary-800 hover:bg-secondary-700 border border-secondary-600 transition-colors duration-200">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 overflow-hidden bg-secondary-900/50">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Column 1: Prompt Generator */}
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full panel bg-secondary-800/30 backdrop-blur-sm border-r border-secondary-700/30">
              <PromptGenerator />
            </div>
          </Panel>

          {/* Resizable Handle */}
          <PanelResizeHandle className="w-1 bg-secondary-700/50 hover:bg-primary-500 transition-colors duration-200" />

          {/* Column 2: Image Editor */}
          <Panel defaultSize={50} minSize={30} maxSize={60}>
            <div className="h-full panel bg-secondary-800/20 backdrop-blur-sm">
              <ImageEditor />
            </div>
          </Panel>

          {/* Resizable Handle */}
          <PanelResizeHandle className="w-1 bg-secondary-700/50 hover:bg-primary-500 transition-colors duration-200" />

          {/* Column 3: AI Commentator */}
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full panel bg-secondary-800/30 backdrop-blur-sm border-l border-secondary-700/30">
              <AICommentator />
            </div>
          </Panel>
        </PanelGroup>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-800/90 border-t border-secondary-700/50 backdrop-blur-sm px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">Ready for AI-powered image editing</span>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-secondary-300">HF API Connected</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-secondary-400">Configure Supabase</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
