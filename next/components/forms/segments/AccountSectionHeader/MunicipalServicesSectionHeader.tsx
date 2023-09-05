import SelectField, {
  SelectOption,
} from 'components/forms/widget-components/SelectField/SelectFieldNew'
import { useTranslation } from 'next-i18next'
import { Dispatch, SetStateAction } from 'react'
import { Options } from 'react-select'

// TODO typing is awkward (Options<SelectOption> vs SelectOption[] - requires extra work to clean up, together with municipal services header refactor)
type MunicipalServicesSectionHeaderBase = {
  title: string
  selectorValue: SelectOption[]
  setSelectorValue: Dispatch<SetStateAction<SelectOption[]>>
  setCurrentPage: Dispatch<SetStateAction<number>>
  selectOptions: Options<SelectOption>
}

const MunicipalServicesSectionHeader = ({
  title,
  selectOptions,
  selectorValue,
  setCurrentPage,
  setSelectorValue,
}: MunicipalServicesSectionHeaderBase) => {
  const { t } = useTranslation('account')
  return (
    <div className="bg-gray-50">
      <span className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end pb-4 pl-4 pt-6 lg:px-0 lg:pb-8 lg:pt-16">
        <h1 className="text-h1 mb-4 md:mb-6">{title}</h1>
        <SelectField
          label=""
          isMulti
          className="max-w-none pr-4 xs:max-w-[400px]"
          value={selectorValue}
          onChange={(val) => {
            setSelectorValue(val as SelectOption[])
            setCurrentPage(1)
          }}
          options={selectOptions}
          placeholder={t('account_section_services.select_field_placeholder')}
        />
      </span>
    </div>
  )
}

export default MunicipalServicesSectionHeader
