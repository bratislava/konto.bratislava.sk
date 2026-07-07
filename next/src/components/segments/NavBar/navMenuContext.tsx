import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

type NavMenuContextType = {
  isMobileMenuOpen: boolean
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
}

const NavMenuContext = createContext<NavMenuContextType>({
  isMobileMenuOpen: false,
  setMobileMenuOpen: () => {},
})

export const NavMenuContextProvider = ({ children }: PropsWithChildren<object>) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <NavMenuContext.Provider value={{ isMobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </NavMenuContext.Provider>
  )
}

export const useNavMenuContext = () => {
  return useContext(NavMenuContext)
}
