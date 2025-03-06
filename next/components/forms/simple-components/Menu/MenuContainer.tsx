import type { AriaMenuProps } from '@react-types/menu'
import MenuItem from 'components/forms/simple-components/Menu/MenuItem'
import React, { useRef } from 'react'
import { useMenu } from 'react-aria'
import { useTreeState } from 'react-stately'
import cn from '../../../../frontend/cn'

interface MenuContainerProps<T extends object> extends AriaMenuProps<T> {
  onClose: () => void
  className?: string
  containerHeaderEl?: React.ReactNode
}

const MenuContainer = <T extends object>(props: MenuContainerProps<T>) => {
  const state = useTreeState(props)
  const { containerHeaderEl, onAction, onClose, className } = props

  // Get props for the menu element
  const ref = useRef<HTMLUListElement>(null)
  const { menuProps } = useMenu(props, state, ref)

  return (
    <ul {...menuProps} ref={ref} className="focus:outline-hidden">
      {containerHeaderEl}
      <div className={cn('py-2', className)}>
        {Array.from(state.collection).map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            state={state}
            onAction={onAction}
            onClose={onClose}
          />
        ))}
      </div>
    </ul>
  )
}

export default MenuContainer
