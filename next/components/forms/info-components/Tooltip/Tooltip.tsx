import HelpIcon from '@assets/images/new-icons/ui/help.svg'
import TooltipPopup from 'components/forms/info-components/Tooltip/TooltipPopup'
import { useRef, useState } from 'react'
import { TooltipTriggerProps, useHover } from 'react-aria'
import { useTooltipTriggerState } from 'react-stately'
import { useOnClickOutside } from 'usehooks-ts'

export type TooltipPositionType =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'right-top'
  | 'right-bottom'
  | 'left-top'
  | 'left-bottom'

type TooltipPopupBase = {
  text?: string
  arrow?: boolean
  position?: TooltipPositionType
  className?: string
} & TooltipTriggerProps

const Tooltip = (props: TooltipPopupBase) => {
  const { text, arrow, className, position } = props

  const ref = useRef<HTMLButtonElement>(null)
  const state = useTooltipTriggerState(props)

  const [isClicked, setIsClicked] = useState<boolean>(false)

  useOnClickOutside(ref, () => setIsClicked(false))
  const { hoverProps } = useHover({
    onHoverStart() {
      state.open(true)
    },
    onHoverEnd() {
      state.close(true)
    },
  })
  return (
    <span className="relative w-5 h-5 sm:w-6 sm:h-6">
      <button
        type="button"
        ref={ref}
        onClick={() => setIsClicked((prev) => !prev)}
        {...hoverProps}
        className="w-full outline-none cursor-pointer"
      >
        <HelpIcon />
      </button>
      {(state.isOpen || isClicked) && (
        <TooltipPopup text={text} arrow={arrow} className={className} position={position} />
      )}
    </span>
  )
}

export default Tooltip
