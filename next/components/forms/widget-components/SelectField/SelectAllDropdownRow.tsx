import { useTranslation } from 'next-i18next'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'

interface SelectAllDropdownRowProps {
  divider?: boolean
  isEverythingSelected: boolean
  onSelectAll: (isEverythingSelect: boolean) => void
}

const SelectAllDropdownRow = ({
  divider,
  isEverythingSelected,
  onSelectAll,
}: SelectAllDropdownRowProps) => {
  const { t } = useTranslation('forms')
  const handleOnClick = () => {
    onSelectAll(isEverythingSelected)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="dropdown flex h-14 w-full cursor-pointer flex-col bg-white px-5 hover:text-gray-600"
      onClick={handleOnClick}
      onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, handleOnClick)}
    >
      <div className="dropdown flex h-full flex-col justify-center">
        <div className="dropdown flex flex-row justify-center">
          <p className={` dropdown text-16-semibold w-full`}>
            {isEverythingSelected ? t('selectAll') : t('deselectAll')}
          </p>
        </div>
      </div>
      {divider && <div className="dropdown border-form-input-default border-b-2" />}
    </div>
  )
}

export default SelectAllDropdownRow
