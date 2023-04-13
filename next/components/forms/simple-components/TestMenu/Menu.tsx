/* eslint-disable @typescript-eslint/no-use-before-define */
import ChevronDownIcon from '@assets/images/new-icons/ui/chevron-right.svg'
import type { AriaMenuProps, MenuTriggerProps } from '@react-types/menu'
import type { Node } from '@react-types/shared'
import React, { useRef } from 'react'
import { useMenu, useMenuItem, useMenuSection, useMenuTrigger, useSeparator } from 'react-aria'
import { TreeState, useMenuTriggerState, useTreeState } from 'react-stately'

import { Button } from './Button'
import { Popover } from './Popover'

interface MenuButtonProps<T extends object> extends AriaMenuProps<T>, MenuTriggerProps {
  label: string
}

export const MenuButton = <T extends object>(props: MenuButtonProps<T>) => {
  // Create state based on the incoming props
  const state = useMenuTriggerState(props)

  // Get props for the menu trigger and menu elements
  const ref = React.useRef()
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref)

  return (
    <div className="relative flex">
      <Button {...menuTriggerProps} isPressed={state.isOpen} ref={ref}>
        {props.label}
        <ChevronDownIcon className="inline ml-1 -mr-2 h-5 w-5" />
      </Button>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Menu
            {...menuProps}
            {...props}
            autoFocus={state.focusStrategy || true}
            // onClose={() => state.close()}
          />
        </Popover>
      )}
    </div>
  )
}

interface MenuProps<T extends object> extends AriaMenuProps<T> {
  onClose?: () => void
}

const Menu = <T extends object>(props: MenuProps<T>) => {
  // Create state based on the incoming props
  const state = useTreeState(props)

  // Get props for the menu element
  const ref = useRef()
  const { menuProps } = useMenu(props, state, ref)

  return (
    <ul
      {...menuProps}
      ref={ref}
      className="shadow-xs py-1 rounded-md min-w-[200px] focus:outline-none"
    >
      {[...state.collection].map((item) => (
        <MenuSection
          key={item.key}
          section={item}
          state={state}
          onAction={props.onAction}
          // onClose={props.onClose}
        />
      ))}
    </ul>
  )
}

interface MenuSectionProps<T> {
  section: Node<T>
  state: TreeState<T>
  onAction: (key: React.Key) => void
  onClose?: () => void
}

function MenuSection<T>({ section, state, onAction, onClose }: MenuSectionProps<T>) {
  const { itemProps, groupProps } = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  })

  const { separatorProps } = useSeparator({
    elementType: 'li',
  })

  return (
    <>
      {section.key !== state.collection.getFirstKey() && (
        <li {...separatorProps} className="border-t border-gray-300 mx-2 my-1" />
      )}
      <li {...itemProps}>
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state}
              onAction={onAction}
              // onClose={onClose}
            />
          ))}
        </ul>
      </li>
    </>
  )
}

interface MenuItemProps<T> {
  item: Node<T>
  state: TreeState<T>
  onAction: (key: React.Key) => void
  onClose?: () => void
}

function MenuItem<T>({ item, state, onAction, onClose }: MenuItemProps<T>) {
  // Get props for the menu item element
  const ref = React.useRef()
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      onAction,
      onClose,
    },
    state,
    ref,
  )

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  const isFocused = state.selectionManager.focusedKey === item.key
  const focusBg = item.key === 'delete' ? 'bg-red-500' : 'bg-blue-500'
  const focus = isFocused ? `${focusBg} text-white` : 'text-gray-900'

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={`${focus} text-sm font-sans cursor-default select-none relative mx-1 rounded py-2 pl-3 pr-9 focus:outline-none`}
    >
      {item.rendered}
    </li>
  )
}
