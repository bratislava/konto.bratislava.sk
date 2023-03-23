import SelectField, {
  SelectOption,
} from 'components/forms/widget-components/SelectField/SelectField'
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
    <div className="bg-gray-50 mt-16 lg:mt-28">
      <span className="flex flex-col justify-end w-full h-full max-w-screen-lg m-auto pl-4 lg:px-0 pt-6 lg:pt-16 pb-4 lg:pb-8">
        <h1 className="text-h1 mb-4 md:mb-6">{title}</h1>
        <SelectField
          label=""
          className="max-w-none xs:max-w-[384px] pr-4"
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
          maxWordSize={width > 480 ? 22 : 18}
        />
      </span>
    </div>
  )
}

export default MunicipalServicesSectionHeader
