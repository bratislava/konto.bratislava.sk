import FormMenuItem from 'components/forms/simple-components/FormMenu/FormMenuItem'
import { useRef } from 'react'
import type { AriaMenuProps } from 'react-aria'
import { useMenu } from 'react-aria'
import { useTreeState } from 'react-stately'

const FormMenu = <T extends object>(props: AriaMenuProps<T>) => {
  // Create menu state based on the incoming props
  const state = useTreeState(props)

  // Get props for the menu element
  const ref = useRef(null)
  const { menuProps } = useMenu(props, state, ref)

  return (
    <ul {...menuProps} ref={ref} className="focus:outline-none flex flex-col py-2">
      {[...state.collection].map((item) => (
        <FormMenuItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}

export default FormMenu
