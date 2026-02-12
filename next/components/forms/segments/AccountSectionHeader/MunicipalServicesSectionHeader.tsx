import { Dispatch, SetStateAction } from 'react'

import SelectFieldNew, {
  SelectOption,
} from '@/components/forms/widget-components/SelectField/SelectField'

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
      <div className="m-auto flex size-full max-w-(--breakpoint-lg) flex-col justify-end pt-6 pb-4 pl-4 lg:px-0 lg:pt-16 lg:pb-8">
        <h1 className="mb-4 text-h1 md:mb-6">{title}</h1>
        <SelectFieldNew
          label=""
          className="max-w-none pr-4 xs:max-w-[400px]"
          value={selectorValue}
          onChange={(value) => {
            if (!value) return
            setSelectorValue(value)
            setCurrentPage(1)
          }}
          options={enumOptions}
          displayOptionalLabel={false}
        />
      </div>
    </div>
  )
}

export default MunicipalServicesSectionHeader
