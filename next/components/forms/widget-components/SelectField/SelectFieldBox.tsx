import { useTranslation } from 'next-i18next'
import React, { ForwardedRef, forwardRef, ForwardRefRenderFunction } from 'react'

import Tag from '../../simple-components/Tag'
import { SelectOption } from './SelectField'

interface SelectFieldBoxProps {
  value?: SelectOption[]
  multiple?: boolean
  placeholder?: string
  filter: string
  filterRef?: React.RefObject<HTMLInputElement>
  maxWordSize?: number
  onRemove: (optionId: number) => void
  onRemoveAll: () => void
  onFilterChange: (value: string) => void
  onDeleteLastValue: () => void
  onClick?: (event: React.MouseEvent) => void
}

const SelectFieldBoxComponent: ForwardRefRenderFunction<HTMLDivElement, SelectFieldBoxProps> = (
  props: SelectFieldBoxProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  // PROPS
  const {
    value,
    multiple,
    placeholder,
    filter,
    filterRef,
    maxWordSize = 17,
    onRemove,
    onRemoveAll,
    onFilterChange,
    onDeleteLastValue,
    onClick,
  } = props

  const { t } = useTranslation('forms')
  const multipleOptionsTagText = value
    ? `${value.length} ${t(value.length < 5 ? 'options_few' : 'options_many').toLowerCase()}`
    : t('options_zero')
  // HELPER FUNCTIONS
  const getInputSize = () => {
    return !value || value.length === 0
      ? 13
      : filter.length <= 1
      ? 1
      : filter.length >= 9
      ? 13
      : filter.length
  }

  const getPlaceholder = () => {
    return value && value.length > 0 ? '' : placeholder
  }

  // EVENT HANDLERS
  const handleOnKeyDown = ({ key }: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(key) && !filter) {
      onDeleteLastValue()
    }
  }

  const getOptionTitle = (selectOption: SelectOption) => {
    return selectOption.title ?? String(selectOption.const)
  }

  // RENDER
  return (
    <section
      ref={ref}
      className="flex items-center w-full flex-row flex-wrap gap-2 py-2 sm:py-2.5 sm:pl-4 pl-3"
      data-value={value}
      onClick={(event: React.MouseEvent) => {
        if (onClick) onClick(event)
      }}
    >
      {
        /* TAGS */
        value && value.length > 0 ? (
          value.length < 3 ? (
            multiple ? (
              value.map((option: SelectOption, key: number) => (
                <Tag
                  key={key}
                  text={getOptionTitle(option)}
                  size="small"
                  onRemove={() => onRemove(key)}
                  removable
                  shorthand
                />
              ))
            ) : (
              <p>
                {`${getOptionTitle(value[0]).slice(0, maxWordSize)}${
                  getOptionTitle(value[0]).length > maxWordSize ? '...' : ''
                }`}
              </p>
            )
          ) : (
            <Tag text={multipleOptionsTagText} size="small" onRemove={onRemoveAll} removable />
          )
        ) : null
      }
      <input
        ref={filterRef}
        className="text-16 max-w-[80px] xs:max-w-none border-0 outline-none"
        type="text"
        size={getInputSize()}
        value={filter}
        placeholder={getPlaceholder()}
        onKeyDown={handleOnKeyDown}
        onChange={(event) => onFilterChange(event.target.value)}
      />
    </section>
  )
}

const SelectFieldBox = forwardRef<HTMLDivElement, SelectFieldBoxProps>(SelectFieldBoxComponent)
export default SelectFieldBox
