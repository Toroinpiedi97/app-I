import React, { createContext, useCallback, useMemo, useState } from 'react'

export interface PromptContextValue {
  currentPrompt: string
  setCurrentPrompt: (value: string) => void
  clearPrompt: () => void
}

export const PromptContext = createContext<PromptContextValue>({
  currentPrompt: '',
  setCurrentPrompt: () => undefined,
  clearPrompt: () => undefined,
})

export const PromptProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentPrompt, setCurrentPromptState] = useState<string>('')

  const setCurrentPrompt = useCallback((value: string) => {
    setCurrentPromptState(value)
  }, [])

  const clearPrompt = useCallback(() => {
    setCurrentPromptState('')
  }, [])

  const value = useMemo<PromptContextValue>(() => ({
    currentPrompt,
    setCurrentPrompt,
    clearPrompt,
  }), [currentPrompt, setCurrentPrompt, clearPrompt])

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  )
}

