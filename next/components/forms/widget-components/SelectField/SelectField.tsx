import ArrowDownIcon from '@assets/images/new-icons/ui/expand.svg'
import ArrowUpIcon from '@assets/images/new-icons/ui/expand-less.svg'
import { handleOnKeyPress } from '@utils/utils'
import cx from 'classnames'
import React, {
  ForwardedRef,
  forwardRef,
  ForwardRefRenderFunction,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import FieldErrorMessage from '../../info-components/FieldErrorMessage'
import FieldHeader from '../../info-components/FieldHeader'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import Dropdown from './Dropdown'
import SelectFieldBox from './SelectFieldBox'

export interface SelectOption {
  const: string | number
  title?: string
  description?: string
}

interface SelectFieldProps {
  label: string
  type?: 'one' | 'multiple' | 'arrow' | 'radio'
  value?: SelectOption[]
  enumOptions?: SelectOption[]
  tooltip?: string
  dropdownDivider?: boolean
  selectAllOption?: boolean
  placeholder?: string
  errorMessage?: string[]
  helptext?: string
  required?: boolean
  explicitOptional?: ExplicitOptionalType
  disabled?: boolean
  hideScrollbar?: boolean
  alwaysOneSelected?: boolean
  maxWordSize?: number
  className?: string
  onChange: (values: SelectOption[]) => void
}

const SelectFieldComponent: ForwardRefRenderFunction<HTMLDivElement, SelectFieldProps> = (
  props: SelectFieldProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  // PROPS
  const {
    label,
    value,
    enumOptions,
    type = 'one',
    selectAllOption,
    placeholder,
    helptext,
    tooltip,
    dropdownDivider,
    errorMessage = [],
    required,
    explicitOptional,
    disabled,
    hideScrollbar,
    alwaysOneSelected,
    maxWordSize,
    className,
    onChange,
  } = props

  const [isDropdownOpened, setIsDropdownOpened] = useState<boolean>(false)
  // info if 'clickOutside event' was invoked by dropdown
  const [isClickedOutsideDropdown, setIsClickedOutsideDropdown] = useState<boolean>(false)
  // info if 'clickOutside event' was invoked by select body
  const [isClickedOutsideSelect, setIsClickedOutsideSelect] = useState<boolean>(false)
  // info if dropdown should be closed (used in combination with clickOutside)
  const [shouldCloseClick, setShouldCloseClick] = useState<boolean>(false)
  const [filter, setFilter] = useState<string>('')
  const [filterRef] = useState<RefObject<HTMLInputElement>>(React.createRef<HTMLInputElement>())
  const clickOutsideRef = useRef<HTMLDivElement>(null)

  const selectClassName = cx(
    'border-form-input-default flex flex-row bg-white rounded-lg border-2 items-center',
    {
      'hover:border-form-input-hover focus:border-form-input-pressed active:border-form-input-pressed':
        !disabled,
      'border-negative-700 hover:border-negative-700 focus:border-negative-700':
        errorMessage?.length > 0 && !disabled,
      'border-form-input-disabled opacity-50': disabled,
    },
  )

  // reset help states when dropdown is opened or closed
  useEffect(() => {
    setIsClickedOutsideSelect(false)
    setIsClickedOutsideDropdown(false)
    setShouldCloseClick(false)
  }, [isDropdownOpened])

  // close dropdown if we click outside of dropdown or select body but not if clicked on arrow icon in select body (shouldCloseClick)
  useEffect(() => {
    if (isClickedOutsideDropdown && !shouldCloseClick && isClickedOutsideSelect) {
      setIsDropdownOpened(false)
    }
  }, [isClickedOutsideDropdown, isClickedOutsideSelect])

  // close dropdown if it was opened and user clicked on arrow icon
  useEffect(() => {
    setIsDropdownOpened(false)
  }, [shouldCloseClick])

  useOnClickOutside(clickOutsideRef, () => {
    setIsClickedOutsideSelect(true)
  })

  const handleOnChangeSelect = (selectedOptions: SelectOption[], close?: boolean) => {
    if (!onChange) return
    if (alwaysOneSelected && selectedOptions.length === 0) {
      selectedOptions.push(enumOptions[0])
    }
    onChange(selectedOptions)
    if (type === 'multiple' || !close) {
      setIsDropdownOpened(true)
    }
  }

  const handleOnRemove = (optionId: number) => {
    const newValue = value ? [...value] : []
    newValue.splice(optionId, 1)
    const close = type !== 'multiple'
    handleOnChangeSelect(newValue, close)
  }

  const handleOnChooseOne = (option: SelectOption, close?: boolean) => {
    if (close) setIsDropdownOpened(false)
    handleOnChangeSelect([option], close)
    setFilter('')
  }

  const handleOnUnChooseOne = (option: SelectOption, close?: boolean) => {
    if (close) setIsDropdownOpened(false)
    handleOnChangeSelect([], close)
  }

  const handleOnChooseMulti = (option: SelectOption) => {
    const newValue = value ? [...value] : []
    newValue.push(option)
    handleOnChangeSelect(newValue)
  }

  const handleOnUnChooseMulti = (option: SelectOption) => {
    const newValue = value
      ? [...value].filter((valueOption) => {
          return valueOption.const !== option.const
        })
      : []
    handleOnChangeSelect(newValue)
  }

  const handleOnSelectFieldClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    const targetClassList = (event.target as Element).classList
    if (!isDropdownOpened && !targetClassList.contains('tag') && !disabled) {
      filterRef.current?.focus()
      setIsDropdownOpened(true)
    }
  }

  const handleOnArrowClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (isDropdownOpened) {
      // thanks to this state, we can ignore handling of 'clickOutside' and use custom behaviour for arrow icon
      // click on arrow icon will open or close in opposite of actual state
      setShouldCloseClick(true)
    } else {
      // if closed, handle it as whole select body
      // click on body of select outside of arrow icon will always keep open dropdown and active filter
      handleOnSelectFieldClick(event)
    }
  }

  const handleOnDeleteLastValue = () => {
    const newValue = value ? [...value] : []
    newValue.pop()
    handleOnChangeSelect(newValue)
  }

  const handleOnSelectAll = () => {
    const newValue = enumOptions ? [...enumOptions] : []
    handleOnChangeSelect(newValue)
  }

  const handleOnDeselectAll = () => {
    handleOnChangeSelect([])
  }

  const handleOnClickOutsideDropdown = () => {
    setIsClickedOutsideDropdown(true)
  }

  // HELPER FUNCTIONS
  const getDropdownValues = (): SelectOption[] => {
    return value ? (type !== 'multiple' && value && value.length > 0 ? [value[0]] : value) : []
  }

  const getFilteredOptions = (): SelectOption[] => {
    return enumOptions
      ? enumOptions.filter((option: SelectOption) =>
          String(option.title).toLowerCase().includes(filter.toLowerCase()),
        )
      : []
  }

  const isRowBold = enumOptions?.some(
    (option: SelectOption) => option.description && option.description !== '',
  )

  // RENDER
  return (
    <section
      className={cx(
        'relative w-full max-w-[200px] xs:max-w-[320px] flex flex-col transition-all',
        className,
      )}
    >
      {/* FIELD HEADER WITH DESCRIPTION AND LABEL */}
      <FieldHeader
        label={label}
        helptext={helptext}
        tooltip={tooltip}
        required={required}
        explicitOptional={explicitOptional}
      />

      {/* SELECT PART */}
      <div className={selectClassName} ref={clickOutsideRef}>
        {/* MAIN BODY OF SELECT */}
        <SelectFieldBox
          ref={ref}
          value={value}
          multiple={type === 'multiple'}
          filter={filter}
          filterRef={filterRef}
          maxWordSize={maxWordSize}
          placeholder={placeholder}
          onRemove={handleOnRemove}
          onRemoveAll={handleOnDeselectAll}
          onFilterChange={setFilter}
          onDeleteLastValue={handleOnDeleteLastValue}
          onClick={handleOnSelectFieldClick}
        />

        {/* DROPDOWN ARROW */}
        <div
          role="button"
          tabIndex={0}
          className="dropdownButton flex flex-col items-center h-10 sm:h-12 cursor-pointer select-none rounded-lg px-3 sm:px-4 [&>svg]:m-1"
          onClick={handleOnArrowClick}
          onKeyPress={(event: React.KeyboardEvent) =>
            handleOnKeyPress(event, () => handleOnArrowClick(event))
          }
        >
          <div className="dropdownButton h-full w-6 items-center relative flex flex-col justify-center">
            {isDropdownOpened ? <ArrowUpIcon /> : <ArrowDownIcon />}
            <div className="dropdownButton absolute inset-0 z-10" />
          </div>
        </div>

        {disabled && <div className="absolute inset-0 rounded-lg z-20" />}
      </div>

      {/* DROPDOWN */}
      <div className="dropdown relative">
        {isDropdownOpened && (
          <Dropdown
            enumOptions={getFilteredOptions()}
            value={getDropdownValues()}
            isRowBold={isRowBold}
            type={type}
            divider={dropdownDivider}
            hideScrollbar={hideScrollbar}
            selectAllOption={selectAllOption}
            maxWordSize={maxWordSize + 5}
            absolute
            onChooseOne={handleOnChooseOne}
            onUnChooseOne={handleOnUnChooseOne}
            onSelectAll={handleOnSelectAll}
            onDeselectAll={handleOnDeselectAll}
            onChooseMulti={handleOnChooseMulti}
            onUnChooseMulti={handleOnUnChooseMulti}
            onClickOutside={handleOnClickOutsideDropdown}
          />
        )}
      </div>

      {/* ERROR MESSAGE */}
      <FieldErrorMessage errorMessage={errorMessage} />
    </section>
  )
}

const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(SelectFieldComponent)
export default SelectField
