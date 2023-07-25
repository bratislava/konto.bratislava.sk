import { ChevronDownSmallIcon } from '@assets/ui-icons'
import type { AriaMenuProps, MenuTriggerProps } from '@react-types/menu'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import MenuButton from 'components/forms/simple-components/Menu/MenuButton'
import MenuContainer from 'components/forms/simple-components/Menu/MenuContainer'
import MenuPopover from 'components/forms/simple-components/Menu/MenuPopover'
import React from 'react'
import { OverlayProvider, useMenuTrigger } from 'react-aria'
import { useMenuTriggerState } from 'react-stately'

interface MenuProps<T extends object> extends AriaMenuProps<T>, MenuTriggerProps {
  label: string
  buttonLeftEl?: React.ReactNode
  containerHeaderEl?: React.ReactNode
  buttonIcon?: React.ReactNode
}

const Menu = <T extends object>(props: MenuProps<T>) => {
  const state = useMenuTriggerState(props)
  const { buttonLeftEl, label, buttonIcon } = props

  const ref = React.useRef(null)
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref)

  return (
    <div className="relative inline-block">
      {buttonIcon ? (
        <Button
          className={cx('text-gray-700 hover:text-gray-600 focus:text-gray-800', {
            'border-category-800 hover:border-category-800': state.isOpen,
          })}
          size="sm"
          variant="category-outline"
          icon={buttonIcon}
          onPress={() => state.toggle()}
        />
      ) : (
        <MenuButton {...menuTriggerProps} isPressed={state.isOpen} ref={ref}>
          {buttonLeftEl}
          <div className="ml-3 font-light lg:font-semibold">{label}</div>
          <ChevronDownSmallIcon
            className={`ml-1 hidden h-5 w-5 mix-blend-normal lg:flex ${
              state.isOpen ? '-rotate-180' : ''
            }`}
          />
        </MenuButton>
      )}
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

export default Menu
