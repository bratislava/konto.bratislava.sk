import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import cx from 'classnames'
import FormMenu from 'components/forms/simple-components/FormMenu/FormMenu'
import FormMenuPopover from 'components/forms/simple-components/FormMenu/FormMenuPopover'
import { forwardRef, ReactNode, RefObject, useRef } from 'react'
import { AriaMenuProps, OverlayProvider, useButton, useMenuTrigger } from 'react-aria'
import type { MenuTriggerProps } from 'react-stately'
import { useMenuTriggerState } from 'react-stately'

type ButtonBase = {
  children: ReactNode
  className?: string
}

const Button = forwardRef((props: ButtonBase, ref: RefObject<HTMLButtonElement>) => {
  const { children, className } = props
  const { buttonProps } = useButton(props, ref)
  return (
    <button className={className} type="button" {...buttonProps} ref={ref}>
      {children}
    </button>
  )
})

interface MenuButtonProps<T> extends AriaMenuProps<T>, MenuTriggerProps {
  //   label?: string
}

const FormMenuButton = <T extends object>(props: MenuButtonProps<T>) => {
  const state = useMenuTriggerState(props)

  const ref = useRef<HTMLButtonElement>(null)
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref)

  return (
    <>
      <Button
        className={cx(
          'w-10 h-10 border-2 border-main-700 hover:border-main-600 focus:border-main-800 text-gray-700 hover:text-gray-600 focus:text-gray-800 rounded-lg flex justify-center items-center focus:outline-none',
          {
            'border-main-800 text-gray-800 hover:text-gray-800 hover:border-main-800': state.isOpen,
          },
        )}
        ref={ref}
        {...menuTriggerProps}
      >
        <span className="w-6 h-6 flex justify-center items-center">
          <ThreePointsIcon />
        </span>
      </Button>
      {state.isOpen && (
        <OverlayProvider>
          <FormMenuPopover state={state} triggerRef={ref} placement="bottom end" offset={20}>
            <FormMenu
              {...menuProps}
              {...props}
              autoFocus={state.focusStrategy || true}
              onClose={() => state.close()}
            />
          </FormMenuPopover>
        </OverlayProvider>
      )}
    </>
  )
}

export default FormMenuButton
