// TODO
import React, { createContext, useContext, useState } from 'react'

type DropdownMenuStateBase = {
  applicationsActiveMenuItem?: 'sent' | 'concept'
}

const DropdownMenuStateStateContext = createContext<{
  globalState: DropdownMenuStateBase
  setGlobalState: React.Dispatch<React.SetStateAction<DropdownMenuStateBase>>
}>({
  globalState: {},
  setGlobalState: () => {},
})

interface GlobalStateProviderProps {
  children?: React.ReactNode
}

export const DropdownMenuStateStateProvider: React.FC<GlobalStateProviderProps> = ({
  children,
}) => {
  const [globalState, setGlobalState] = useState<DropdownMenuStateBase>({
    applicationsActiveMenuItem: 'sent',
  })
  return (
    <DropdownMenuStateStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </DropdownMenuStateStateContext.Provider>
  )
}

export const useDropdownMenuContext = () => useContext(DropdownMenuStateStateContext)
