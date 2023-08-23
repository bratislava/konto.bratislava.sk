import { CheckInCircleIcon, ChevronRightIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'
import CheckboxIcon from '../../icon-components/CheckboxIcon'
import RadioButtonIcon from '../../icon-components/RadioButtonIcon'
import { SelectOption } from './SelectOption.interface'

interface DropdownRowProps {
  option: SelectOption
  isBold?: boolean
  selected?: boolean
  type: 'one' | 'multiple' | 'arrow' | 'radio'
  divider?: boolean
  maxWordSize?: number
  onChooseOne: (option: SelectOption, close?: boolean) => void
  onUnChooseOne: (option: SelectOption, close?: boolean) => void
  onChooseMulti: (option: SelectOption) => void
  onUnChooseMulti: (option: SelectOption) => void
}

const DropdownRow = ({
  option,
  isBold,
  selected,
  type,
  divider,
  maxWordSize,
  onChooseOne,
  onUnChooseOne,
  onChooseMulti,
  onUnChooseMulti,
}: DropdownRowProps) => {
  // STYLES
  const rowClassName = cx(
    'dropdown hover:bg-form-plain-black-hover flex w-full cursor-pointer flex-col bg-white px-5 [&>div]:last:border-0',
    {
      'h-14': !isBold,
      'h-full xs:h-[84px]': isBold,
    },
  )

  const optionClassName = cx('dropdown text-16 w-full', {
    'text-16-semibold': isBold,
  })

  // EVENT HANDLERS
  const handleOnClick = () => {
    if (selected && type === 'multiple') onUnChooseMulti(option)
    else if (!selected && type === 'multiple') onChooseMulti(option)
    else if (selected && ['one', 'arrow', 'radio'].includes(type)) onUnChooseOne(option, true)
    else if (!selected && ['one', 'arrow'].includes(type)) onChooseOne(option, true)
    else if (!selected && type === 'radio') onChooseOne(option, false)
  }

  const rowIcon =
    type === 'multiple' ? (
      <CheckboxIcon checked={selected} />
    ) : type === 'one' && selected ? (
      <CheckInCircleIcon className="h-6 w-6" />
    ) : type === 'arrow' ? (
      <ChevronRightIcon className="h-6 w-6" />
    ) : type === 'radio' ? (
      <RadioButtonIcon selected={selected} />
    ) : null

  const optionText = option.title ?? String(option.const)
  const transformedOptionText = `${optionText.slice(0, maxWordSize)}${
    maxWordSize && optionText.length > maxWordSize ? '...' : ''
  }`

  // RENDER
  return (
    <div
      role="button"
      tabIndex={0}
      className={rowClassName}
      onClick={handleOnClick}
      onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, handleOnClick)}
    >
      <div className="dropdown flex h-full flex-col justify-center">
        <div className="dropdown flex flex-row justify-center">
          <p className={optionClassName}>{transformedOptionText}</p>
          <div className="dropdown relative flex flex-col justify-center">
            {rowIcon}
            <div className="dropdown absolute inset-0 z-10" />
          </div>
        </div>
        {option.description && <p className="dropdown text-p3">{option.description}</p>}
      </div>
      {divider && <div className="dropdown border-form-input-default border-b-2" />}
    </div>
  )
}

export default DropdownRow
