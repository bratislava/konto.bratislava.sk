import React, { createContext, useContext, useState } from 'react'

const MyApplicationPageStateContext = createContext<{
  applicationsState: 'sent' | 'concept'
  setApplicationsState: React.Dispatch<React.SetStateAction<React.ReactNode>>
}>({
  applicationsState: 'sent',
  setApplicationsState: () => {},
})

interface StatusBarProviderProps {
  children?: React.ReactNode
}

export const MyApplicationPageStateProvider: React.FC<StatusBarProviderProps> = ({ children }) => {
  const [applicationsState, setApplicationsState] = useState<'sent' | 'concept'>('sent')
  return (
    <MyApplicationPageStateContext.Provider value={{ applicationsState, setApplicationsState }}>
      {children}
    </MyApplicationPageStateContext.Provider>
  )
}

export const useMyApplicationPageStateContext = () => useContext(MyApplicationPageStateContext)
