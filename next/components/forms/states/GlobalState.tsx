import React, { createContext, useContext, useState } from 'react'

type GlobalStateBase = {
  // TODO will move this out of state into route hash - the type will move into one place together with it
  applicationsActiveMenuItem?: 'SENT' | 'SENDING' | 'DRAFT'
}

const GlobalStateContext = createContext<{
  globalState: GlobalStateBase
  setGlobalState: React.Dispatch<React.SetStateAction<GlobalStateBase>>
}>({
  globalState: {},
  setGlobalState: () => {},
})

interface GlobalStateProviderProps {
  children?: React.ReactNode
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [globalState, setGlobalState] = useState<GlobalStateBase>({
    applicationsActiveMenuItem: 'SENT',
  })
  return (
    <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalStateContext = () => useContext(GlobalStateContext)
