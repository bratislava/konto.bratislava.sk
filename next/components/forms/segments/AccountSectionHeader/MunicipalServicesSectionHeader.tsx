import SelectField from 'components/forms/widget-components/SelectField/SelectField'
import { SelectOption } from 'components/forms/widget-components/SelectField/SelectOption.interface'
import { Dispatch, SetStateAction } from 'react'
import { useWindowSize } from 'usehooks-ts'

type MunicipalServicesSectionHeaderBase = {
  title: string
  selectorValue: SelectOption[]
  setSelectorValue: (val: SelectOption[]) => void
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
  const { width } = useWindowSize()
  return (
    <div className="bg-gray-50">
      <span className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end pb-4 pl-4 pt-6 lg:px-0 lg:pb-8 lg:pt-16">
        <h1 className="text-h1 mb-4 md:mb-6">{title}</h1>
        <SelectField
          label=""
          className="max-w-none pr-4 xs:max-w-[400px]"
          type="one"
          value={selectorValue}
          onChange={(val) => {
            setSelectorValue(val)
            setCurrentPage(1)
          }}
          dropdownDivider
          hideScrollbar
          alwaysOneSelected
          enumOptions={enumOptions}
          maxWordSize={width > 480 ? 45 : 25}
        />
      </span>
    </div>
  )
}

export default MunicipalServicesSectionHeader
