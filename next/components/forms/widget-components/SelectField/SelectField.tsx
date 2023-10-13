import { ChevronDownIcon, ChevronUpIcon } from '@assets/ui-icons'
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

import { handleOnKeyPress } from '../../../../frontend/utils/general'
import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'
import Dropdown from './Dropdown'
import SelectFieldBox from './SelectFieldBox'
import { SelectOption } from './SelectOption.interface'

// eslint-disable-next-line no-secrets/no-secrets
/*
 * TODO: Replace with new accessible components
 *
 * For actual SelectField, developers didn't choose any library and implemented it manually for some reason. It causes some problem, mainly it is not accessible in many ways.
 * We want to replace it with new accessible components.
 *
 * Some prototypes are already implemented, but they need some more work.
 *
 * What was done:
 * Firstly, we implemented new single select an combo box (searchable select) using react-aria-component. ==> SelectFieldNew.tsx, ComboBoxNew.tsx
 * Although it is nice and accessible, react-aria doesn't support multi select.
 * So we tried to implement it using react-select. ==> SelectMultiNew.tsx
 * SelectMultiNew supports only multiselect, it is completely styled and accessible.
 * So now we have 3 components:
 *   - SelectFieldNew for single select without search
 *   - ComboBoxNew for single select with search
 *   - SelectMultiNew for multi select without search
 *
 * What needs to be done on multiselect (SelectMultiNew):
 * Crucial: it needs to support optional controlled state (see useControlledState in TimeField)
 * Crucial: usage in SelectFieldWidgetRJSF.tsx - controlled state and transformation of data between react-select and RJSF components
 * It may need better types, see https://react-select.com/typescript
 *
 * What needs to be done on single select (SelectFieldNew):
 * Crucial: it needs to support optional controlled state (see useControlledState in TimeField)
 * Crucial: usage in SelectFieldWidgetRJSF.tsx - controlled state and transformation of data between react-select and RJSF components
 *
 * Note: SingleFieldNew, ComboBoxNew and SelectMultiNew could be potentially replaced by one react-select component.
 *
 * For more info, see github issue: https://github.com/orgs/bratislava/projects/6/views/5?pane=issue&itemId=36527330
 *
 */

type SelectFieldProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'placeholder' | 'className'> & {
    type?: 'one' | 'multiple' | 'arrow' | 'radio'
    value?: SelectOption[]
    enumOptions?: SelectOption[]
    dropdownDivider?: boolean
    selectAllOption?: boolean
    hideScrollbar?: boolean
    alwaysOneSelected?: boolean
    maxWordSize?: number
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
    maxWordSize = 17,
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
    'border-form-input-default flex flex-row items-center rounded-lg border-2',
    {
      'bg-white': !disabled,
      'hover:border-form-input-hover focus:border-form-input-pressed active:border-form-input-pressed':
        !disabled,
      'border-negative-700 hover:border-negative-700 focus:border-negative-700':
        errorMessage?.length > 0 && !disabled,
      'border-form-input-disabled border-gray-300 bg-gray-100 opacity-50': disabled,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (alwaysOneSelected && selectedOptions.length === 0 && enumOptions) {
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
    <div
      className={cx(
        'relative flex w-full max-w-[200px] flex-col transition-all xs:max-w-[320px]',
        className,
      )}
    >
      {/* FIELD HEADER WITH DESCRIPTION AND LABEL */}
      <FieldWrapper
        label={label}
        helptext={helptext}
        tooltip={tooltip}
        required={required}
        explicitOptional={explicitOptional}
        errorMessage={errorMessage}
        disabled={disabled}
      >
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
            disabled={disabled}
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
            className="dropdownButton flex h-10 cursor-pointer select-none flex-col items-center rounded-lg px-3 sm:h-12 sm:px-4 [&>svg]:m-1"
            onClick={handleOnArrowClick}
            onKeyPress={(event: React.KeyboardEvent) =>
              handleOnKeyPress(event, () => handleOnArrowClick(event))
            }
          >
            <div className="dropdownButton relative flex h-full w-6 flex-col items-center justify-center">
              {isDropdownOpened ? <ChevronUpIcon /> : <ChevronDownIcon />}
              <div className="dropdownButton absolute inset-0 z-10" />
            </div>
          </div>

          {disabled && <div className="absolute inset-0 z-20 rounded-lg" />}
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
      </FieldWrapper>
    </div>
  )
}

const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(SelectFieldComponent)
export default SelectField
