import { MenuDropdownStateBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import React, { createContext, useContext, useState } from 'react'

type GlobalStateBase = {
  applicationsActiveMenuItem?: 'sent' | 'concept'
  dropdownMenuState?: MenuDropdownStateBase
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
    applicationsActiveMenuItem: 'sent',
    dropdownMenuState: { id: '', isOpen: false },
  })
  return (
    <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalStateContext = () => useContext(GlobalStateContext)
