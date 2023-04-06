import type { AriaMenuProps, MenuTriggerProps } from '@react-types/menu'
import Button from 'components/forms/simple-components/Button'
import MenuButton from 'components/forms/simple-components/Menu/MenuButton'
import MenuContainer from 'components/forms/simple-components/Menu/MenuContainer'
import MenuPopover from 'components/forms/simple-components/Menu/MenuPopover'
import React from 'react'
import { OverlayProvider, useMenuTrigger } from 'react-aria'
import { useMenuTriggerState } from 'react-stately'

interface MenuProps<T extends object> extends AriaMenuProps<T>, MenuTriggerProps {
  label: string
  buttonIcon?: React.ReactNode
  containerHeaderEl?: React.ReactNode
  className?: string
}
const FormMenu = <T extends object>(props: MenuProps<T>) => {
  const state = useMenuTriggerState(props)
  const { buttonIcon } = props

  const ref = React.useRef(null)
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref)

  console.log(state)
  return (
    <div className="focus:outline-none relative inline-block">
      {/* <div {...menuTriggerProps} ref={ref}>
        {buttonLeftEl}
      </div> */}
      <Button
        size="sm"
        variant="category-outline"
        className="text-gray-700"
        icon={buttonIcon}
        {...menuTriggerProps}
      />
      {/* <MenuButton {...menuTriggerProps} isPressed={state.isOpen} ref={ref}> */}
      {/* </MenuButton> */}
      {state.isOpen && (
        <OverlayProvider>
          <MenuPopover state={state} triggerRef={ref} placement="bottom start">
            <MenuContainer
              {...menuProps}
              {...props}
              autoFocus={state.focusStrategy || true}
              onClose={() => state.close()}
            />
          </MenuPopover>
        </OverlayProvider>
      )}
    </div>
  )
}

export default FormMenu
