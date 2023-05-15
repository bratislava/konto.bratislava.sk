import { useGlobalStateContext } from 'components/forms/states/GlobalState'

const useGlobalState = () => {
  const { globalState } = useGlobalStateContext()

  const menuDropdownIsOpen = (id: string): boolean => {
    if (globalState && globalState.dropdownMenuState)
      return globalState.dropdownMenuState?.isOpen && globalState.dropdownMenuState?.id === id
    return false
  }
  return { menuDropdownIsOpen }
}

export default useGlobalState
