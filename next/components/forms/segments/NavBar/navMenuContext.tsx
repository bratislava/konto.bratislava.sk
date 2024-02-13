import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

type NavMenuContextType = {
  menuValue: string
  setMenuValue: (value: string) => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
}

const NavMenuContext = createContext<NavMenuContextType>({
  menuValue: '',
  setMenuValue: () => {},
  isMobileMenuOpen: false,
  setMobileMenuOpen: () => {},
})

export const NavMenuContextProvider = ({ children }: PropsWithChildren<object>) => {
  const [menuValue, setMenuValue] = useState<string>('')
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <NavMenuContext.Provider
      value={{ menuValue, setMenuValue, isMobileMenuOpen, setMobileMenuOpen }}
    >
      {children}
    </NavMenuContext.Provider>
  )
}

export const useNavMenuContext = () => {
  return useContext(NavMenuContext)
}
