import { Dispatch, SetStateAction } from 'react'

import SelectFieldNew, { SelectOption } from '../../widget-components/SelectField/SelectField'

type MunicipalServicesSectionHeaderBase = {
  title: string
  selectorValue: SelectOption
  setSelectorValue: (val: SelectOption) => void
  setCurrentPage: Dispatch<SetStateAction<number>>
  enumOptions: SelectOption[]
}

const MunicipalServicesSectionHeader = ({
  title,
  enumOptions,
  selectorValue,
  setCurrentPage,
  setSelectorValue,
}: MunicipalServicesSectionHeaderBase) => {
  return (
    <div className="bg-gray-50">
      <span className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end pb-4 pl-4 pt-6 lg:px-0 lg:pb-8 lg:pt-16">
        <h1 className="text-h1 mb-4 md:mb-6">{title}</h1>
        <SelectFieldNew
          label=""
          className="max-w-none pr-4 xs:max-w-[400px]"
          value={selectorValue}
          onChange={(val) => {
            if (!val) return
            setSelectorValue(val)
            setCurrentPage(1)
          }}
          options={enumOptions}
        />
      </span>
    </div>
  )
}

export default MunicipalServicesSectionHeader
